import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ActivityStatus } from "../enum/activity-status.enum";

@Entity()
export class Activity extends BaseTrackingEntity {
  static findOne(arg0: { where: { id: any; }; }) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;


  @Column({ nullable: true, default: null })
  activity_level: string;

  @Column()
  activity_type: string;


  @Column()
  code: string;

  @Column({ type: "timestamp",nullable: true })
  deadline: Date;


  @ManyToOne((type) => User, { eager: true })
  @JoinColumn()
  assign_to: User;

  @ManyToOne((type) => User, { eager: true })
  @JoinColumn()
  assign_by: User;


  @Column({type: "double"})
  planned_MD: number;

  @Column({ type: "double",nullable: true, default: 0 })
  used_MD: number;

  @Column( {type: "timestamp",nullable: true })
  planned_start_date: Date;


  @Column({ type: "timestamp",nullable: true })
  planned_end_date: Date;


  @Column({type: "timestamp", nullable: true })
  actual_start_date: Date;

  @Column({ type: "timestamp",nullable: true })
  actual_end_date: Date;

  @ManyToOne((type) => Project, { eager: true ,nullable:true })
  @JoinColumn()
  project: Project;


  @ManyToOne((type) => Activity, (parent_activity) => parent_activity.childActivities, {nullable: true })
  parent_activity?: Activity


  @OneToMany((type) => Activity, (childActivity) => childActivity.parent_activity, {nullable: true })
  childActivities?: Activity[]

  @Column({type: "double",nullable: true, default:0})
  progress: number;


  @Column({default: ActivityStatus.TODO})
  activityStatus: ActivityStatus;

  @Column({ type: "timestamp",nullable: true })
  fromDate: Date;

  @Column({ type: "timestamp",nullable: true })
  toDate: Date;

  @Column({type: "double",nullable: true})
  week_MD: number;


}