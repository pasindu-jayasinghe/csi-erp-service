import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

export enum LeaveTypes {
    ALL='All', //dont add 'ALL' to data base
    CASUAL = 'Casual leave',
    ANNUAL = 'Annual leave',
    MEDICAL= 'Medical leave',
    SHORT_LEAVE = 'Short leave',
    HALF_DAY_LEAVE = 'Half day leave',
    MATERNITY_LEAVE = 'Maternity leave',
    NO_PAY_LEAVE = 'No-pay leave',// authorized
    NO_PAY_LEAVE_UNAUTHORIZED = 'No-pay leave-unauthorized'
  }
  @Entity()
export class LeaveType extends BaseTrackingEntity{
   
    constructor() {
        super();

      }
    
    
    
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column({ type: 'enum', enum: LeaveTypes})
      name: LeaveTypes;
    
      @Column('varchar', { length: 500 ,nullable:true})
      description: string;
    
    
    
    }