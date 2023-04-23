import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
} from 'typeorm';
import { ChannelMode } from './mode.enum';
import { User } from './user.entity';

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
        type: 'string',
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
        type: 'string',
        nullable: true,
        // no default value specified to use null as one
    })
    password: string | null;

    @Column({
        type: 'bigint',
        nullable: true,
        // no default value specified to use null as one
    })
    owner_id: number | null;

    // USER RELATIONS

    @ManyToMany(() => User, (user) => user.chats_member_of)
    members: User[];

    @ManyToMany(() => User, (user) => user.chats_admined)
    admins: User[];

    @ManyToMany(() => User, (user) => user.chats_blocked_from)
    blocked: User[];

    @ManyToOne(() => User, (user) => user.chats_owned, { nullable: true })
    owner: User | null;
}