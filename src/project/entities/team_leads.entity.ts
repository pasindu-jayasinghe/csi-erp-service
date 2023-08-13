import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./project.entity";

@Entity({ name: 'team_leads' })
export class TeamLeads extends BaseTrackingEntity {


    constructor() {
        super();
      }
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne((type) => Project, { eager: true })
    @JoinColumn()
    project: Project;


    @ManyToOne((type) => User, { eager: true })
    @JoinColumn()
    lead: User;


}