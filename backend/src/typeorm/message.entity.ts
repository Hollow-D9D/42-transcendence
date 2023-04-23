import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    ManyToOne,
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
    sender: User;

    @ManyToOne(() => Chat, (chat) => chat.messages)
    chat: Chat;

    @Column({
        type: 'varchar',
        nullable: false,
        default: "",
    })
    content: string;

    @CreateDateColumn()
    date: Date;
}