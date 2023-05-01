import { Injectable } from '@nestjs/common';
import { Chat, User } from 'src/typeorm';
import { ChannelMode } from 'src/typeorm/channelmode.enum';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /**
   * @param users one (channel) or two (chat) initial members
   * @param mode used to perform the chat/channel and channel mode resolution
   * @param name of the channel being created
   * @param password of the PROTECTED channel being created
   */
  async create(
    users: User[],
    mode: ChannelMode,
    name: string,
    password: string,
  ) {
    // null
    const entityLike = {
      group: false,
      members: users,
      mode: null,
      name: null,
      password: null,
      owner: null,
    };
    if (mode !== null) {
      // create a channel
      entityLike.group = true;
      entityLike.mode = mode;
      entityLike.name = name;
      if (mode == ChannelMode.PROTECTED) entityLike.password = password; // TODO: replace with the hashed one
      entityLike.owner = users[0]; // the first one is `login` from request
      // TODO: check that the fail condition works properly
    }
    // no else since no new fields need to be added for chats
    const newOne = this.chatRepo.create(entityLike);
    await this.chatRepo.save(newOne);
  }

  async getUsers(logins: string[]): Promise<User[]> {
    return await this.userRepo.find({ where: { login: In(logins) } });
  }

  async isBlocked(blocked: string, blocker: string): Promise<boolean> {
    const blockerFound = await this.userRepo.findOne({
      where: { login: blocker },
    });
    if (!blockerFound) {
      return false; // shouldn't get here
    }
    return blockerFound.blocked_users.some((user) => user.login === blocked);
  }

  async getName(name: string): Promise<Chat> {
    return await this.chatRepo.findOne({ where: { name: name } });
  }

  // VALIDATIONS PERFORMED:
  // - 8-30 chars
  // - at least one uppercase letter
  // - at least one lowercase letter
  // - at least one number
  // - doesn't have anything apart from upper/lower/number/special chars
  //   the idea is that only printable non-space ascii characters are allowed
  //   but I may have missed something
  isValidPassword(password: string): boolean {
    // 8-30 chars
    if (password.length < 8 || password.length > 30) {
      return false;
    }
    // at least one uppercase letter
    const hasUpper: RegExp = /[A-Z]/;
    if (!hasUpper.test(password)) {
      return false;
    }
    // at least one lowercase letter
    const hasLower: RegExp = /[a-z]/;
    if (!hasLower.test(password)) {
      return false;
    }
    // at least one number
    const hasNumber = /[0-9]/;
    if (!hasNumber.test(password)) {
      return false;
    }
    // doesn't have anything apart from upper/lower/number/special chars
    const hasInvalid = /[^a-zA-Z0-9!@#$%^&*()_+{}|:"<>?,\[\];'\.,\/~`-]/;
    if (hasInvalid.test(password)) {
      return false;
    }
    // else passed
    return true;
  }
}
