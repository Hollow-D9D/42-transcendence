import { Inject, CACHE_MANAGER } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';

import { ChatService } from './chat.service';
import { throwError } from 'src/utils/gateway.utils';
import { parseToken } from 'src/utils/auth.utils';
import { ChannelMode, isValidChannelMode } from 'src/typeorm/channelmode.enum';
import { ProfileService } from '../profile/profile.service';
import { FriendsService } from 'src/profile/friends/friends.service';
import { channel } from 'diagnostics_channel';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly friendsService: FriendsService,
  ) {}

  @WebSocketServer()
  server: Server;

  private rooms: { [roomName: string]: Set<string> } = {};

  afterInit() {
    this.server.use((socket, next) => {
      let had = false;
      socket.onAny((event, args) => {
        if (args && args.token) {
          const payload = this.jwtService.verify(args.token, {
            secret: process.env.JWT_SECRET,
          });
          this.cacheM.get('logged_in').then((res: Array<string>) => {
            if (res && res.includes(<string>payload.login)) {
              had = true;
            }
          });
          args.login = payload.login;
        }
      });
      // if (had) next();
      // else next(new Error('Wrong login provided!'));

      next();
    });
  }

  handleConnection(client: any, ...args: any[]) {
    // console.log("connected", client);
  }

  handleDisconnect(client: any) {
    // this.leaveRoom(client, 'global');
  }

  private findRoom(client: Socket, login: string) {
    const rooms = Object.keys(this.rooms);
    for (const room of rooms) {
      if (this.rooms[room].has(login)) {
        return room;
      }
    }
  }

  private async joinRoom(
    client: Socket,
    roomName: string,
    login: string,
  ): Promise<boolean> {
    if (!this.rooms[roomName]) {
      this.rooms[roomName] = new Set();
    }
    const hasPerm = await this.chatService.checkPermission(login, +roomName);
    if (hasPerm) {
      await client.join(roomName);
      this.rooms[roomName].add(login);
      return true;
    }
    return false;
  }

  private leaveRoom(client: Socket, roomName: string, login: string) {
    client.leave(roomName);
    if (this.rooms[roomName]) {
      this.rooms[roomName].delete(login);
      if (this.rooms[roomName].size === 0) {
        delete this.rooms[roomName];
      }
    }
  }

  @SubscribeMessage('ban user')
  async banFromChannel(client: Socket, query: any) {
    try {
      if (query) {
        if (!query.login) {
          // shouldn't get here
          throw 'Invalid user info!';
        }
        if (!query.chat_id || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          throw 'No valid channel name/target user specified!';
        }
        const channelWithName = await this.chatService.channel(query.chat_id);
        if (!channelWithName) {
          // no channel with this name
          throw 'No channel with this name!';
        }
        const userWithLogin = await this.chatService.users([
          query.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          throw 'No user with username login/target!';
        }
        await this.chatService.banFromChannel(
          query.login,
          query.target,
          query.chat_id,
        );
        await this.server.emit('update channel request');
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  @SubscribeMessage('unban user')
  async unbanForChannel(client: Socket, query: any) {
    try {
      if (query) {
        if (!query.login) {
          // shouldn't get here
          throw 'Invalid user info!';
        }
        if (!query.chat_id || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          throw 'No valid channel name/target user specified!';
        }
        const channelWithName = await this.chatService.channel(query.chat_id);
        if (!channelWithName) {
          // no channel with this name
          throw 'No channel with this name!';
        }
        const userWithLogin = await this.chatService.users([
          query.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          throw 'No user with username login/target!';
        }
        await this.chatService.unbanForChannel(
          query.login,
          query.target,
          query.chat_id,
        );
        await this.server.emit('update channel request');
        //   const chat = await this.chatService.channel(query.chat_id);
        //   client.emit('fetch admins', chat.admins);
        //   client.emit(
        //     'fetch members',
        //     chat.members.filter((elem) => {
        //       return (
        //         elem.login !== chat.owner.login &&
        //         chat.admins.find((e) => {
        //           return e.login === elem.login;
        //         }) === undefined
        //       );
        //     }),
        //   );
        //   client.emit('fetch banned', chat.blocked);
        // }
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  @SubscribeMessage('leave channel')
  async leaveChannel(client: Socket, query: any) {
    try {
      // const payload = getPayload(headers);
      if (query.login) {
        if (!query.login) {
          // shouldn't get here
          throwError(client, 'Invalid user info!');
          return;
        }
        if (!query.chat_id) {
          // doesn't have a valid channel `name` specified
          throwError(client, 'No valid channel name specified!');
          return;
        }
        const channelWithName = await this.chatService.channel(query.chat_id);
        if (!channelWithName) {
          // no channel with this name
          throwError(client, 'No channel with this name!');
          return;
        }
        if (
          !(await this.chatService.isChannelMember(query.chat_id, query.login))
        ) {
          // isn't a member of the channel
          throwError(client, 'You are not a member of this channel!');
          return;
        }
        await this.chatService.leaveChannel(query.login, query.chat_id);
        // const suggest = await this.chatService.getSearchChats(query.login);
        // client.emit('update preview');

        // const roles = await this.chatService.channel(query.chat_id);
        // const data = await this.chatService.notInChannelUsers(query.chat_id);

        // ('invitation tags', data);
        // this.server.to(query.chat_id).emit('fetch owner', [roles.owner]);
        // this.server.to(query.chat_id).emit('fetch admins', roles.admins);
        // this.server.to(query.chat_id).emit(
        //   'fetch members',
        //   roles.members.filter((elem) => {
        //     return (
        //       elem.login !== roles.owner.login &&
        //       roles.admins.find((e) => {
        //         return e.login === elem.login;
        //       }) === undefined
        //     );
        //   }),
        // );
        await this.server.emit('update channel request');
      }
    } catch (error) {
      throwError(client, error.message);
    }
  }

  @SubscribeMessage('create dm')
  async handleCreateDm(client: Socket, query: any) {
    try {
      if (query) {
        if (!query.email) {
          // shouldn't get here
          throw new Error('Invalid user info!');
        }
        const logins: string[] = [query.email];
        // add another login if necessary

        // chat, not a channel
        if (query.target_login) logins.push(query.target_login);
        // `target` user is expected to be provided
        else
          throw new Error('No valid target user specified for the new chat!');

        // retreive user(s)
        const users = await this.chatService.users(logins);
        // and validate `login`, `target`, `name` and `password` whenever necessary

        if (users.length !== 2) {
          // both `login` and `target` are expected to yield valid users
          // if not, the request in invalid
          throw new Error('No valid target user specified for the new chat!');
        }
        if (await this.chatService.isBlocked(query.email, query.target_login)) {
          // `login` cannot create a chat with `target` that has blocked them
          throw new Error('You are blocked by the target user!');
        }
        const channelWithName = await this.chatService.channelByName(
          users[0].id > users[1].id
            ? `DM:${users[0].nickname}:${users[1].nickname}`
            : `DM:${users[1].nickname}:${users[0].nickname}`,
        );
        // all main checks passed
        if (!channelWithName) {
          await this.chatService.create(
            users,
            null,
            query.name,
            query.password,
          );
        }
        const suggest = await this.chatService.getSearchChats(query.email);

        client.emit('add preview', suggest);
      } else {
        throw new Error('Invalid input');
      }
    } catch (error) {
      throwError(client, error.message);
    }
  }

  @SubscribeMessage('create')
  async handleCreate(client: Socket, query: any) {
    try {
      if (query) {
        if (!query.login) {
          // shouldn't get here
          throw new Error('Invalid user info!');
        }
        const logins: string[] = [query.login];
        // add another login if necessary
        let mode: ChannelMode = null;
        // only set `mode` to a non-null value when a user sent something valid
        if (isValidChannelMode(query.mode)) {
          mode = query.mode as ChannelMode;
        }
        if (!mode) {
          // chat, not a channel
          if (query.target) logins.push(query.target);
          // `target` user is expected to be provided
          else
            throw new Error('No valid target user specified for the new chat!');
        }
        // retreive user(s)
        const users = await this.chatService.users(logins);
        // and validate `login`, `target`, `name` and `password` whenever necessary
        if (!mode) {
          // chat, not a channel
          if (users.length !== 2) {
            // both `login` and `target` are expected to yield valid users
            // if not, the request in invalid
            throw new Error('No valid target user specified for the new chat!');
          }
          if (this.chatService.isBlocked(query.login, query.target)) {
            // `login` cannot create a chat with `target` that has blocked them
            throw new Error('You are blocked by the target user!');
          }
        } else {
          // channel, not a chat
          // not checking whether `users.length === 1` in case when
          // `validMode === true` since we expect that `login` provided
          // by ... is always valid
          if (!query.name /* || !query.password*/) {
            // doesn't have a valid `name` and `password` specified
            throw new Error('No valid channel name and/or password specified!');
          }
          // check that a chat with this name hasn't already been created
          const channelWithName = await this.chatService.channelByName(
            query.name,
          );
          if (channelWithName) {
            // channelWithName !== undefined
            throw new Error(
              'A channel with this name has already been created!',
            );
          }
          // check the validity of the password provided for PROTECTED channels
          if (
            mode == ChannelMode.PROTECTED &&
            !this.chatService.isValidPassword(query.password)
          ) {
            client.emit('invalid password');

            throw new Error('The password provided is invalid!');
          }
        }
        // all main checks passed
        await this.chatService.create(users, mode, query.name, query.password);
        const suggest = await this.chatService.getSearchChats(query.login);
        if (mode !== ChannelMode.PRIVATE)
          this.server.emit('update preview', suggest);
        else client.emit('add preview', suggest);
      } else {
        throw new Error('Invalid input');
      }
    } catch (error) {
      throwError(client, error.message);
    }
  }

  @SubscribeMessage('update setting')
  async handleUpdateSetting(client: Socket, query: any) {
    try {
      if (query) {
        if (!query.login) {
          // shouldn't get here
          throw 'Invalid user info!';
        }
      }
      if (!query.chat_id) {
        // doesn't have a valid channel `name`/`target` user specified
        throw 'No valid channel name/target user specified!';
      }
      const channelWithName = await this.chatService.channel(query.chat_id);
      if (!channelWithName) {
        // no channel with this name
        throw 'No channel with this name!';
      }
      if (
        query.isPassword &&
        !this.chatService.isValidPassword(query.newPassword)
      ) {
        client.emit('invalid password');
        throw new Error('The password provided is invalid!');
      }

      await this.chatService.updateChannel(query);
      const settings = await this.chatService.getSettings(query.chat_id);
      client.emit('setting info', settings);
      this.server.emit('update preview');
    } catch (error) {
      return { error, body: null };
    }
  }

  // @SubscribeMessage('get chats')
  // async getUserChannels (client: Socket, payload: any) {

  // }

  async sendChatStuff(client, chat_id, login, role) {
    // console.log('chat_id', chat_id, 'login', login);
    try {
      await this.joinRoom(client, chat_id, login);
      const messages = await this.chatService.getMessages(chat_id);
      client.emit('fetch_msgs', messages);
      const settings = await this.chatService.getSettings(chat_id);
      client.emit('setting info', settings);
      const roles = await this.chatService.getChatRoles(chat_id);
      if (roles.owner) client.emit('fetch owner', [roles.owner]);
      if (roles.admins.length !== 0) client.emit('fetch admins', roles.admins);
      client.emit(
        'fetch members',
        roles.members.filter((elem) => {
          return (
            elem.login !== roles.owner?.login &&
            roles.admins.find((e) => {
              return e.login === elem.login;
            }) === undefined
          );
        }),
      );

      const chatWithBanned = await this.chatService.chatWithBanned(chat_id);
      client.emit('fetch banned', chatWithBanned.blocked);
      client.emit('fetch role', role);
      const muteds = await this.chatService.channelMutedUsers(chat_id);
      client.emit('fetch muted', muteds);
      const data = await this.chatService.notInChannelUsers(chat_id);
      client.emit('invitation tags', data);
    } catch (err) {
      throw err;
    }
  }

  @SubscribeMessage('get invitation tags')
  async sendTags(client: Socket, payload: any) {
    try {
      // console.log(await this.chatService.allUsers(1))
      const data = await this.chatService.notInChannelUsers(payload.chat_id);
      client.emit('invitation tags', data);
    } catch (err) {
      throwError(client, err.message);
    }
  }
  @SubscribeMessage('get channel')
  async sendChannel(client: Socket, payload: any) {
    const channel = await this.chatService.channel(payload.chat_id);
    client.emit('fetch channel', channel);
  }

  @SubscribeMessage('not admin')
  async unsetAdmin(client: Socket, query: any) {
    try {
      if (query) {
        if (!query.login) {
          // shouldn't get here
          throw 'Invalid user info!';
        }
      }
      if (!query.chat_id || !query.target) {
        // doesn't have a valid channel `name`/`target` user specified
        throw 'No valid channel name/target user specified!';
      }
      const channelWithName = await this.chatService.channel(query.chat_id);
      if (!channelWithName) {
        // no channel with this name
        throw 'No channel with this name!';
      }
      const userWithLogin = await this.chatService.users([
        query.login,
        query.target,
      ]);
      if (userWithLogin.length !== 2) {
        // no user with the username login/target
        throw 'No user with username login/target!';
      }
      await this.chatService.revokeAdmin(
        query.login,
        query.target,
        query.chat_id,
      );

      await this.server.emit('update channel request');
    } catch (error) {
      return { error, body: null };
    }
  }
  @SubscribeMessage('be admin')
  async grantAdmin(client: Socket, query: any) {
    try {
      // const payload = getPayload(headers);
      // if (payload) {
      if (!query.login) {
        // shouldn't get here
        throwError(client, 'Invalid user info!');
      }
      if (!query.chat_id || !query.target) {
        // doesn't have a valid channel `name`/`target` user specified
        throwError(client, 'No valid channel name/target user specified!');
      }
      const channelWithName = await this.chatService.channel(query.chat_id);
      if (!channelWithName) {
        // no channel with this name
        throwError(client, 'No channel with this name!');
      }
      const userWithLogin = await this.chatService.users([
        query.login,
        query.target,
      ]);
      if (userWithLogin.length !== 2) {
        // no user with the username login/target
        throwError(client, 'No user with username login/target!');
      }
      await this.chatService.grantAdmin(
        query.login,
        query.target,
        query.chat_id,
      );
      await this.server.emit('update channel request');
    } catch (error) {
      throwError(client, error.message);
    }
  }

  @SubscribeMessage('into channel')
  async intoMessage(client: Socket, payload: any) {
    try {
      const login = payload.login;
      if (!login) throw new Error('No valid user login provided!');
      const chat_id = payload.chat_id;
      if (!chat_id) throw new Error('No valid chat_id provided!');
      const isMember = await this.chatService.isChannelMember(chat_id, login);
      // const password = payload.password || '';
      // await this.chatService.joinChannel(login, chat_id, password);
      // join to a room
      const role: string = await this.chatService.getRole(login, chat_id);
      client.emit('fetch role', role);
      console.log(isMember, role, login);
      if (isMember) {
        await this.sendChatStuff(client, chat_id, login, role);
      } else {
        client.emit('fetch_msgs', []);
        client.emit('fetch owner', []);
        client.emit('fetch admins', []);
        client.emit('fetch members', []);
        client.emit('fetch banned', []);
      }
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('get search suggest')
  async handleSuggest(client: any, payload: any) {
    try {
      const login = payload.login;
      const friends = await (
        await this.friendsService.getFriends(login)
      ).friends;
      const channels = await this.chatService.getSearchChats(login);
      client.emit('search suggest', { friends: friends, channels: channels });
    } catch (err) {
      console.log(err);

      throwError(client, 'Somexxdhing went wriong!');
    }
  }

  @SubscribeMessage('join channel')
  async handleJoin(client: any, payload: any) {
    try {
      const login = payload.target === -1 ? payload.login : payload.target;
      const chat_id = payload.chat_id;
      if (!login) throwError(client, 'No login');
      if (!chat_id) throwError(client, 'No chat_id');
      const password = payload.password || '';
      // await this.chatService.joinChannel(login, chat_id, password);

      // if (this.joinRoom(client, chat_id, login)) {
      //   client.emit('join_chat', { chat_id: chat_id });
      // } else {
      //   throwError(client, 'No permission');
      // }
      // const profile = await this.profileService.getProfile(login);
      // this.server.to(chat_id).emit('new connection', profile);

      const isInvited = payload.target !== -1 ? true : false;
      const userLogin = await this.chatService.joinChannel(
        login,
        chat_id,
        password,
        isInvited,
      );
      console.log(userLogin);
      if (userLogin !== undefined)
        await this.server.emit('update channel request');

      // const role = await this.chatService.getRole(payload.login, chat_id);
      // client.emit('fetch role', role);
      if (isInvited) {
        console.log('emmitting to ', chat_id);

        this.server.emit('update preview');
      }
      console.log('es hasa ste');
    } catch (err) {
      throwError(client, 'Somexxdhing went wriong!');
    }
  }
  @SubscribeMessage('kick out')
  async kickFromChannel(client: any, payload: any) {
    try {
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          throw 'Invalid user info!';
        }
      }
      if (!payload.chat_id || !payload.target) {
        // doesn't have a valid channel `name`/`target` user specified
        throw 'No valid channel id/target user specified!';
      }
      const channelWithName = await this.chatService.channel(payload.chat_id);
      if (!channelWithName) {
        // no channel with this id
        throw 'No channel with this id!';
      }
      const userWithLogin = await this.chatService.users([
        payload.login,
        payload.target,
      ]);
      if (userWithLogin.length !== 2) {
        // no user with the username login/target
        throw 'No user with username login/target!';
      }
      await this.chatService.kickFromChannel(
        payload.login,
        payload.target,
        payload.chat_id,
      );
      await this.server.emit('update channel request');
    } catch (error) {
      return { error, body: null };
    }
  }

  @SubscribeMessage('mute user')
  async muteForChannel(client: any, payload: any) {
    try {
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          throw 'Invalid user info!';
        }
        if (!payload.channelId || !payload.target || !payload.duration) {
          // doesn't have a valid channel `name`/`target` user/mute `duration` specified
          throw 'No valid channel name/target user/mute duration specified!';
        }
        const channelWithName = await this.chatService.channel(
          payload.channelId,
        );
        if (!channelWithName) {
          // no channel with this name
          throw 'No channel with this name!';
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          payload.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          throw 'No user with username login/target!';
        }
        const duration = Number(payload.duration);
        if (isNaN(duration)) {
          // duration isn't a number
          throw 'Invalid mute duration specified!';
        }
        await this.chatService.muteForChannel(
          payload.login,
          payload.target,
          duration,
          payload.channelId,
        );
        const muteds = await this.chatService.channelMutedUsers(
          payload.channelId,
        );
        this.server.to(payload.channelId).emit('fetch muted', muteds);
      }
    } catch (error) {
      throwError(client, error);
    }
  }

  @SubscribeMessage('unmute user')
  async unmuteForChannel(client: any, payload: any) {
    try {
      if (payload) {
        if (!payload.login) {
          throw 'Invalid user info!';
        }
        if (!payload.chat_id || !payload.target) {
          // doesn't have a valid channel `name`/`target` user specified
          throw 'No valid channel name/target user specified!';
        }
        const channelWithName = await this.chatService.channel(payload.chat_id);
        if (!channelWithName) {
          // no channel with this name
          throw 'No channel with this name!';
        }
      }
      const userWithLogin = await this.chatService.users([
        payload.login,
        payload.target,
      ]);
      if (userWithLogin.length !== 2) {
        // no user with the username login/target
        throw 'No user with username login/target!';
      }
      await this.chatService.unmuteForChannel(
        payload.login,
        payload.target_id,
        payload.chat_id,
      );
      const muteds = await this.chatService.channelMutedUsers(payload.chat_id);

      this.server.to(payload.chat_id).emit('fetch muted', muteds);
    } catch (error) {
      console.log(error);

      throwError(client, 'Something went wrong');
    }
  }

  // @SubscribeMessage('leave_chat')
  // async handleLeave(client: any, payload: any) {
  //   const login = payload.login;
  //   const roomName = payload.chat_id;
  //   if (!login) throwError(client, 'No login');
  //   if (!roomName) throwError(client, 'No chat_id');

  //   // this.leaveRoom(client, roomName, login);
  // }

  // TODO: check if user is blocked or not
  @SubscribeMessage('new_message')
  async handleMessage(client: any, payload: any) {
    try {
      const jwt = payload.token;
      if (!jwt) throwError(client, 'No token');
      const jwtPayload = parseToken(jwt);
      const sender = jwtPayload.login;
      const chat_id = payload.chatId;
      const message = payload.message;
      if (!sender) throwError(client, 'No sender');
      if (!chat_id) throwError(client, 'No chat_id');
      if (!message) throwError(client, 'No message');
      const isMuted = await this.chatService.findMutedInChannel(
        chat_id,
        jwtPayload.id,
      );
      if (isMuted) return;
      const msg_id = await this.chatService.addMessage(
        chat_id,
        sender,
        message,
      );
      const addedMsg = await this.chatService.getMessage(msg_id);
      this.server.to(chat_id).emit('message', addedMsg);
    } catch (err) {
      throwError(client, err);
    }
  }
}
