import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class LeaveCalc extends BaseTrackingEntity {

    constructor() {
        super();

    }

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { eager: true })
    @JoinColumn()
    user: User;

    @Column('varchar', { length: 20, nullable: true })
    maternal_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    sick_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    casual_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    annual_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    short_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    rem_maternal_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    rem_sick_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    rem_casual_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    rem_annual_leaves: number;
    
    @Column('varchar', { length: 20, nullable: true })
    rem_short_leaves: number;

    @Column('varchar', { length: 20, nullable: true })
    no_pay_leaves: number;
    @Column('varchar', { length: 20, nullable: true })
    no_pay_unauthorized_leaves: number;

    @Column('int')
    year: number;


}