import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotAcceptableException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeafDto } from './dto/create-leaf.dto';
import { UpdateLeafDto } from './dto/update-leaf.dto';
import { LeavesCalculationService } from './leaves-calculation/leaves-calculation.service';
import { Cron } from '@nestjs/schedule';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Leave } from './entities/leave.entity';
import { LeaveCalc } from './leaves-calculation/entities/leaves_calc.entity';
import { LeaveStatus, LeaveStatuses } from './entities/leave_status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utills/file-upload.utils';
import { EmailNotificationService } from 'src/notifications/email.notification.service';
import { UserService } from 'src/user/user.service';
import { LeaveType, LeaveTypes } from './entities/leave_type.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuditService } from 'src/audit/audit.service';

@Controller('leaves')
@ApiTags('Leaves')
export class LeavesController {
  constructor(
    private readonly leavesService: LeavesService,
    private readonly leavesCalService: LeavesCalculationService,
    private readonly emailService: EmailNotificationService,
    private readonly userService: UserService,
    private readonly auditService:AuditService,
    
  ) {}

  @Cron(new Date(new Date().getFullYear() + 1, 0, 2), {
    // next year January 1st
    name: 'calulateInitialLeavesPerYear',
  })
  async handleCronLeaveInitiate() {
    await this.leavesCalService.calulateInitialLeavesPerYear();
    console.log('crone job completed for initial leaves at 1st of January');
  }

  @Cron('10 0 1 * *', {
    // calculate half days at every month 1st
    name: 'calulateShortLeaves',
  })
  async handleCronshortLeaves(userId: number) {
    await this.leavesCalService.calculateShortLeaves();
    console.log('crone job completed for 1st of each month');
  }

  @Post()
  create(@Body() createLeafDto: CreateLeafDto) {
    return this.leavesService.create(createLeafDto);
  }

  @Get()
  findAll() {
    return this.leavesService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.leavesService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeafDto: UpdateLeafDto) {
    return this.leavesService.update(+id, updateLeafDto);
  }

  @Delete(':id')
  async remove(@Body() leave: Leave) {
    if (
      (
        await this.leavesService.findOne({
          where: {
            id: leave.id,
          },
        })
      ).final__state.value != LeaveStatuses.PENDING
    ) {
      throw  new NotAcceptableException()
    }
    console.log(leave);
    await this.leavesCalService.leaveAdding(leave);
    return await this.leavesService.remove(+leave.id);
  }

