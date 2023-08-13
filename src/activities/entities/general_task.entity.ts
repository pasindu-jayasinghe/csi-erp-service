import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GeneralTask extends BaseTrackingEntity {
  constructor() {
    super();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({type: "timestamp"})
  date: Date;


  @Column({type: "double",nullable: true})
  g_MD: number;

  @ManyToOne((type) => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({nullable: true})
  csiFeedBack:string;
  

}