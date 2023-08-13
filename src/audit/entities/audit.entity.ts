import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit' })
export class Audit {
  @PrimaryGeneratedColumn()
  id: number;

 /*  @ManyToOne((type) => User, { eager: true })
  @JoinColumn()
  user: User; */

  @Column()
  logDate: string;

  @Column()
  logTime: string;

  @Column({ default: null })
  userName: string;

  @Column()
  description: string;

  @Column()
  actionStatus: string;

  @Column({ default: null })
  userType: string;

  @Column({ default: null })
  uuId: number;


}
