import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from 'src/activities/entities/activity.entity';
import { Project } from './entities/project.entity';
import { TeamLeads } from './entities/team_leads.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({

  imports: [TypeOrmModule.forFeature([Project,TeamLeads,Activity])],

  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
