import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  Column,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class GameMatch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, { eager: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User;

  @ManyToMany(() => User, { eager: true })
  @JoinColumn({ name: 'loser_id' })
  loser: User;

  @CreateDateColumn()
  playedOn: Date;

  @Column({ default: 0 })
  winnerScore: number;

  @Column({ default: 0 })
  loserScore: number;

  // IN SECONDS
  @Column({ default: 0 })
  duration: number;
}
