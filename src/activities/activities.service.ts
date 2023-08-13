import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Project } from 'src/project/entities/project.entity';
import { getConnection, getManager, In, Not, Repository } from "typeorm";
import { Activity } from './entities/activity.entity';
import { ActivityStatus } from './enum/activity-status.enum';

@Injectable()
export class ActivitiesService extends TypeOrmCrudService<Activity> {

  constructor(
    @InjectRepository(Activity) repo,

    @InjectRepository(Project)
    public projectRepo: Repository<Project>,
  ) {
    super(repo);
  }

  async create(activityDto: Activity): Promise<Activity> {

    console.log("========", activityDto.planned_start_date)
    activityDto.planned_start_date = new Date(activityDto.planned_start_date)
    activityDto.planned_end_date = new Date(activityDto.planned_end_date)
    activityDto.deadline = new Date(activityDto.deadline)


    if (!activityDto.project.id) {
      activityDto.project = null
    }
    //TODO: planned Mds reccursion
    const activity = await this.repo.save(activityDto);
    return activity
  }


  async update(id: number, activityDto: Activity): Promise<Activity> {

    if (activityDto.assign_to === undefined) {
      activityDto.assign_to = null
    }
    activityDto.planned_start_date = new Date(activityDto.planned_start_date)
    activityDto.planned_end_date = new Date(activityDto.planned_end_date)
    if (activityDto.actual_start_date) { activityDto.actual_start_date = new Date(activityDto.actual_start_date) }
    if (activityDto.actual_end_date) { activityDto.actual_end_date = new Date(activityDto.actual_end_date) }


    if (!activityDto.project.id) {
      activityDto.project = null
    }

    activityDto.deadline = new Date(activityDto.deadline)
    const activity = await this.repo.save(activityDto);
    return activity
  }


  async getAllActivities(): Promise<Activity[]> {

    let res = await this.repo.find({ relations: ['parent_activity', 'childActivities'] });
    console.log(res)
    return res
  }


  async getAllActivitiesByProjId(pId: number): Promise<Activity[]> {

    let res = await this.repo.find({
      relations: ['parent_activity', 'childActivities'],
      where: {
        project: { id: +pId },
        status: Not(-20)
      },
    });
    // console.log(res)
    return res
  }


  async createCopyListByPID(pId: number, newpId: number): Promise<any> {
    let Exactivities = this.getAllActivitiesByProjId(pId)
    const newProject = await this.projectRepo.findOne({
      where: {
        id: newpId,
      },

    })

    try {
      for (const activity of await Exactivities) {
        if (!activity.parent_activity) {
          console.log("root name--", activity.name)
          const processedActivities = new Set<number>();
          const newActivity = new Activity();
          newActivity.name = activity.name;
          newActivity.activity_level = activity.activity_level;
          newActivity.activity_type = activity.activity_type;
          newActivity.code = activity.code;
          newActivity.deadline = (activity.deadline == null || activity.deadline === undefined) ? new Date() : activity.deadline;
          newActivity.assign_to = activity.assign_to;
          newActivity.assign_by = activity.assign_by;
          newActivity.planned_MD = activity.planned_MD;
          newActivity.planned_start_date = activity.planned_start_date;
          newActivity.planned_end_date = activity.planned_end_date;
          newActivity.project = newProject
          newActivity.parent_activity = null
          const savedActivity = await this.repo.save(newActivity);
          processedActivities.add(savedActivity.id);

          await updateActivitiesWithParent.call(this, savedActivity.id, activity.id, processedActivities);
        }
      }
      async function updateActivitiesWithParent(updated_parentId: number, parentId: number, processedActivities: Set<number>) {
        const childActivities = await this.getChildActs(parentId);

        for (const child of childActivities) {
          if (!processedActivities.has(child.id)) {
            processedActivities.add(child.id);
            console.log("cname---", child.name)
            const childAct = new Activity();
            childAct.name = child.name;
            childAct.activity_level = child.activity_level;
            childAct.activity_type = child.activity_type;
            childAct.code = child.code;
            childAct.deadline = (child.deadline == null || child.deadline === undefined) ? new Date() : child.deadline;
            childAct.assign_to = child.assign_to;
            childAct.assign_by = child.assign_by;
            childAct.planned_MD = child.planned_MD;
            childAct.planned_start_date = child.planned_start_date;
            childAct.planned_end_date = child.planned_end_date;
            childAct.project = newProject
            childAct.parent_activity = await this.repo.findOne({ where: { id: updated_parentId } });
            await this.repo.save(childAct);
            await updateActivitiesWithParent.call(this, childAct.id, child.id, processedActivities); // recursively update child activities
          }
        }
      }
      return { message: 'Copy list created successfully' };

    } catch (error) {
      console.error(error);
      return { error: 'An error occurred while creating the copy list' };
    }

  }


  async getActivityById(id: number): Promise<Activity> {
    let res = this.repo.findOne({

      where: {
        id: id,
      },

    })

    return res
  }


  async deleteActivities(pid: number) {

    let childs = await this.getChildActs(pid)
    let cids = childs.map(c => c.id);
    let updated = this.repo.update({ id: In([...cids, pid]) }, { status: -20 });
    console.log(cids)


  }


