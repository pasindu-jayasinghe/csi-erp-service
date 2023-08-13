import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { ActivitiesService } from './activities.service';

import { Activity } from './entities/activity.entity';
import { ActivityStatus } from './enum/activity-status.enum';



@Controller('activity')
export class ActivitiesController implements CrudController<Activity>{
  constructor(public service: ActivitiesService) { }


  @Post('addActivity')
  async createActivity(@Body() activityDto: Activity): Promise<Activity> {
    return await this.service.create(activityDto);
  }


  @Get('getAllActivities')
  async getAllActivities(): Promise<Activity[]> {
    return await this.service.getAllActivities();
  }

  
  @Get('getActivityById')
  async getActivityById(@Query("aid") aid: number): Promise<Activity> {
    return await this.service.getActivityById(aid);
  }

  @Patch('updateActivity')
  updateActivity(@Param('id') id: number, @Body() activitytDto: Activity): Promise<Activity> {
    return this.service.update(id, activitytDto);
  }
    
  @Get('getAssignActivities')
  async getAssignActivities(
    @Query("aid") aid: number,
    @Query("fuid") fuid: number | null| undefined,
    @Query("userRole") uRole: string | null,
    @Query("actStatus") actStatus: ActivityStatus,
    @Query("projectid") projectid: number,
    @Query("dates") dates: any[],

    

  ): Promise<Activity[]> {
    return await this.service.getAssignActivities(aid,+fuid,uRole,actStatus,projectid,dates);
  }

  
  @Post('deleteActivites/:pid')
  deleteActivities(@Param('pid') pid: number):  Promise<any>{
    return this.service.deleteActivities(+pid);
  }



  @Get('getAllActivitiesByProjId')
  async getAllActivitiesByProjId(
    @Query("pid") pid: number,    
    

  ): Promise<Activity[]> {
    return await this.service.getAllActivitiesByProjId(pid);
  }


  @Post('copyActivitiyListByProjId/:pid/:newpId')
  async copyActivitiyListByProjId(
    @Param('pid') pid: number,
    @Param('newpId') newpId: number  

    
  ): Promise<any> {
    return await this.service.createCopyListByPID(+pid,+newpId);
  }


  @Patch('updateNextWPMDS')
  updateNextWeekActivityMDs(
    @Query('id') id: number,
    @Query('fromDate') fromDate: Date,
    @Query('toDate') toDate: Date,
    @Query('weekMDs') weekMDs: number
    
    ): Promise<Activity> {
    return this.service.updateNextWeekActivityMDs(id, fromDate,toDate,weekMDs);
  }



  @Get('getActivitiesForWeekPlan')
  async getActivitiesForWeekPlan(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('userId') userId: number,
    @Query('uRole') uRole: string,
    @Query('dates') dates: any [],


  ): Promise<any> {
    console.log("qDate--", {
      userId:userId,
      dates:dates
     
    });
    return await this.service.getActivitiesForWeekPlan(
      {
        limit: limit,
        page: page,
      },
    
      userId,
      uRole,
      dates

    );
  }


}
