import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { CrudController } from "@nestjsx/crud/lib/interfaces";
import { GeneralTask } from "./entities/general_task.entity";
import { GeneralTaskService } from "./general-task.service";


@Controller('generaltask')
export class GeneralTaskController implements CrudController<GeneralTask>{
  constructor(public service: GeneralTaskService) { }



  @Post('addgtask')
  async createGTask(@Body() gTaskDto: GeneralTask): Promise<GeneralTask> {
    return await this.service.create(gTaskDto);
  }


  @Get('getGtaskById')
  async getgTaskById(@Query("gtid") gtid: number): Promise<GeneralTask> {
    return await this.service.getgTaskById(gtid);
  }

  
  @Get('getGeneralTasks')
  async getGTasks(
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
    return await this.service.getGTasks(
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
    @Query('csiFeedBack') csiFeedBack: string,

    
    ): Promise<GeneralTask> {
    return this.service.updateFeedBack(id, csiFeedBack);
  }
}