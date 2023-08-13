import { ApiProperty } from '@nestjs/swagger';
import { BaseTrackingEntity } from 'src/shared/entities/base.tracking.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { GroupUser } from './group-user.entity';
import { Role } from './role.entity';
import * as bcript from 'bcrypt';
import { TeamLeads } from 'src/project/entities/team_leads.entity';
const { v4: uuidv4 } = require('uuid');


export enum Gender {
  Male = 'M',
  Female = 'F',
}

export enum EmployeeTypes {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  TRAININNG = 'TRAINING',
  OTHER = 'OTHER',
}
export enum MaritialStatus {
  MARRIED = 'Married',
  UNMARRIED = 'Unmarried'
}
@Entity({ name: 'user' })
export class User extends BaseTrackingEntity {
  constructor() {
    super();
  }
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 250 })
  full_name: string;
  @Column('varchar', { length: 100 })
  first_name: string;
  @Column('varchar', { length: 100,default:'Not Filled', nullable: true })
  last_name: string;
  @Column('varchar', { length: 50,default:'Not Filled', nullable: true })
  code: string;
  @Column({ type: 'enum', enum: EmployeeTypes, nullable: true } )
  employee_types: EmployeeTypes;

  @Column('varchar', { length: 100,default:0 })
  employee_id:string;

  @Column({ type: "date"})
  starting_date: Date;

  @Column('date', { nullable: true })
  BOD: Date;

  @Column('varchar', { length: 400,default:'Not Filled', nullable: true })
  adress: string;

  @Column('varchar', { length: 100,default:'Not Filled', nullable: true })
  EFP_number: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'enum', enum: MaritialStatus, nullable: true })
  maritial_status: MaritialStatus;

  @Column('varchar', { length: 250,default:'Not Filled', nullable: true })
  spouse_name: string;

  @Column('varchar', { length: 50,default:'Not Filled', })
  NIC_number: string;

  @Column('varchar', { length: 50,default:'Not Filled',nullable: true })
  home_town: string;
  @Column('varchar', { length: 50,default:'Not Filled',nullable: true })
  phone_number: string;
  @Column('varchar', { length: 50,default:'Not Filled',nullable: true })
  emergency_phone_number: string;
  @Column('varchar', { length: 50,default:'Not Filled',nullable: true })
  emergency_contact_relation: string;

  @Column('varchar', { length: 500,default:'Not Filled',nullable: true })
  qulification: string;

  // @Column('varchar', { length: 250,unique: true,default:'user@climatesi.com' }) // TODO: 'remove after adding user task
  @Column('varchar', { length: 250 })
  email: string;

  @Column('varchar', { length: 250 })
  password: string;
  
  @Column('varchar', { length: 250 })
  salt: string;

  
  @Column('varchar', { length: 450,nullable: true })
  logo_url: string;
  
  @ManyToOne(() => Role, { eager: true })
  @JoinColumn()
  role: Role;

  @OneToMany((type) => Child, (childs) => childs.parent, {
    eager: true,
    cascade: true,
  })
  childs: Child[];

  @OneToMany((type) => TeamLeads,(teamLeads) => teamLeads.lead)
  teamLeads: TeamLeads[]

  @OneToMany(
    (type) => GroupUser,
    (groupUser) => groupUser.user,
    { eager: true, cascade: false },
  )
  groupUser: GroupUser[];
  
  @Column('varchar', { length: 2.,nullable: true })
  days_to_bday: number;

  @Column('varchar', { length: 2.,nullable: true })
  age: number;



  async validatePassword(password: string): Promise<boolean> {
    const hashPassword = await bcript.hash(password, this.salt);
  
    return hashPassword === this.password;
    // return true;
  }


  async changePassword(password?: string): Promise<string> {
    this.salt = await bcript.genSalt();

    let newUUID = uuidv4();
    if(!password){

      password = ('' + newUUID).substr(0, 6);
    }
   
    // console.log(newPassword);
   
    this.password = await this.hashPassword(
      password,
      this.salt,
    );
    return password;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcript.hash(password, salt);
  }
}
