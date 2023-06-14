import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToMany,
  BaseEntity,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Achievement extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;

  @Column({
    type: String,
    nullable: false,
    default: '',
  })
  alias: string;

  @Column({
    type: String,
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    type: String,
    nullable: false,
    default: '',
  })
  icon: string;

  @Column({
    type: String,
    nullable: false,
    default: '',
  })
  description: string;

  @Column({
    type: Number,
    nullable: false,
    default: 0,
  })
  level: number;

  @Column({
    type: Number,
    nullable: false,
    default: 0,
  })
  progress: number;

  @ManyToMany(() => User, (user) => user.achievements, { cascade: false })
  users: User[];
}
