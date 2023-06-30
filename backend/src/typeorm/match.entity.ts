import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  Column,
  ManyToMany,
  CreateDateColumn,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Match extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToMany(() => User, { eager: true })
  // @JoinTable({
  //   name: 'winner',
  //   joinColumn: {
  //     name: 'match_id',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'user_id',
  //     referencedColumnName: 'id',
  //   },
  // })
  // winner: User;

  // @ManyToMany(() => User, { eager: true })
  // @JoinTable({
  //   name: 'loser',
  //   joinColumn: {
  //     name: 'match_id',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'user_id',
  //     referencedColumnName: 'id',
  //   },
  // })
  // loser: User;

  @CreateDateColumn()
  playedOn: Date;

  @Column({ default: 0 })
  winnerScore: number;

  @Column({ default: 0 })
  winnerLogin: string;

  @Column({ default: 0 })
  loserLogin: string;

  @Column({ default: 0 })
  loserScore: number;

  // IN SECONDS
  @Column({ default: 0 })
  duration: number;
}
