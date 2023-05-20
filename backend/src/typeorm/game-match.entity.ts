import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class GameMatch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'player_1_id' })
  player1: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'player_2_id' })
  player2: User;
}
