import { BaseTrackingEntity } from 'src/shared/entities/base.tracking.entity';
import { User } from 'src/user/entities/user.entity';
import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Entity } from 'typeorm';
import { LeaveStatus, LeaveStatuses } from './leave_status.entity';
import { LeaveType } from './leave_type.entity';


@Entity()
export class Leave extends BaseTrackingEntity {
  constructor() {
    super();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  request_by: User;

  @Column('varchar', { length: 250 })
  reason: string;

  @ManyToOne(() => LeaveType, { eager: true })
  @JoinColumn()
  leave_type: LeaveType;

  @Column({ type: "timestamp"})
  leave_starting_date: Date;

  @Column({ type: "timestamp"})
  leave_end_date: Date;

  @Column({ type: "double"})
  man_days: number;

  @ManyToOne(() => User, { eager: true,nullable: true })
  @JoinColumn()
  final_respond_by: User;

  @Column('varchar', { length: 400,nullable: true  })
  final_state_feedback: string;

  @ManyToOne(() => LeaveStatus, { eager: true, nullable: true, })
  @JoinColumn()
  final__state: LeaveStatus;

  @Column('varchar', { length: 400, nullable: true })
  hod_recommendation_feedback: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn()
  hod_respond_by: User;

  @ManyToOne(() => LeaveStatus, { eager: true, nullable: true })
  @JoinColumn()
  hod_recommendation_state: LeaveStatus;

  @Column('varchar', { length: 400, nullable: true })
  tl_recommendation_feedback: string;

  @ManyToOne(() => User, { eager: true , nullable: true })
  @JoinColumn()
  tl_respond_by: User;

  @ManyToOne(() => LeaveStatus, { eager: true , nullable: true})
  @JoinColumn()
  tl_recommendation_state: LeaveStatus;

  @Column('varchar', { length: 450,nullable: true })
  doc_url: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  no_pay_leave_request_by: User;
}


