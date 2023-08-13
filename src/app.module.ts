import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { LeavesModule } from './leaves/leaves.module';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import {config} from './ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import "reflect-metadata"
import { Leave } from './leaves/entities/leave.entity';
import { LeaveStatus } from './leaves/entities/leave_status.entity';
import { LeaveType } from './leaves/entities/leave_type.entity';
import { Child } from './user/entities/child.entity';
import { Group } from './user/entities/group.entity';
import { GroupUser } from './user/entities/group-user.entity';
import { Role } from './user/entities/role.entity';
import { User } from './user/entities/user.entity';
import { LeavesController } from './leaves/leaves.controller';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { LeavesCalculationService } from './leaves/leaves-calculation/leaves-calculation.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuditModule } from './audit/audit.module';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
  }),
  ScheduleModule.forRoot(),
  TypeOrmModule.forRoot(config),
  TypeOrmModule.forFeature([
    Leave,LeaveStatus,LeaveType, User,Role,Group,GroupUser,Child
   ]),
   MailerModule.forRoot({
    transport:{
      // service: 'gmail',
      host: 'smtp.office365.com', 
      port:587,
     secure: false, 
    //  ignoreTLS: true,
     
     auth: {
      user: "no-reply@climatesi.com",
      pass: "CSIreply2022",
      

    },
     
    },
    defaults: {
      from: '"Admin" <no-reply@climatesi.com>',
    },
  }),
   ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),   // <-- path to the static files
  }),
  UserModule,
  ProjectModule,
  LeavesModule,
  ActivitiesModule,
  AuthModule,
  AuditModule],
  controllers: [AppController,UserController,AuthController],
  providers: [AppService],
})
export class AppModule {}
