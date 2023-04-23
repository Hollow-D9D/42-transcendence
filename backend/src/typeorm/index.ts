import { User } from './user.entity';
import { Achievement } from './achievement.entity';
import { Friend } from './friend.entity';
import { Chat } from './chat.entity';
import { MutedUser } from './muteduser.entity';
import { Message } from './message.entity';

const entities = [Achievement, User, Friend, Chat, MutedUser, Message];

export { Achievement, User, Friend, Chat, MutedUser, Message };
export default entities;
