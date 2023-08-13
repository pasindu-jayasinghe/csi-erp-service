import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

export enum LeaveStatuses {
    PENDING = 0,
    APPROVED = 1,
    REJECT = -1
  }

  @Entity()
export class LeaveStatus extends BaseTrackingEntity{
   
    constructor() {
        super();

      }
    
    
    
      @PrimaryGeneratedColumn()
      id: number;
      @Column('varchar', { length: 250,nullable:true})
      name: string;
      @Column({ type: 'enum', enum: LeaveStatuses})
      value: LeaveStatuses;
    
      @Column('varchar', { length: 250,nullable:true})
      description: string;
    
  
    
    } 