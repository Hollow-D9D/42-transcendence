import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    ManyToMany,
} from 'typeorm';
import { ChannelMode } from './mode.enum';
import { User, MutedUser, Message } from '.';

@Entity()
export class Chat extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: 'bigint',
    })
    id: number;

    @Column({
        type: 'boolean',
        nullable: false,
        default: false,
    })
    group: boolean;

    @Column({
        nullable: true,
        // no default value specified to use null as one
    })
    name: string | null;

    @Column({
        type: 'enum',
        enum: ChannelMode,
        nullable: true,
        // no default value specified to use null as one
    })
    mode: ChannelMode | null;

    @Column({
        nullable: true,
        // no default value specified to use null as one
    })
    password: string | null;

    // USER RELATIONS

    @ManyToMany(() => User, (user) => user.chatsMemberOf)
    members: User[];

    @ManyToMany(() => User, (user) => user.chatsAdmined)
    admins: User[];

    @ManyToMany(() => User, (user) => user.chatsBlockedFrom)
    blocked: User[];

    @ManyToOne(() => User, (user) => user.chatsOwned, { nullable: true })
    owner: User | null;

    // regular many-to-many relation with User with an extra property (expiration)
    @OneToMany(() => MutedUser, (muteduser) => muteduser)
    mutedUsers: MutedUser[];

    // MESSAGE RELATIONS

    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];
}