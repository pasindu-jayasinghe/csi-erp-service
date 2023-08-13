import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TeamLeads } from "./team_leads.entity";

// @Entity({ name: 'project' })

@Entity()
export class Project extends BaseTrackingEntity {
    // projectDto: any;

    // constructor() {
    //     super();
    //   }
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    project_code: string;

    @Column('date',{nullable: true})
    start_date: Date;
    
    @Column('date',{nullable: true})
    end_date: Date;


    @Column({type: "double"})
    duration: number;

    @Column({type: "double",nullable: true})
    planned_budget: number;

    @Column({nullable: true,length:2000})
    project_discription: string


    
    @Column({nullable: true})
    project_logo: string

    @Column()
    sponsor: string

    @Column()
    sponsor_time_zone: string

    @Column({nullable: true})
    sponsor_contact_name: string

    @Column({nullable: true})
    sponsor_contact_email: string


    @Column({nullable: true})
    sponsor_contact_phone: string

    @Column({nullable: true})
    sponsor_logo: string

    @Column()
    client: string


    @Column()
    client_country: string


    @Column()
    client_time_zone: string

    @Column()
    client_contact_name: string

    @Column({nullable: true})
    client_contact_email: string

    @Column({nullable: true})
    client_contact_phone: string

    @Column()
    client_contact_position: string

    @Column()
    client_contact_organization: string

    
    @ManyToOne((type) => User, { eager: true })
    @JoinColumn()
    project_lead: User;

    @OneToMany((type) => TeamLeads, (teamLeads) => teamLeads.project)
    teamLeads: TeamLeads[]


}