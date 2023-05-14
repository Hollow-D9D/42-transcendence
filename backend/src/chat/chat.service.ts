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
      if (mode === ChannelMode.PROTECTED) entityLike.password = password; // TODO: replace with the hashed one
      entityLike.owner = users[0]; // the first one is `login` from request
      // TODO: check that the fail condition works properly
    }
    // no else since no new fields need to be added for chats
    const newOne = this.chatRepo.create(entityLike);
    await this.chatRepo.save(newOne);
  }

  /**
   * - remove login
   * - check that there are no users left in the channel OR login is the channel owner ? delete channel
   *
   * @param login of the to-leave channel member
   * @param name of the channel
   * @returns nothing
   */
  async leaveChannel(login: string, name: string) {
    var channel = await this.channel(name);
    if (!channel) return;
    const userToRemove = await channel.members.find(
      (user) => user.login === login,
    );
    if (!userToRemove) return;
    channel.members = channel.members.filter((user) => user.login !== login);
    await this.chatRepo.save(channel);

    if (channel.members.length === 0 || channel.owner.login === login) {
      await this.chatRepo.remove(channel);
    }
  }

  /**
   * - the channel isn't private:
   *  - check that login isn't a member of the channel and isn't banned from there ?
   *    - the channel is protected:
   *      - check that password is correct ? add login to the channel
   *    - else (the channel is open) ? add login to the channel
   *
   * @param login who's trying to join the channel
   * @param name of the channel
   * @param password of the channel
   */
  async joinChannel(login: string, name: string, password: string) {
    var channel = await this.channel(name);
    if (channel.mode != ChannelMode.PRIVATE) {
      const isChannelMember = channel.members.some(
        (user) => user.login === login,
      );
      const isBannedFromChannel = channel.blocked.some(
        (user) => user.login === login,
      );
      if (!isChannelMember && !isBannedFromChannel) {
        // TODO: replace with the hashed one
        if (
          (channel.mode === ChannelMode.PROTECTED &&
            channel.password === password) ||
          channel.mode === ChannelMode.PUBLIC
        ) {
          const user = await this.userRepo.findOne({
            where: { login: login },
          });
          channel.members.push(user);
          await this.chatRepo.save(channel);
        }
      }
    }
  }

  /**
   * - check that login is the channel owner
   * - check that target is a member of the channel
   * - check that target isn't an admin yet ? add target to the channel admins
   *
   * @param login who's trying to grant admin privileges
   * @param target the to-be admin
   * @param name of the channel
   */
  async grantAdmin(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    if (channel.owner.login === login) {
      const isChannelMember = channel.members.some(
        (user) => user.login === target,
      );
      if (isChannelMember) {
        const isChannelAdmin = channel.admins.some(
          (user) => user.login === target,
        );
        if (!isChannelAdmin) {
          const user = await this.userRepo.findOne({
            where: { login: target },
          });
          if (user) {
            channel.admins.push(user);
            await this.chatRepo.save(channel);
          }
        }
      }
    }
  }

  /**
   * - check that login is the channel owner
   * - check that target is a member of the channel with admin privileges ? remove target from the channel admins
   *
   * @param login
   * @param target
   * @param name
   */
  async revokeAdmin(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    if (channel.owner.login === login) {
      const isChannelAdmin = channel.admins.some(
        (user) => user.login === target,
      );
      if (isChannelAdmin) {
        channel.admins = channel.admins.filter((user) => user.login !== target);
        await this.chatRepo.save(channel);
      }
    }
  }

  async users(logins: string[]): Promise<User[]> {
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

  /**
   * @param name of the channel to return
   * @returns Chat entity if found, null otherwise
   */
  async channel(name: string): Promise<Chat> {
    return await this.chatRepo.findOne({ where: { name: name } });
  }

  /**
   * check if a channel exists and return its type if it does
   *
   * @param name of the channel to be checked
   * @returns a valid ChannelMode if a channel with this name exists, null otherwise
   */
  async channelType(name: string): Promise<ChannelMode> {
    const channel = await this.channel(name);
    if (channel) {
      return channel.mode;
    }
    return null;
  }

  /**
   * @param name of the channel
   * @param login of the user to be checked
   */
  async isChannelMember(name: string, login: string): Promise<boolean> {
    const channel = await this.channel(name);
    return channel.members.some((user) => user.login === login);
  }

  /**
   * VALIDATIONS PERFORMED:
   * - 8-30 chars
   * - at least one uppercase letter
   * - at least one lowercase letter
   * - at least one number
   * - doesn't have anything apart from upper/lower/number/special chars
   *   the idea is that only printable non-space ascii characters are allowed
   *   but I may have missed something
   */
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
