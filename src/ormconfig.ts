import { DataSourceOptions } from 'typeorm';
import { Activity } from './activities/entities/activity.entity';
import { Leave } from './leaves/entities/leave.entity';
import { LeaveStatus } from './leaves/entities/leave_status.entity';
import { LeaveType } from './leaves/entities/leave_type.entity';
import { ActivityAttendance } from './activities/entities/activity_attendance.entity';
import { Project } from './project/entities/project.entity';
import { Child } from './user/entities/child.entity';
import { GroupUser } from './user/entities/group-user.entity';
import { Group } from './user/entities/group.entity';
import { Role } from './user/entities/role.entity';
import { User } from './user/entities/user.entity';
import { TeamLeads } from './project/entities/team_leads.entity';
import { LeaveCalc } from './leaves/leaves-calculation/entities/leaves_calc.entity';
import { GeneralTask } from './activities/entities/general_task.entity';
import { Audit } from './audit/entities/audit.entity';
//https://github.com/ambroiseRabier/typeorm-nestjs-migration-example

//***********************************************************************//

// npm run typeorm:migrate <myEntity-migration>
// Check your migration queries in src/migrations
// npm run start:dev or npm run start:prod or npm run typeorm:run

///Do not use capital letters for db name if used migration will NOT WORK
//If migration not working please delete dist folder and retry
//***********************************************************************//

// You can load you .env file here synchronously using dotenv package (not installed here),
// import * as dotenv from 'dotenv';
// import * as fs from 'fs';
// const environment = process.env.NODE_ENV || 'development';
// const data: any = dotenv.parse(fs.readFileSync(`${environment}.env`));
// You can also make a singleton service that load and expose the .env file content.
// ...

// Check typeORM documentation for more information.

export const config: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,

  username: 'root',
  // password: '7860150',
  // password: '1997',

  //password: '1997',
    password: 'pasindu',

  database: "erp",

  entities: [Leave,LeaveStatus,LeaveType, User,Role,Group,GroupUser,Child,Project,Activity,ActivityAttendance,TeamLeads,LeaveCalc,GeneralTask,Audit],
  

  
  // We are using migrations, synchronize should be set to false.
  synchronize: true,

 
}; 


