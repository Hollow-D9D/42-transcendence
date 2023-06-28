import { Injectable } from '@nestjs/common';
import { Chat, User, MutedUser, Message } from 'src/typeorm';
import * as bcrypt from 'bcrypt';
import { ChannelMode } from 'src/typeorm/channelmode.enum';
import { Repository, In, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface chatSettings {
  private: boolean;
  isPassword: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MutedUser)
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
    try {
      // null
      const entityLike = {
        group: false,
        members: users,
        mode: null,
        name: null,
        password: null,
        owner: null,
      };
      const saltRounds = 10;
      if (mode !== null) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // create a channel
        entityLike.group = true;
        entityLike.mode = mode;
        entityLike.name = name;
        if (mode === ChannelMode.PROTECTED)
          entityLike.password = hashedPassword;
        entityLike.owner = users[0]; // the first one is `login` from request
        // TODO: check that the fail condition works properly
      } else {
        entityLike.name =
          users[0].id > users[1].id
            ? `DM:${users[0].nickname}:${users[1].nickname}`
            : `DM:${users[1].nickname}:${users[0].nickname}`;
      }
      // no else since no new fields need to be added for chats
      const newOne = this.chatRepo.create(entityLike);
      await this.chatRepo.save(newOne);
      return newOne;
    } catch (err) {
      throw err;
    }
  }

  async updateChannel(query) {
    try {
      // null
      const chat = await this.chatRepo.findOne({
        where: { id: query.chat_id },
      });

      if (query.private) {
        chat.mode = ChannelMode.PRIVATE;
        chat.password = null;
      } else if (query.isPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(query.newPassword, saltRounds);
        chat.mode = ChannelMode.PROTECTED;
        chat.password = hashedPassword;
      } else {
        chat.mode = ChannelMode.PUBLIC;
        chat.password = null;
      }
      await this.chatRepo.save(chat);
      return chat;
    } catch (err) {
      throw err;
    }
  }

  async getMessages(chat_id: number) {
    try {
      const chat = await this.chatRepo.findOne({
        where: { id: chat_id },
        relations: ['messages', 'messages.sender'],
      });
      return chat.messages;
    } catch (err) {
      throw err;
    }
  }

  async checkPermission(login: string, chat_id: number) {
    let bool = false;
    try {
      const user = await this.userRepo.findOne({
        where: { login },
        relations: ['chatsMemberOf'],
      });
      if (user)
        user.chatsMemberOf.map((item) => {
          if (item.id == chat_id) bool = true;
        });
      return bool;
    } catch (err) {
      throw err;
    }
  }

  async getSearchChats(login: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { login },
        relations: ['chatsMemberOf'],
      });
      const publics = await this.chatRepo.find({
        where: [{ mode: ChannelMode.PUBLIC }, { mode: ChannelMode.PROTECTED }],
      });

      const merged = user.chatsMemberOf
        .filter((obj1) => !publics.find((obj2) => obj1.id === obj2.id))
        .concat(publics);
      return [...merged];
    } catch (err) {
      throw err;
    }
  }

  async getRole(login: string, chat_id: number) {
    const chat = await this.chatRepo.findOne({
      where: { id: chat_id },
      relations: ['admins', 'owner', 'members'],
    });
    let role: string = null;

    if (chat) {
      chat.members.forEach((member) => {
        if (member.login == login) role = 'member';
      });
      chat.admins.forEach((admin) => {
        if (admin.login == login) role = 'admin';
      });
      if (chat.owner?.login == login) role = 'owner';
    }
    return role;
  }

  /**
   * - remove login
   * - check that there are no users left in the channel OR login is the channel owner ? delete channel
   *
   * @param login of the to-leave channel member
   * @param chat_id of the channel
   * @returns nothing
   */
  async leaveChannel(login: string, chat_id: number) {
    try {
      const channel = await this.channel(chat_id);
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
    } catch (err) {
      throw err;
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
   * @param chat_id of the channel
   * @param password of the channel
   */
  async joinChannel(
    login: string,
    chat_id: number,
    password: string,
    isInvited: boolean,
  ) {
    try {
      const channel = await this.channel(chat_id);

      if (channel.mode != ChannelMode.PRIVATE || isInvited) {
        const isChannelMember = channel.members.some(
          (user) => (isInvited ? user.nickname : user.login) === login,
        );
        const isBannedFromChannel = channel.blocked.some(
          (user) => (isInvited ? user.nickname : user.login) === login,
        );
        if (!isChannelMember && !isBannedFromChannel) {
          // TODO: replace with the hashed one
          if (
            isInvited ||
            (channel.mode === ChannelMode.PROTECTED &&
              (await bcrypt.compare(password, channel.password))) ||
            channel.mode === ChannelMode.PUBLIC
          ) {
            const user = isInvited
              ? await this.userRepo.findOne({
                  where: { nickname: login },
                })
              : await this.userRepo.findOne({
                  where: { login: login },
                });
            channel.members.push(user);
            await this.chatRepo.save(channel);
            return user.login;
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * - check that login is the channel owner
   * - check that target is a member of the channel
   * - check that target isn't an admin yet ? add target to the channel admins
   *
   * @param login who's trying to grant admin privileges
   * @param target the to-be admin
   * @param chat_id of the channel
   */
  async grantAdmin(login: string, target: string, chat_id: number) {
    const channel = await this.channel(chat_id);
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
   * @param chat_id of the channel
   */
  async revokeAdmin(login: string, target: string, chat_id: number) {
    const channel = await this.channel(chat_id);
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
   * @param chat_id of the channel
   */
  async addToChannel(login: string, target: string, chat_id: number) {
    const channel = await this.channel(chat_id);
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
   * @param chat_id the target channel
   *
   * - check that login is an admin of the channel
   * - check that target is a member of the channel and isn't its owner ? remove target from admins (if relevant) and kick it
   */
  async kickFromChannel(login: string, target: string, chat_id: number) {
    const channel = await this.channel(chat_id);
    const isChannelAdmin =
      channel.admins.some((user) => user.login === login) ||
      channel.owner.login === login;
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
        console.log(channel.members);
        await this.chatRepo.save(channel);
      }
    }
  }

  async chatWithBanned(chat_id: number) {
    const chat = await this.chatRepo.findOne({
      where: { id: chat_id },
      relations: ['blocked'],
    });
    if (chat)
      return {
        blocked: chat.blocked,
      };
    else return null;
  }

  async getChatRoles(chat_id: number) {
    const chat = await this.chatRepo.findOne({
      where: { id: chat_id },
      relations: ['owner', 'admins', 'members'],
    });
    if (chat)
      return {
        owner: chat.owner,
        admins: chat.admins,
        members: chat.members,
      };
    else return null;
  }

  /**
   * @param login who's trying to ban a user
   * @param target the to-be-banned member
   * @param chat_id the target channel
   *
   * - check that login is an admin of the channel
   * - call kick method
   * - check that target isn't its owner ? ban target
   */
  async banFromChannel(login: string, target: string, chat_id: number) {
    const channel = await this.channel(chat_id);
    const isChannelAdmin =
      channel.owner.login === login ||
      channel.admins.some((user) => user.login === login);
    if (isChannelAdmin) {
      const isChannelOwner = channel.owner.login === target;
      if (!isChannelOwner) {
        const user = await this.userRepo.findOne({ where: { login: target } });
        channel.blocked.push(user);
        await this.chatRepo.save(channel);
        await this.kickFromChannel(login, target, chat_id);
        // console.log(channel.blocked);
      }
    }
  }

  /**
   * @param login who's trying to unban a user
   * @param target the to-be-unbanned member
   * @param chat_id the target channel
   *
   * - check that login is an admin of the channel
   * - check that target is banned ? unban target
   */
  async unbanForChannel(login: string, target: string, chat_id: number) {
    const channel = await this.channel(chat_id);
    const isChannelAdmin =
      channel.owner.login === login ||
      channel.admins.some((user) => user.login === login);
    if (isChannelAdmin) {
      const isBannedFromChannel = channel.blocked.some(
        (user) => user.login === target,
      );
      // console.log(channel.blocked);
      if (isBannedFromChannel) {
        channel.blocked = channel.blocked.filter(
          (user) => user.login != target,
        );
        await this.chatRepo.save(channel);
      }
    }
  }

  async getExpiredMutedUsers(): Promise<MutedUser[]> {
    const currentDate = new Date();
    return this.mutedUserRepo.find({
      where: {
        expiration: LessThan(currentDate),
      },
    });
  }

  /**
   * @param login who's trying to mute a user
   * @param target the to-be-muted member
   * @param duration of the mute, in minutes
   * @param chat_id the target channel
   *
   * - check that login is an admin of the channel
   * - check that duration isn't more than 24h and isn't less than 1m
   * - check that target is a member of the channel and isn't its owner ? mute the user (that is replace the old mute with the new one)
   */

  async muteForChannel(
    login: string,
    target: string,
    duration: number,
    chat_id: number,
  ) {
    const channel = await this.channel(chat_id);
    // console.log(channel);
    const isLoginChannelAdmin =
      channel.owner.login === login ||
      channel.admins.some((user) => user.login === login);
    if (!isLoginChannelAdmin) return;
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) return;
    const userToBeMuted = channel.members.find((user) => user.login === target);
    if (!userToBeMuted) return;
    const isTargetChannelOwner = channel.owner.login === target;
    if (isTargetChannelOwner) return;
    const expiration = new Date( // expiration = now + duration minutes
      new Date().setMinutes(new Date().getMinutes() + duration),
    );
    const alreadyMutedUser = await this.findMutedInChannel(
      chat_id,
      userToBeMuted.id,
    );
    // console.log(alreadyMutedUser);
    // console.log('hey:::: ', alreadyMutedUser);
    if (alreadyMutedUser) {
      // update muted user's deadline if found
      alreadyMutedUser.expiration = expiration;
      await this.mutedUserRepo.save(alreadyMutedUser);
    } else {
      const channelWithMuteds = await this.channelMuteds(chat_id);
      // insert a new muted user entry if not found
      const mutedUserOpts = {
        chat: channelWithMuteds,
        user: userToBeMuted,
        expiration: expiration,
      };
      const mutedUser = this.mutedUserRepo.create(mutedUserOpts);
      // await this.mutedUserRepo.save(mutedUser); // TODO
      channelWithMuteds.mutedUsers.push(mutedUser);

      await this.mutedUserRepo.save(mutedUser);
      // const data = await this.channelForMute(chat_id);
    }
  }

  /**
   * @param login who's trying to unmute a user
   * @param target the to-be-unmuted member
   * @param chat_id the target channel
   *
   * - check that login is an admin of the channel
   * - check that target is a member of the channel and is muted ? unmute
   */
  async unmuteForChannel(login: string, target: number, chat_id: number) {
    const channel = await this.channel(chat_id);
    const isLoginChannelAdmin =
      channel.owner.login === login ||
      channel.admins.some((user) => user.login === login);
    if (!isLoginChannelAdmin) return;
    const isTargetChannelMember = channel.members.some(
      (user) => user.id === target,
    );
    if (!isTargetChannelMember) return;
    const mutedTarget = await this.findMutedInChannel(chat_id, target);
    if (!mutedTarget) return;
    await this.mutedUserRepo.remove(mutedTarget); // TODO
  }

  async circularUnmute() {
    const expiredMutedUsers = await this.getExpiredMutedUsers();
    for (const mutedUser of expiredMutedUsers) {
      await mutedUser.remove();
    }
  }

  /**
   * ADDING A MESSAGE FROM USER TO CHAT
   *
   * @param chat_id
   * @param sender_login
   * @param message
   */
  async addMessage(chat_id: number, sender_login: string, message: string) {
    try {
      const chat = await this.chatRepo.findOne({
        where: { id: chat_id },
        relations: ['messages'],
      });
      if (!chat) throw new Error('No chat with this id!');
      const sender = await this.userRepo.findOne({
        where: { login: sender_login },
      });
      if (!sender) throw new Error('No user found!');

      const msg = new Message();
      msg.content = message;
      msg.sender = sender;
      msg.chat = chat;
      const newmsg = await msg.save();
      return newmsg.id;
    } catch (err) {
      throw err;
    }
  }

  async getSettings(chat_id: number): Promise<chatSettings> {
    const chat = await this.chatRepo.findOne({ where: { id: chat_id } });
    const settings: chatSettings = {
      private: false,
      isPassword: false,
    };

    if (chat.mode == ChannelMode.PRIVATE) settings.private = true;
    if (chat.password) settings.isPassword = true;

    return settings;
  }

  async getMessage(message_id: number) {
    try {
      const message = this.messageRepo.findOne({
        where: { id: message_id },
        relations: ['sender', 'chat'],
      });
      return message;
    } catch (err) {
      throw err;
    }
  }

  async users(logins: string[]): Promise<User[]> {
    return await this.userRepo.find({ where: { login: In(logins) } });
  }

  async allUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }
  
  async notInChannelUsers(chat_id: number) {
    const users = await this.userRepo.find({ where: {} });
    const chat = await this.chatRepo.findOne({
      where: { id: chat_id },
      relations: ['members'],
    });
    const rtn = users.filter((elem) => {
      return (
        chat.members.find((element) => {
          return element.login === elem.login;
        }) === undefined
      );
    });
    return rtn.map((elem) => {
      return {
        id: elem.id,
        name: elem.nickname,
      };
    });
  }
  async isBlocked(blocked: string, blocker: string): Promise<boolean> {
    const blockerFound = await this.userRepo.findOne({
      where: { login: blocker },
      relations: ['blocked_users'],
    });
    if (!blockerFound) {
      return false; // shouldn't get here
    }
    return blockerFound.blocked_users.some((user) => user.login === blocked);
  }

  /**
   * @param chat_id of the channel to return
   * @returns Chat entity if found, null otherwise
   */
  async channel(id: number): Promise<Chat> {
    return await this.chatRepo.findOne({
      where: { id: id },
      relations: ['members', 'admins', 'blocked', 'owner'],
    });
  }

  async channelMuteds(id: number): Promise<Chat> {
    return await this.chatRepo.findOne({
      where: { id: id },
      relations: ['mutedUsers'],
    });
  }

  async channelMutedUsers(id: number): Promise<MutedUser[]> {
    return await this.mutedUserRepo.find({
      where: { chat: { id: id }, user: {} },
      relations: ['chat', 'user'],
    });
  }

  async findMutedInChannel(
    chat_id: number,
    user_id: number,
  ): Promise<MutedUser> {
    return await this.mutedUserRepo.findOne({
      where: { chat: { id: chat_id }, user: { id: user_id } },
      relations: ['chat', 'user'],
    });
  }

  /**
   * @param name of the channel to return
   * @returns Chat entity if found, null otherwise
   */
  async channelByName(name: string): Promise<Chat> {
    return await this.chatRepo.findOne({
      where: { name },
      relations: ['members', 'blocked'],
    });
  }

  /**
   * check if a channel exists and return its type if it does
   *
   * @param chat_id of the channel to be checked
   * @returns a valid ChannelMode if a channel with this chat_id exists, null otherwise
   */
  async channelType(chat_id: number): Promise<ChannelMode> {
    const channel = await this.channel(chat_id);
    if (channel) {
      return channel.mode;
    }
    return null;
  }

  /**
   * @param chat_id of the channel
   * @param login of the user to be checked
   */
  async isChannelMember(chat_id: number, login: string): Promise<boolean> {
    const channel = await this.channel(chat_id);
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
