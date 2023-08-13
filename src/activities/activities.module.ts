import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityAttendance } from './entities/activity_attendance.entity';
import { ActivitiyAttendanceService } from './activity_attendance.service';
import { ActivityAttendController } from './activity_attendance.controller';
import { GeneralTask } from './entities/general_task.entity';
import { GeneralTaskController } from './general-task.controller';
import { GeneralTaskService } from './general-task.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectController } from 'src/project/project.controller';
import { ProjectService } from 'src/project/project.service';

@Module({

  imports: [TypeOrmModule.forFeature([Activity,ActivityAttendance,GeneralTask,Project])],

  controllers: [ActivitiesController,ActivityAttendController,GeneralTaskController],
  providers: [ActivitiesService,ActivitiyAttendanceService,GeneralTaskService]
})
export class ActivitiesModule { }
