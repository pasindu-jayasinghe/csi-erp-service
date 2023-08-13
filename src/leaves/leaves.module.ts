import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from './entities/leave.entity';
import { LeaveStatus } from './entities/leave_status.entity';
import { LeaveType } from './entities/leave_type.entity';
import { LeavesCalculationService } from './leaves-calculation/leaves-calculation.service';
import { LeaveCalc } from './leaves-calculation/entities/leaves_calc.entity';
import { User } from 'src/user/entities/user.entity';
import { EmailNotificationService } from 'src/notifications/email.notification.service';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { GroupUser } from 'src/user/entities/group-user.entity';
import { AuditService } from 'src/audit/audit.service';
import { Audit } from 'src/audit/entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
     Leave,LeaveStatus,LeaveType,User,LeaveCalc,GroupUser,Audit
    ]), 
   
  ],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesCalculationService,EmailNotificationService,UserService,AuditService],
  exports:[LeavesService]
})
export class LeavesModule {}
