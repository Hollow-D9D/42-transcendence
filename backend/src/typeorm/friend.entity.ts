import {
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  Entity,
  BaseEntity,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  users: User[];
}
