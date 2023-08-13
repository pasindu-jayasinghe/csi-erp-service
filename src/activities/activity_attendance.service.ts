import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm/lib/typeorm-crud.service";
import { IPaginationOptions, paginate, Pagination } from "nestjs-typeorm-paginate";
import { Leave } from "src/leaves/entities/leave.entity";
import { Between, Not, Repository } from "typeorm";
import { Activity } from "./entities/activity.entity";
import { ActivityAttendance } from "./entities/activity_attendance.entity";
import { GeneralTask } from "./entities/general_task.entity";
import { ActivityStatus } from "./enum/activity-status.enum";




@Injectable()
export class ActivitiyAttendanceService extends TypeOrmCrudService<ActivityAttendance> {
  updatedUsed_MD: number;
  startDate: boolean = false
  constructor(
    @InjectRepository(ActivityAttendance) repo,
    @InjectRepository(Activity)
    public activityRepo: Repository<Activity>,

    @InjectRepository(GeneralTask)
    public gTaskRepo: Repository<GeneralTask>,
  ) {

    super(repo);
  }


  async create(id: number, activityAttendDto: ActivityAttendance): Promise<ActivityAttendance> {
    activityAttendDto.date = new Date()
    const spentMDs = activityAttendDto.spent_MD
    let activity = await this.activityRepo.findOne({

      where: {
        id: activityAttendDto.activity.id,
      },

    })
    this.updatedUsed_MD = +activity.used_MD + +spentMDs

    // if (activityAttendDto.date > activity.deadline) {
    //   activity.activityStatus = ActivityStatus.OVERDUE
    // }

    if ((activity.progress == 0) && (activityAttendDto.daily_progress > 0)) {
      activity.actual_start_date = new Date()
      activity.activityStatus = ActivityStatus.INPROGRESS
    }
    if (activityAttendDto.daily_progress == 100) {
      activity.activityStatus = ActivityStatus.COMPLETED

      activity.actual_end_date = new Date()
    }
    activity.used_MD = +this.updatedUsed_MD.toFixed(2)
    activity.progress = activityAttendDto.daily_progress

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);


    const existingRecord = await this.repo.findOne({
      where: {
        date: Between(startOfDay, endOfDay),
        activity: { id: +activity.id }
      },
    });

