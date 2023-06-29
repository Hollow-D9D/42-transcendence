import { User } from './user.entity';
import { Achievement } from './achievement.entity';
import { GameMatch } from './game-match.entity';
// import { Friend } from './friend.entity';
import Chat from './chat.entity';
import { MutedUser } from './muteduser.entity';
import { Match } from './match.entity';
import { Message } from './message.entity';

const entities = [Achievement, User, GameMatch, Chat, MutedUser, Message, Match];

export { Achievement, User, GameMatch, Chat, MutedUser, Message, Match };
export default entities;
