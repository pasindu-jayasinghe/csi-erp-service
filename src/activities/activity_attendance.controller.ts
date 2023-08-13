import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CrudController } from "@nestjsx/crud";
import { ActivitiyAttendanceService } from "./activity_attendance.service";
import { ActivityAttendance } from "./entities/activity_attendance.entity";
import { GeneralTask } from "./entities/general_task.entity";


@Controller('activity-attend')
export class ActivityAttendController implements CrudController<ActivityAttendance>{
  constructor(public service: ActivitiyAttendanceService) { }

  @Post('addActivityAttendance')
  async createActivityAttend(@Param('id') id: number, @Body() activityAtendDto: ActivityAttendance): Promise<ActivityAttendance> {
    return await this.service.create(id, activityAtendDto);
  }

  @Post('updateActivityAttendance')
  async updateActivityAttend(@Param('id') id: number, @Body() activityAtendDto: ActivityAttendance): Promise<ActivityAttendance> {
    return await this.service.update(id, activityAtendDto);
  }


  // @Post('deleteActivityAttendById')
  // async deleteActivityAttend(@Param("daaid")  daaid: string): Promise<ActivityAttendance> {
  //   console.log("deleteid", daaid)
  //   return await this.service.delete(+daaid);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log("iddddddd",id)
    return this.service.remove(+id);
  }


  @Get('getActivityAttendById')
  async getActivityAttendById(@Query("aaid") aaid: number): Promise<ActivityAttendance> {
    return await this.service.getActivityAttendById(aaid);
  }


  @Get('getActivityAttendance')
  async getActiviyAttendance(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('userId') userId: number,
    @Query('date') date: Date,
    @Query('hasDate') hasDate: string,


  ): Promise<any> {
    console.log("qDate--", {
      page: page,
      limit: limit,
      date: date
    });
    return await this.service.getActiviyAttendance(
      {
        limit: limit,
        page: page,
      },
      date,
      userId,
      hasDate

    );
  }


  @Patch('updateFeedBack')
  updateFeedBack(
    @Query('id') id: number,
    @Query('csiFeedBack') csiFeedBack: string|undefined,
    @Query('staffFeedBack') staffFeedBack: string|undefined

    
    ): Promise<ActivityAttendance> {
    return this.service.updateFeedBack(id, csiFeedBack,staffFeedBack);
  }


  @Patch('updateAcceptance')
  updateAcceptance(
    @Query('id') id: number,
    @Query('csiFeedBack') acceptance: string|undefined,

    
    ): Promise<ActivityAttendance> {

      console.log("ssss",acceptance)
    return this.service.updateAcceptance(id, acceptance,);
  }
}