  @Get('getLeavesForApproval')
  async getLeavesForApproval(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('leaveStatus') leaveStatus: number,
    @Query('groupName') groupName: string,
    @Query('userId') userId: number,
    @Query('leavTypeId') leavTypeId: number,
  ): Promise<any> {
    return await this.leavesService.getLeavesForApproval(
      {
        limit: limit,
        page: page,
      },
      leaveStatus,
      groupName,
      userId,
      leavTypeId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('getMyLeaves')
  async getMyLeaves(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('leaveStatus') leaveStatus: number,
    @Query('userId') userId: number,
    @Query('leavTypeId') leavTypeId: number,
  ): Promise<any> {
    return await this.leavesService.getMyLeaves(
      {
        limit: limit,
        page: page,
      },
      leaveStatus,

      userId,
      leavTypeId,
    );
  }

  // @Get('getMyLeaveslist')
  // getMyLeaveslist(@Param('id') id: string) {
  //   return this.leavesService.findOne(+id);
  // }

  @Post('date-calculator')
  dateCalculator(@Query('id') id: number) {
    console.log("id to cal", id)
    return this.leavesCalService.calculateInitialLeavesPerUser(id);
  }
  @Post('testShortLeaves')
  testShortLeaves() {
    return this.leavesCalService.calculateShortLeaves();
  }
  @Post('testInitialLeaves')
  testInitialLeaves() {
    return this.leavesCalService.calulateInitialLeavesPerYear();
  }

  @Get('getAllMyLeavedetails')
  getAllMyLeavedetails(@Param('id') id: number) {
    return this.leavesService.getAllMyLeavedetails(id);
  }

  @Get('leaveDetails')
  async getLeavedetails(@Query('id') id: number): Promise<LeaveCalc> {
    console.log('id from FE', id);
    return await this.leavesService.getLeavedetails(id);
  }

  @Get('leaveTypes')
  getLeaveTypes(@Query('id') id: number) {
    console.log('user id', id);
    return this.leavesService.getLeaveTypes(id);
  }
  @Post('saveLeave')
  async saveLeaves(@Body() leave: Leave) {
    // console.log('requested leave', leave);
    
    let user =await this.userService.getUserbyID(leave.request_by.id)
    let startDate = new Date(leave.leave_starting_date)
    let endDate = new Date(leave.leave_end_date)
    let emails:string[]=['buddika@climatesi.com'];
    // let emails:string[]=['dilanka@climatesi.com'];
    let TL = await this.userService.getTL(user.groupUser[0]?.group.name)
    console.log('TL', TL.length,TL,user.groupUser[0]?.group.name);
    let HOD = await this.userService.getHOD();
    if (HOD !== undefined && HOD.length !== 0) {
      HOD.forEach(element => emails.push(element.user_email))
    }
    if (TL !== undefined && TL.length !== 0) {
      emails.push(TL[0].user_email)
    }
    if (leave.leave_type.name === LeaveTypes.NO_PAY_LEAVE_UNAUTHORIZED){
      emails.push(user.email)
    }
    console.log("emails",emails)
    var template =  
     
     `${leave.leave_type.name !== LeaveTypes.NO_PAY_LEAVE_UNAUTHORIZED ? `Requested by : ${user.first_name}`  :`Requested by : ${leave.no_pay_leave_request_by.first_name}
     <br/>Employee on leave: ${user.first_name }`}
     <br/>Leave type: ${leave.leave_type.name }
     <br/>Leave starting date & time:  
    ${Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'medium',timeZone: 'Asia/Colombo'}).format(startDate)}
    <br/>Leave ending date & time: 
    ${Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'medium',timeZone: 'Asia/Colombo'}).format(endDate)}
    <br/>MDs: 
    ${leave.man_days}
    <br/>  <br/> 
    <a href="https://erp.climatesi.com/erp/auth/login"> click here to navigate to ERP-ClimateSI</a>`;
    let resemail= await this.emailService.sendMail(
      emails,
      'Leave request',
      '',
      template,
    );
    this.leavesService.saveLeaves(leave);
    this.leavesCalService.leaveReducing(leave);
    let username:any;
    leave.leave_type.name === LeaveTypes.NO_PAY_LEAVE_UNAUTHORIZED?username=leave.no_pay_leave_request_by.first_name:username=user.first_name;
      
   

    let leaveAudit:any = {

      description: leave.leave_type.name ,
      userName: username,
      actionStatus: "Leave requested",
      userType: user.employee_types,
      uuId: user.id,

    }
    console.log("leaveAudit",leaveAudit)
    this.auditService.create(leaveAudit)
    return;
  }

  @Get('leaveCalculation')
  async leaveCalculation(@Param('id') id: number) {
    await this.handleCronLeaveInitiate();
  }
  @Get('shortleaveCalculation')
  async shortleaveCalculation(@Param('id') id: number) {
    await this.handleCronshortLeaves(id);
  }
  @Post('changeLeaveStatus')
  async changeLeaveStatus(@Body() leave: Leave) {
    console.log('chanagelecve', leave);
    
    let status = await this.getLeaveStatusByValue(leave.final__state.id)
    let user =await this.userService.getUserbyID(leave.request_by.id)
    let TL = await this.userService.getTL(user.groupUser[0]?.group.name)
    let emails:string[] =[user.email];
    if ( leave.leave_type.name === LeaveTypes.NO_PAY_LEAVE_UNAUTHORIZED && (TL !== undefined && TL.length !== 0)) {
     emails.push(TL.user_email)
    }
    
    let startDate = new Date(leave.leave_starting_date)
    let endDate = new Date(leave.leave_end_date)
    var template = 
    `${leave.leave_type.name !== LeaveTypes.NO_PAY_LEAVE_UNAUTHORIZED ? `Requested by : ${user.first_name}`  :`Requested by : ${leave.no_pay_leave_request_by.first_name}
    <br/>Employee onleave: ${user.first_name }`}
    <br/>Leave type: ${leave.leave_type.name }
    <br/>Leave starting date & time:  
   ${Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'medium',timeZone: 'Asia/Colombo'}).format(startDate)}
   <br/>Leave ending date & time: 
   ${Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'medium',timeZone: 'Asia/Colombo'}).format(endDate)}
   <br/>MDs: 
   ${leave.man_days}
    <br/>Approval status: 
    ${status.name}
    <br/>Final feedback: 
   ${ leave.final_state_feedback}
     <br/> <br/> 
    <a href="https://erp.climatesi.com/erp/auth/login"> click here to navigate to ERP-ClimateSI</a>`;
    let resemail= await this.emailService.sendMail(
      emails,
      'Leave approval',
      '',
      template,
    );
    if (
      leave.final__state &&
      leave.final__state.value == LeaveStatuses.REJECT
    ) {
      this.leavesCalService.leaveAdding(leave);
    }
    this.leavesService.saveLeaves(leave);


    let leaveAudit:any = {

      description: leave.leave_type.name ,
      userName: 'Buddika',
      actionStatus: "Leave Approved",
      userType: user.employee_types,
      uuId: user.id,

    }
    console.log("leaveAudit",leaveAudit)
    this.auditService.create(leaveAudit)
  }

  @Get('getLeaveStatusByValue')
  async getLeaveStatusByValue(@Query('id') id: number): Promise<LeaveStatus> {
    return await this.leavesService.getLeaveStatusByValue(id);
  }

  @Get('test')
  async test() {
    let joinedDate = new Date('2023-03-21 13:02:04');
    console.log(joinedDate.getFullYear());
  }
  @Get('getAllLeaveSummary')
  getAllLeaveSummary() {
    return this.leavesService.getAllLeaveSummary();
  }
  @Get('getThisWeekLeaves')
  async getThisWeekLeaves(): Promise<Leave[]> {
    return this.leavesService.getThisWeekLeaves();
  }

  @Post('addLeaveDocument')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({ destination: './public/leave_documents', filename: editFileName }) }),)
  async addLeavedDcument(@UploadedFile() file: Express.Multer.File,): Promise<any> {
    const newSavedfile = file.filename;
    console.log("recieveied file",newSavedfile)
    return {filename:newSavedfile};
  }
  
  

}
