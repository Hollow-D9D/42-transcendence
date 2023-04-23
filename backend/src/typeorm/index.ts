import { User } from './user.entity';
import { Achievement } from './achievement.entity';
import { Friend } from './friend.entity';
import { Chat } from './chat.entity';
import { MutedUser } from './muteduser.entity'

const entities = [Achievement, User, Friend, Chat, MutedUser];

export { Achievement, User, Friend, Chat, MutedUser };
export default entities;
