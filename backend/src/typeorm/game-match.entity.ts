import {
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class GameMatch extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id'
  })
  id: number;

  // @ManyToOne(() => User, { eager: true })
  // @JoinColumn({ name: 'player_1_id', referencedColumnName: 'id' })
  // player1: User;

  // @ManyToOne(() => User, { eager: true })
  // @JoinColumn({ name: 'player_2_id', referencedColumnName: 'id' })
  // player2: User;

  @OneToOne(() => User, user => user.matchesAsPlayer1)
  @JoinColumn()
  player1: User;

  @OneToOne(() => User, user => user.matchesAsPlayer2)
  @JoinColumn()
  player2: User;
}
