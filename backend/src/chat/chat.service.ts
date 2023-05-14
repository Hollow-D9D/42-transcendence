import { Injectable } from '@nestjs/common';
import { Chat, User, MutedUser } from 'src/typeorm';
import { ChannelMode } from 'src/typeorm/channelmode.enum';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(User)
    private readonly mutedUserRepo: Repository<MutedUser>,
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
   * @param login who's trying to remove admin privileges
   * @param target whose admin privileges are about to get revoked
   * @param name of the channel
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

  /**
   * - check that login is a member of the channel
   * - check that target isn't a member of the channel AND isn't banned from the channel ? add target to the channel
   *
   * @param login who's trying to add a user
   * @param target the to-be member
   * @param name of the channel
   */
  async addToChannel(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    const isLoginChannelMember = channel.members.some(
      (user) => user.login === login,
    );
    if (isLoginChannelMember) {
      const isTargetChannelMember = channel.members.some(
        (user) => user.login === target,
      );
      const isBannedFromChannel = channel.blocked.some(
        (user) => user.login === target,
      );
      if (!isTargetChannelMember && !isBannedFromChannel) {
        const user = await this.userRepo.findOne({ where: { login: target } });
        channel.members.push(user);
        await this.chatRepo.save(channel);
      }
    }
  }

  /**
   * @param login who's trying to kick a user
   * @param target the to-be-kicked member
   * @param name the target channel
   *
   * - check that login is an admin of the channel
   * - check that target is a member of the channel and isn't its owner ? remove target from admins (if relevant) and kick it
   */
  async kickFromChannel(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    const isChannelAdmin = channel.admins.some((user) => user.login === login);
    if (isChannelAdmin) {
      const isChannelMember = channel.members.some(
        (user) => user.login === target,
      );
      const isChannelOwner = channel.owner.login === target;
      if (isChannelMember && !isChannelOwner) {
        channel.admins = channel.admins.filter((user) => user.login !== target);
        channel.members = channel.members.filter(
          (user) => user.login !== target,
        );
        await this.chatRepo.save(channel);
      }
    }
  }

  /**
   * @param login who's trying to ban a user
   * @param target the to-be-banned member
   * @param name the target channel
   *
   * - check that login is an admin of the channel
   * - call kick method
   * - check that target isn't its owner ? ban target
   */
  async banFromChannel(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    const isChannelAdmin = channel.admins.some((user) => user.login === login);
    if (isChannelAdmin) {
      this.kickFromChannel(login, target, name);
      const isChannelOwner = channel.owner.login === target;
      if (!isChannelOwner) {
        const user = await this.userRepo.findOne({ where: { login: target } });
        channel.blocked.push(user);
        await this.chatRepo.save(channel);
      }
    }
  }

  /**
   * @param login who's trying to unban a user
   * @param target the to-be-unbanned member
   * @param name the target channel
   *
   * - check that login is an admin of the channel
   * - check that target is banned ? unban target
   */
  async unbanForChannel(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    const isChannelAdmin = channel.admins.some((user) => user.login === login);
    if (isChannelAdmin) {
      const isBannedFromChannel = channel.blocked.some(
        (user) => user.login === login,
      );
      if (isBannedFromChannel) {
        channel.blocked = channel.blocked.filter(
          (user) => user.login != target,
        );
        this.chatRepo.save(channel);
      }
    }
  }

  /**
   * @param login who's trying to mute a user
   * @param target the to-be-muted member
   * @param duration of the mute, in minutes
   * @param name the target channel
   *
   * - check that login is an admin of the channel
   * - check that duration isn't more than 24h and isn't less than 1m
   * - check that target is a member of the channel and isn't its owner ? mute the user (that is replace the old mute with the new one)
   */
  async muteForChannel(
    login: string,
    target: string,
    duration: number,
    name: string,
  ) {
    var channel = await this.channel(name);
    const isLoginChannelAdmin = channel.admins.some(
      (user) => user.login === login,
    );
    if (!isLoginChannelAdmin) return;
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) return;
    const userToBeMuted = channel.members.find((user) => user.login === target);
    if (!userToBeMuted) return;
    const isTargetChannelOwner = channel.owner.login === target;
    if (isTargetChannelOwner) return;
    const expiration = new Date( // expiration = now + duration minutes
      new Date().setMinutes(new Date().getMinutes() + duration),
    );
    const alreadyMutedUser = channel.mutedUsers.find(
      (mutedUser) => mutedUser.user.login === target,
    );
    if (alreadyMutedUser) {
      // update muted user's deadline if found
      alreadyMutedUser.expiration = expiration;
      await this.mutedUserRepo.save(alreadyMutedUser);
    } else {
      // insert a new muted user entry if not found
      const mutedUserOpts = {
        chat: channel,
        user: userToBeMuted,
        expiration: expiration,
      };
      const mutedUser = this.mutedUserRepo.create(mutedUserOpts);
      // await this.mutedUserRepo.save(mutedUser); // TODO
      channel.mutedUsers.push(mutedUser);
      await this.chatRepo.save(channel);
    }
  }

  /**
   * @param login who's trying to unmute a user
   * @param target the to-be-unmuted member
   * @param name the target channel
   *
   * - check that login is an admin of the channel
   * - check that target is a member of the channel and is muted ? unmute
   */
  async unmuteForChannel(login: string, target: string, name: string) {
    var channel = await this.channel(name);
    const isLoginChannelAdmin = channel.admins.some(
      (user) => user.login === login,
    );
    if (!isLoginChannelAdmin) return;
    const isTargetChannelMember = channel.members.some(
      (user) => user.login === target,
    );
    if (!isTargetChannelMember) return;
    const mutedTarget = channel.mutedUsers.find(
      (mutedUser) => mutedUser.user.login === target,
    );
    if (!mutedTarget) return;
    channel.mutedUsers = channel.mutedUsers.filter(
      (mutedUser) => mutedUser.user.login !== target,
    );
    this.chatRepo.save(channel); // TODO
    this.mutedUserRepo.remove(mutedTarget); // TODO
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
