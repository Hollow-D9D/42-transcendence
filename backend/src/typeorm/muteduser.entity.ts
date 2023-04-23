import {
    PrimaryGeneratedColumn,
    Entity,
    Column,
    ManyToOne,
    BaseEntity,
} from 'typeorm';
import { User, Chat } from '.';

// This entity describes the many-to-many relation between User and Chat meant
// to keep information on users that are muted in chats
//
// Regular @ManyToMany relation wouldn't work here due to a custom property
// (expiration date)
//
// More details here: https://archive.is/uRxRY#many-to-many-relations-with-custom-properties
@Entity()
export class MutedUser extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: 'bigint',
    })
    id: number;

    @Column({
        type: 'timestamptz',
        nullable: false,
    })
    expiration: Date;

    @ManyToOne(() => Chat, (chat) => chat.id)
    chat: Chat;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
}