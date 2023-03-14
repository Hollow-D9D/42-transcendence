import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  save() {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  full_name: string;

  @Column({
    nullable: false,
    default: '',
    unique: true,
  })
  login: string;

  @Column({
    nullable: false,
    default: '',
    unique: true,
  })
  nickname: string;

  @Column({
    nullable: false,
    default: '.../default.jpg',
  })
  profpic_url: string;

  @Column({
    select: false,
    nullable: true,
  })
  two_factor_token: string;

  @CreateDateColumn()
  createdAt: Date;
}
