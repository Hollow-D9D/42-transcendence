import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { ChannelMode } from './channelmode.enum';
import { User, MutedUser, Message } from '.';

@Entity()
export default class Chat extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  // actually redundant, mode == null can be used instead
  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  group: boolean;

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
  name: string | null;

  @Column({
    nullable: true,
    // no default value specified to use null as one
  })
  password: string | null;

  // USER RELATIONS

  @ManyToMany(() => User, (user) => user.chatsMemberOf)
  members: User[];

  @ManyToMany(() => User, (user) => user.chatsAdmined)
  admins: User[] | null;

  @ManyToMany(() => User, (user) => user.chatsBlockedFrom)
  @JoinTable({
    name: 'chat_blocked',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  blocked: User[] | null;

  @ManyToOne(() => User, (user) => user.chatsOwned, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User | null;

  // regular many-to-many relation with User with an extra property (expiration)
  @OneToMany(() => MutedUser, (muteduser) => muteduser.chat)
  mutedUsers: MutedUser[] | null;

  // MESSAGE RELATIONS

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
