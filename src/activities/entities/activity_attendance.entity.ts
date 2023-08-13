import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "../../project/entities/project.entity";
import { Activity } from "./activity.entity";

@Entity({ name: 'activity_attendance' })
export class ActivityAttendance extends BaseTrackingEntity {
    constructor() {
        super();
      }
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "timestamp"})
    date: Date;

    @Column({type: "double"})
    spent_MD: number;

    @ManyToOne((type) => Activity, { eager: true })
    @JoinColumn()
    activity: Activity;

    @Column({type: "double",nullable: true, default:0})
    daily_progress: number;

    @Column({nullable: true,length:2000})
    comment: string;

    @Column({nullable: true,length:2000})
    csiFeedBack: string;

    @Column({nullable: true,length:2000})
    staffFeedBack: string;

    @Column({nullable: true})
    acceptance: string;




}