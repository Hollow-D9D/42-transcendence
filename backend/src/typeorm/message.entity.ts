import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { User, Chat } from '.';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  content: string;

  @CreateDateColumn()
  date: Date;
}
