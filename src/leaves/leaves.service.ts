import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { GroupUser } from 'src/user/entities/group-user.entity';
import { Group, Groups } from 'src/user/entities/group.entity';
import { Gender, User } from 'src/user/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { CreateLeafDto } from './dto/create-leaf.dto';
import { UpdateLeafDto } from './dto/update-leaf.dto';
import { Leave } from './entities/leave.entity';
import { LeaveStatus, LeaveStatuses } from './entities/leave_status.entity';
import { LeaveType, LeaveTypes } from './entities/leave_type.entity';
import { LeaveCalc } from './leaves-calculation/entities/leaves_calc.entity';

@Injectable()
export class LeavesService extends TypeOrmCrudService<Leave> {
  
  constructor(
    @InjectRepository(Leave) repo,
    @InjectRepository(LeaveType)
    public leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(LeaveCalc)
    private readonly leaveCalceRepo: Repository<LeaveCalc>,
    @InjectRepository(LeaveStatus)
    private readonly leaveStatuesRepo: Repository<LeaveStatus>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(repo);
  }
  create(createLeafDto: CreateLeafDto) {
    return 'This action adds a new leaf';
  }

  findAll() {
    return `This action returns all leaves`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} leaf`;
  // }

  update(id: number, updateLeafDto: UpdateLeafDto) {
    return `This action updates a #${id} leaf`;
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }

  async getLeavesForApproval(
    options: IPaginationOptions,
    leaveStatus: number,
    groupName: string,
    userId: number,
    LeaveTypeId: number,
  ): Promise<Pagination<Leave>> {
    let filter: string = `user.status != ${RecordStatus.Deleted}`;

    let data = this.repo
      .createQueryBuilder('leave')
      .leftJoinAndMapOne(
        'leave.leave_type',
        LeaveType,
        'leavetype',
        'leavetype.id = leave.leaveTypeId',
      )
      .leftJoinAndMapOne(
        'leave.request_by',
        User,
        'user',
        `user.id = leave.requestById `,
      )     .leftJoinAndMapOne(
        'leave.final_respond_by',
        User,
        'ceo',
        'ceo.id = leave.finalRespondById',
      )
      .leftJoinAndMapOne(
        'leave.hod_respond_by',
        User,
        'hod',
        'hod.id = leave.hodRespondById',
      )
      .leftJoinAndMapOne(
        'leave.tl_respond_by',
        User,
        'tl',
        'tl.id = leave.tlRespondById',
      ).leftJoinAndMapOne(
        'leave.final__state',
        LeaveStatus,
        'finalstatus',
        'finalstatus.id = leave.final_stateId',
      ).leftJoinAndMapOne(
        'leave.hod_recommendation_state',
        LeaveStatus,
        'hodstatus',
        'hodstatus.id = leave.hodRecommendationStateId',
      ) .leftJoinAndMapOne(
        'leave.tl_recommendation_state',
        LeaveStatus,
        'teamleadstatus',
        'teamleadstatus.id = leave.tlRecommendationStateId',
      ).leftJoinAndMapOne(
        'leave.no_pay_leave_request_by',
        User,
        'no_pay_leave_request_by',
        'no_pay_leave_request_by.id = leave.noPayLeaveRequestById',
      );
    if (userId != 0) {
      if (filter) {
        filter = `${filter}  and user.id = :userId`;
      } else {
        filter = `user.id = :userId`;
      }
    }
    if (LeaveTypeId != 0) {
      if (filter) {
        filter = `${filter}  and leavetype.id = :LeaveTypeId`;
      } else {
        filter = `leavetype.id = :LeaveTypeId`;
      }
    }
    if (groupName == Groups.CEO) {
     
      if (filter) {
        filter = `${filter}  and finalstatus.value = :leaveStatus`;
      } else {
        filter = `finalstatus.value = :leaveStatus`;
      }
    } else if (groupName == Groups.HOD) {
     
      if (filter) {
        filter = `${filter}  and hodstatus.value = :leaveStatus and leavetype.name != '${LeaveTypes.MATERNITY_LEAVE}'`;
      } else {
        filter = ` hodstatus.value = :leaveStatus and leavetype.name != '${LeaveTypes.MATERNITY_LEAVE}'`;
      }
    } else {
      data = data .leftJoinAndMapOne(
          'user.groupuser',
          GroupUser,
          'groupuser',
          'groupuser.userId = user.id',
        )
        .leftJoinAndMapOne(
          'groupuser.group',
          Group,
          'group',
          'groupuser.groupId = group.id',
        );
      if (filter) {
        filter = `${filter}  and teamleadstatus.value = :leaveStatus   and group.name= :groupName and leavetype.name not in   ('${LeaveTypes.MATERNITY_LEAVE}','${LeaveTypes.MEDICAL}')`;
      } else {
        filter = `teamleadstatus.value = :leaveStatus  and group.name= :groupName and leavetype.name not in  ('${LeaveTypes.MATERNITY_LEAVE}','${LeaveTypes.MEDICAL}')`;
      }
    }

    data = data
      .where(filter, { leaveStatus, groupName, LeaveTypeId, userId })
      .orderBy('leave.createdOn', 'DESC');

    let resualt = await paginate(data, options);
    // console.log('resualt..', resualt);
    if (resualt) {
      return resualt;
    }
  }

  async getMyLeaves(
    options: IPaginationOptions,
    leaveStatus: number,
    userId: number,
    LeaveTypeId: number,
  ): Promise<Pagination<Leave>> {
    let filter: string = '';

    if (userId != 0) {
      if (filter) {
        filter = `${filter}  and user.id = :userId`;
      } else {
        filter = `user.id = :userId`;
      }
    }
    if (LeaveTypeId != 0) {
      if (filter) {
        filter = `${filter}  and leavetype.id = :LeaveTypeId`;
      } else {
        filter = `leavetype.id = :LeaveTypeId`;
      }
    }


    if (filter) {
      filter = `${filter}  and finalstatus.value = :leaveStatus`;
    } else {
      filter = `finalstatus.value = :leaveStatus`;
    }
    let data = this.repo
      .createQueryBuilder('leave')
      .leftJoinAndMapOne(
        'leave.leave_type',
        LeaveType,
        'leavetype',
        'leavetype.id = leave.leaveTypeId',
      )
      .leftJoinAndMapOne(
        'leave.final_respond_by',
        User,
        'ceo',
        'ceo.id = leave.finalRespondById',
      )
      .leftJoinAndMapOne(
        'leave.hod_respond_by',
        User,
        'hod',
        'hod.id = leave.hodRespondById',
      )
      .leftJoinAndMapOne(
        'leave.tl_respond_by',
        User,
        'tl',
        'tl.id = leave.tlRespondById',
      )
      .leftJoinAndMapOne(
        'leave.request_by',
        User,
        'user',
        'user.id = leave.requestById',
      )
      .leftJoinAndMapOne(
        'leave.final__state',
        LeaveStatus,
        'finalstatus',
        'finalstatus.id = leave.final_stateId',
      )  .leftJoinAndMapOne(
        'leave.tl_recommendation_state',
        LeaveStatus,
        'teamleadstatus',
        'teamleadstatus.id = leave.tlRecommendationStateId',
      ).leftJoinAndMapOne(
        'leave.hod_recommendation_state',
        LeaveStatus,
        'hodstatus',
        'hodstatus.id = leave.hodRecommendationStateId',
      );
   

    data = data
      .where(filter, { leaveStatus, LeaveTypeId, userId })
      .orderBy('leave.createdOn', 'DESC');

    let resualt = await paginate(data, options);
    // console.log('resualt..', resualt);
    if (resualt) {
      return resualt;
    }
  }

  async getAllMyLeavedetails(id: number) {
    let leaves = await this.repo.find({
      where: { request_by: { id: id } },
    });
    return leaves;
  }
  async getLeavedetails(id: number): Promise<LeaveCalc> {
    let leaveDetails = await this.leaveCalceRepo.findOne({
      where: { user: { id: id } },
    });
    // console.log('leaveDetails', leaveDetails);
    return leaveDetails;
  }
  async getLeaveTypes(id:number): Promise<LeaveType[]> {
    const target = LeaveTypes.MATERNITY_LEAVE;
    let leaveTypesArr = await this.leaveTypeRepo.find();
    let userdtails = await this.userRepo.findOne({
      where: { id:id },
    });
    console.log(userdtails.gender, "user")
    if(userdtails.gender === Gender.Male){
      let filteredArray = leaveTypesArr.filter(x => x.name !== target );
      // filteredArray.find(x=>console.log(x.name))
      return filteredArray;
    }
    else if(userdtails.gender ===Gender.Female){
      // leaveTypesArr.find(x=>console.log(x.name))
      return leaveTypesArr;
      
    }
    // console.log('leavetypes', leaveTypesArr);
    
  }

  async getAllLeaveSummary(): Promise<LeaveCalc[]>{
    let leaveSummary = await this.leaveCalceRepo.find();
    return leaveSummary;
  }
  async getLeaveStatusByValue(statusValue: number): Promise<LeaveStatus> {
    console.log( await this.leaveStatuesRepo.findOne({where:{value:statusValue}}))
    return await this.leaveStatuesRepo.findOne({where:{value:statusValue}});
  }

  async saveLeaves(leave: Leave): Promise<Leave> {
    if(leave.id){
      leave.editedOn=new Date();
    }else{
      leave.createdOn=new Date();
      let leave_status=new LeaveStatus()
      leave_status.id=1;
      leave.final__state=leave_status;
      leave.hod_recommendation_state=leave_status;
      leave.tl_recommendation_state=leave_status;
    }
   
    
    let savedleave = await this.repo.save(leave);
   
    

    console.log('leave', savedleave);

    return savedleave;
  }

  async changeLeaveStatus(){
    

  }

 async  getThisWeekLeaves() {
    let leaves = await this.repo.find({relations:['request_by'],where:{request_by:{ status:Not(RecordStatus.Deleted)}
    },order: {
      leave_starting_date: 'DESC',
      
    },});
    let leavesThisWeek :Leave[]=[];
    for (let leave of await leaves) {
      let a = this.diff_weeks(leave.leave_starting_date);
      if (a === 0){
        leavesThisWeek.push(leave);
      }
    }
    return leavesThisWeek;
  }
  diff_weeks( dt1:any) {
    let dateNow =new Date();
    var diff =(dateNow.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
    
  }
}
