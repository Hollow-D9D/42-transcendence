import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Achievement, Friend, Chat, MutedUser, Message } from '.';

@Entity()
export class User extends BaseEntity {
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
    nullable: true,
    default: null,
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

  @Column({
    default: 0,
    nullable: false,
  })
  win_count: number;

  @Column({
    default: 0,
    nullable: false,
  })
  lose_count: number;

  @Column({
    default: 0,
    nullable: false,
  })
  ladder_level: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Achievement, (achievement) => achievement.users, {
    cascade: false,
  })
  @JoinTable({
    name: 'user_achievement',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'achievement_id', referencedColumnName: 'id' },
  })
  achievements: Achievement[];

  @ManyToMany(() => User, (user) => user.friends, {
    cascade: false,
  })
  @JoinTable({
    name: 'friends',
    joinColumn: { name: 'id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'friend_id', referencedColumnName: 'id' },
  })
  friends: User[];

  @ManyToMany(() => User, (user) => user.friend_requests, {
    cascade: false,
  })
  @JoinTable({
    name: 'friend_requests',
    joinColumn: { name: 'send_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'receive_id', referencedColumnName: 'id' },
  })
  friend_requests: User[];

  @ManyToMany(() => User, (user) => user.blockers, {
    cascade: false,
  })
  @JoinTable({
    name: 'blocked_users',
    joinColumn: { name: 'blocker_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blocked_id', referencedColumnName: 'id' },
  })
  blocked_users: User[];

  @ManyToMany(() => User, (user) => user.blocked_users)
  blockers: User[];

  // CHAT RELATIONS

  @ManyToMany(() => Chat, (chat) => chat.members)
  @JoinTable({
    name: 'chat_members',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
  })
  chatsMemberOf: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.admins)
  @JoinTable({
    name: 'chat_admins',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
  })
  chatsAdmined: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.id)
  @JoinTable({
    name: 'chat_blocked',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
  })
  chatsBlockedFrom: Chat[];

  @OneToMany(() => Chat, (chat) => chat.owner)
  chatsOwned: Chat[];

  // regular many-to-many relation with Chat with an extra property (expiration)
  @OneToMany(() => MutedUser, (muteduser) => muteduser.user)
  mutedUsers: MutedUser[];

  // MESSAGE RELATIONS

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
