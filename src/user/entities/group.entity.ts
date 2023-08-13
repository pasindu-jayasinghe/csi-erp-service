import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

export enum Groups {
    CEO = 'CEO',
    HOD = 'HOD',
    Team_Lead = 'TEAM_LEAD',
    IT_Team = 'IT_TEAM',
    MRV_Team = 'MRV_TEAM',
    CP_Team = 'CP_TEAM',
    LED_Team = 'LED_TEAM',
    CF_CT_Team = 'CF_CT_TEAM', 
  }

  @Entity()
export class Group extends BaseTrackingEntity{
   
    constructor() {
        super();

      }
    
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column({ type: 'enum', enum: Groups, nullable: true })
      name: Groups;
   
      @Column('varchar', { length: 400, nullable: true })
      responcibility: string;
    
    } 