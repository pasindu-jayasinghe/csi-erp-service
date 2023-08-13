import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";
import {  User } from "./user.entity";
 enum Gender {
  Male = 'M',
  Female = 'F',
}
@Entity()
export class Child extends BaseTrackingEntity{
   
    constructor() {
        super();

      }
    
    
    
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column('varchar', { length: 250 })
      name: string;
    
      
      @Column('date', { nullable: true })
      BOD: Date;
    
   
      
    
      @Column({ type: 'enum', enum: Gender, nullable: true })
      gender: Gender;



      @ManyToOne(() => User, (parent) => parent.childs)
      parent: User;
    
    }