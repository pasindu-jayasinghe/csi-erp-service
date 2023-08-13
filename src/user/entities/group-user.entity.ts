import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Entity } from "typeorm";
import { Group } from "./group.entity";
import { Role } from "./role.entity";
import { User } from "./user.entity";

@Entity()
export class GroupUser extends BaseTrackingEntity{
   
    constructor() {
        super();

      }
    
      @PrimaryGeneratedColumn()
      id: number;
      
      @Column('varchar',{length:200,nullable:true})
      name: string;
    
      @Column('varchar',{length:200,nullable:true})
      code: string;




      @ManyToOne(() => Group, {eager: true})
      @JoinColumn()
      group: Group;
    
    
      @ManyToOne(() => User, (user) => user.groupUser,{ eager: false },)
      user: User;
    
    
    }