    if (existingRecord) {
      console.log("already exists")

    }
    else {

      let updatedActivity = await this.activityRepo.save(activity)
      let ACT = await this.getActWithParent(updatedActivity)
      await this.updateParentProgress(ACT[0])

      const activityAttend = await this.repo.save(activityAttendDto);
      return activityAttend
    }


  }


  async update(id: number, activityAttendDto: ActivityAttendance): Promise<ActivityAttendance> {
    activityAttendDto.date = new Date()
    const spentMDs = activityAttendDto.spent_MD

    let activity_attendance = await this.repo.findOne({
      where: {
        id: activityAttendDto.id
      },

    })

    let activity = await this.activityRepo.findOne({
      where: {
        id: activityAttendDto.activity.id,
      },

    })
    this.updatedUsed_MD = +activity.used_MD + +spentMDs - activity_attendance.spent_MD;


    if ((activity.progress == 0) && (activityAttendDto.daily_progress > 0)) {
      activity.actual_start_date = new Date()
    }

    if (activityAttendDto.daily_progress == 0) {
      activity.activityStatus = ActivityStatus.TODO

    }
    if (activityAttendDto.daily_progress > 0 && activityAttendDto.daily_progress < 100) {
      activity.activityStatus = ActivityStatus.INPROGRESS

    }
    if (activityAttendDto.daily_progress == 100) {
      activity.actual_end_date = new Date()
      activity.activityStatus = ActivityStatus.COMPLETED

    }
    activity.used_MD = +this.updatedUsed_MD.toFixed(2)
    activity.progress = +activityAttendDto.daily_progress
    let updatedActivity = await this.activityRepo.save(activity)

    let ACT = await this.getActWithParent(updatedActivity)
    await this.updateParentProgress(ACT[0])

    const activityAttend = await this.repo.save(activityAttendDto);

    return activityAttend
  }



  async remove(id: number): Promise<any> {

    let activity_attendance = await this.repo.findOne({
      where: {
        id: +id
      },

    })

    let activity = await this.activityRepo.findOne({
      where: {
        id: activity_attendance.activity.id,
      },

    })
    activity.activityStatus = ActivityStatus.TODO


    this.updatedUsed_MD = +activity.used_MD - activity_attendance.spent_MD;

    if (activity.actual_start_date == activity_attendance.date) {
      activity.actual_start_date = null
    }
    if (activity_attendance.daily_progress == 100) {
      activity.actual_end_date = null
    }
    activity.used_MD = +this.updatedUsed_MD.toFixed(2)

    let previouActivityAttend = await this.repo.findOne({
      where: {
        activity: { id: +activity.id },
        id: +id - 1
      },

    })

    if (previouActivityAttend ?? false) {

      activity.progress = previouActivityAttend.daily_progress;

    } else {
      activity.progress = 0;

    }

    let updatedActivity = await this.activityRepo.save(activity)
    let ACT = await this.getActWithParent(updatedActivity)
    await this.updateParentProgress(ACT[0], activity_attendance.date)
    return await this.repo.delete(+id);

  }



  async updateParentProgress(act: Activity, date?: any) {//progress update with MDs
    if (act.parent_activity !== undefined && act.parent_activity !== null) {
      let pTotal = 0
      let pTMDs = 0
      let allComplete = true
      let allTODO = true;

      let pAct = act.parent_activity;
      let res = await this.activityRepo.findBy({
        parent_activity: { id: pAct.id },
        status: Not(-20)
      })

      for (var a of res) {
        pTotal += a.progress;
        pTMDs += a.used_MD;

        if (a.activityStatus !== ActivityStatus.COMPLETED) {
          allComplete = false;
        }

        if (a.activityStatus !== ActivityStatus.TODO) {
          allTODO = false;
        }
      }

      if (allComplete) {
        pAct.activityStatus = ActivityStatus.COMPLETED;
      } else if (allTODO) {
        pAct.activityStatus = ActivityStatus.TODO;
      } else {
        pAct.activityStatus = ActivityStatus.INPROGRESS;
      }

      pAct.progress = +(pTotal / res.length).toFixed(2);
      pAct.used_MD = +pTMDs.toFixed(2);
      if (pAct.progress == 100) { pAct.actual_end_date = new Date() } else {
        pAct.actual_end_date = null
      }
      if (!pAct.actual_start_date) { pAct.actual_start_date = new Date() }
      if (pAct.actual_start_date) {

        if (pAct.actual_start_date == date) {

          pAct.actual_start_date = null
        }
      }

      let actWithUpdatedPro = await this.activityRepo.save(pAct)
      let actWP = await this.getActWithParent(actWithUpdatedPro)

      this.updateParentProgress(actWP[0], date)
    } else { console.log("No Parent") }
  }



  async getActWithParent(actWIthotParent: Activity) {

    let actWithParent = await this.activityRepo.find({
      relations: ['parent_activity', 'childActivities'],
      where: {
        id: actWIthotParent.id

      },
    })
    return actWithParent

  }


  async getActiviyAttendance(
    options: IPaginationOptions,
    date: Date,
    userId: number,
    hasDate: string

  ): Promise<Pagination<ActivityAttendance>> {
    let filter: string = '';
    let datestr = date.toLocaleString().substring(0, 10);
    const startOfDay = new Date(datestr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(datestr);
    endOfDay.setHours(23, 59, 59, 999);

    if (userId != undefined && userId > 0) {
      if (filter) {
        filter = `${filter}  and assign_to.id = :userId`;
      } else {
        filter = `assign_to.id = :userId`;
      }
    }
    if (hasDate === "true") {
      if (filter) {
        filter = `${filter}  and aa.date >= :startOfDay and aa.date <= :endOfDay`;
      } else {
        filter = `aa.date >= :startOfDay and aa.date <= :endOfDay`;
      }
    }
    let data = this.repo.createQueryBuilder('aa')
      .leftJoinAndSelect(
        'aa.activity',
        'activity',
        'activity.id = aa.activity'
      ).leftJoinAndSelect(
        'activity.project',
        'project',
        'project.id = activity.project'
      ).leftJoinAndSelect(
        'activity.assign_to',
        'assign_to',
        'assign_to.id = activity.assign_to'
      ).where(filter, { userId, startOfDay,endOfDay})
      .orderBy('aa.date', 'DESC');

    let resualt = await paginate(data, options);

    return resualt








  }


  async getActivityAttendById(id: number): Promise<ActivityAttendance> {
    let res = this.repo.findOne({

      where: {
        id: id,
      },

    })

    return res
  }


  async updateFeedBack(id: number, csiFeedBack: string| undefined, staffFeedBack: string | undefined): Promise<ActivityAttendance> {

    const updateAtend = await this.repo.update(
      { id: id },
      { csiFeedBack: csiFeedBack, staffFeedBack: staffFeedBack },
    );

    return updateAtend[0]

  }


  
  async updateAcceptance(id: number, acceptance: string| undefined): Promise<ActivityAttendance> {

    const updateAccept = await this.repo.update(
      { id: id },
      { acceptance: acceptance },
    );

    return updateAccept[0]

  }

}
