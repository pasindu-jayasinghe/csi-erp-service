import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from "typeorm";


export enum Roles {
    CEO = 'CEO',
    SE = 'Software Engineer',
    BA = 'Business Analyst',
    SO = 'Sustainability Officer',
    TL_CP = 'Team Lead - Carbon Pricing',
    TL_MRV = 'Team Lead - MRV',
    EE = 'Energy Engineer',
    S_SUS_E = 'Senior Sustainability Engineer' ,
    F_HR_LES = 'Head of Finance, HR and Low Emission Strategies',
    LED_IT = 'Head of LED and IT',
    TL_CF_CT='Team Lead - CF & CT'
  }

  @Entity()
export class Role extends BaseTrackingEntity{
   
    constructor(id?:number) {
        super();
 if(id){
  this.id=id
 }
      }
    
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column({ type: 'enum', enum: Roles, nullable: true })
      name: Roles;
    
    
    
    }     