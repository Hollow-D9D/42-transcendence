import * as typeorm from 'typeorm';
import { User, Chat } from '.';

// This entity describes the many-to-many relation between User and Chat meant
// to keep information on users that are muted in chats
//
// Regular @ManyToMany relation wouldn't work here due to a custom property
// (expiration date)
//
// More details here: https://archive.is/uRxRY#many-to-many-relations-with-custom-properties
@typeorm.Entity()
export class MutedUser extends typeorm.BaseEntity {
  @typeorm.PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @typeorm.Column({
    type: 'timestamptz',
    nullable: false,
  })
  expiration: Date;

  @typeorm.ManyToOne(() => Chat, (chat) => chat.id)
  @typeorm.JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @typeorm.ManyToOne(() => User, (user) => user.id)
  @typeorm.JoinColumn({ name: 'user_id' })
  user: User;
}