  async getChildActs(pid: number) {

    let childActivities = [];
    let queue = [pid];

    while (queue.length > 0) {
      const parentId = queue.shift();
      const childResults = await this.repo.findBy({ parent_activity: { id: parentId } });
      const childIds = childResults.map(child => child.id);
      childActivities.push(...childResults);
      queue.push(...childIds);
    }
    return childActivities


  }




  async getAssignActivities(userId: number, fuid: number, uRole: string, actStatus: any, projectId: any, dates: string[]): Promise<Activity[]> {

    // console.log("qerydata", {
    //   userId: userId,
    //   fuid: fuid,
    //   uRole: uRole,
    //   actS: actStatus,
    //   projectid: projectId
    // })
    let startdate: any;
    let enddate: any;

    let filter: string = 'au.status <> -20';
    if (uRole !== "CEO") {
      if (userId != undefined && userId > 0) {
        if (filter) {
          filter = `${filter}  and assign_to.id = :userId`;
        } else {
          filter = `assign_to.id = :userId`;
        }
      }
    }

    else if ((uRole == "CEO") && (fuid !== 0)) {

      if (filter) {
        filter = `${filter}  and assign_to.id = :fuid`;
      } else {
        filter = `assign_to.id = :fuid`;

      }

    }
    if (+actStatus !== 0) {
      if (filter) {
        filter = `${filter}  and au.activityStatus = :actStatus`;
      } else {
        filter = ` au.activityStatus = :actStatus`;

      }
    }
    if (+projectId !== 0) {
      if (filter) {
        filter = `${filter}  and au.projectId = :projectId`;
      } else {
        filter = ` au.projectId = :projectId`;

      }
    }
    if (dates && dates.length > 0 && dates[0] !== 'null' && dates[1] !== 'null') {

      startdate = new Date(dates[0]);
      startdate.setHours(0, 0, 0, 0);
      enddate = new Date(dates[1]);
      enddate.setHours(23, 59, 59, 999);

      if (filter) {

        filter = `${filter}  and (au.planned_start_date <= :enddate and au.planned_end_date >= :startdate)`;
      } else {
        filter = ` (au.planned_start_date <= :enddate and au.planned_end_date >= :startdate)`;

      }
    }

    let data = this.repo.createQueryBuilder('au')
      .leftJoinAndSelect(
        'au.assign_by',
        'assign_by',
        'assign_by.id = au.assign_by'
      )
      .leftJoinAndSelect(
        'au.assign_to',
        'assign_to',
        'assign_to.id = au.assign_to'
      ).leftJoinAndSelect(
        'au.project',
        'project',
        // 'project.id = au.project'
      ).where(filter, { userId, fuid, actStatus, projectId, startdate, enddate })

    let datas = await data.getMany()
    return data.getMany()

  }

  async updateNextWeekActivityMDs(id: number, fromDate: Date, toDate: Date, weekMDs: number): Promise<Activity> {

    const updateActivityWMDs = await this.repo.update(
      { id: id },
      { fromDate: fromDate, toDate: toDate, week_MD: weekMDs },
    );
    return updateActivityWMDs[0]

  }



  async getActivitiesForWeekPlan(
    options: IPaginationOptions,
    userId: number,
    uRole: string,
    dates: string[]
  ): Promise<Pagination<Activity>> {
    const currentDate = new Date();
    const firstDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
    const lastDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7))
    let startdate: any;
    let enddate: any;
    let filter: string = 'au.status <> -20';

    if (userId != undefined && userId > 0) {
      if (filter) {
        filter = `${filter}  and assign_to.id = :userId`;
      } else {
        filter = `assign_to.id = :userId`;
      }
    }

    if (dates && dates.length > 0 && dates[0] !== 'null' && dates[1] !== 'null') {
      startdate = new Date(dates[0]);
      startdate.setHours(0, 0, 0, 0);
      enddate = new Date(dates[1]);
      enddate.setHours(23, 59, 59, 999);

      if (filter) {

        filter = `${filter}  and (au.fromDate <= :enddate and au.toDate >= :startdate)`;
      } else {
        filter = ` (au.fromDate <= :enddate and au.toDate >= :startdate)`;

      }
    } else if (!dates) {

      if (filter) {

        filter = `${filter}  and (au.fromDate <= :lastDate and au.toDate >= :firstDate)`;
      } else {
        filter = ` (au.fromDate <= :lastDate and au.toDate >= :firstDate)`;

      }
    }


    let data = this.repo.createQueryBuilder('au')
      .leftJoinAndSelect(
        'au.assign_by',
        'assign_by',
        'assign_by.id = au.assign_by'
      )
      .leftJoinAndSelect(
        'au.assign_to',
        'assign_to',
        'assign_to.id = au.assign_to'
      ).leftJoinAndSelect(
        'au.project',
        'project',
        'project.id = au.project'
      )

      .where(filter, { startdate, enddate, firstDate, lastDate, userId })

    let resualt = await paginate(data, options);

    return resualt

  }



}
