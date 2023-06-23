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
import { channel } from 'diagnostics_channel';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly profileService: ProfileService,
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

  private joinRoom(client: Socket, roomName: string, login: string): boolean {
    if (!this.rooms[roomName]) {
      this.rooms[roomName] = new Set();
    }
    const hasPerm = this.chatService.checkPermission(login, +roomName);
    if (hasPerm) {
      client.join(roomName);
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
        const chat = await this.chatService.channel(query.chat_id);
        // console.log(chat.members);
        client.emit('fetch admins', chat.admins);
        client.emit(
          'fetch members',
          chat.members.filter((elem) => {
            return (
              elem.login !== chat.owner.login &&
              chat.admins.find((e) => {
                return e.login === elem.login;
              }) === undefined
            );
          }) || null,
        );
        client.emit('fetch banned', chat.blocked);
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
        const chat = await this.chatService.channel(query.chat_id);
        client.emit('fetch admins', chat.admins);
        client.emit(
          'fetch members',
          chat.members.filter((elem) => {
            return (
              elem.login !== chat.owner.login &&
              chat.admins.find((e) => {
                return e.login === elem.login;
              }) === undefined
            );
          }),
        );
        client.emit('fetch banned', chat.blocked);
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
        const suggest = await this.chatService.getSearchChats(query.login);
        client.emit('update preview', suggest);

        const roles = await this.chatService.channel(query.chat_id);
        const data = await this.chatService.notInChannelUsers(query.chat_id);
        this.server.to(query.chat_id).emit('invitation tags', data);
        this.server.to(query.chat_id).emit('fetch owner', [roles.owner]);
        this.server.to(query.chat_id).emit('fetch admins', roles.admins);
        this.server.to(query.chat_id).emit(
          'fetch members',
          roles.members.filter((elem) => {
            return (
              elem.login !== roles.owner.login &&
              roles.admins.find((e) => {
                return e.login === elem.login;
              }) === undefined
            );
          }),
        );

        client.emit('fetch_msgs', []);
        client.emit('fetch owner', []);
        client.emit('fetch admins', []);
        client.emit('fetch members', []);
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
            throw new Error('The password provided is invalid!');
          }
        }
        // all main checks passed
        await this.chatService.create(users, mode, query.name, query.password);
        const suggest = await this.chatService.getSearchChats(query.login);
        if (mode !== ChannelMode.PRIVATE)
          this.server.emit('add preview', suggest);
        else client.emit('add preview', suggest);
      } else {
        throw new Error('Invalid input');
      }
    } catch (error) {
      throwError(client, error.message);
    }
  }

  async sendChatStuff(client, chat_id, login, role) {
    // console.log('chat_id', chat_id, 'login', login);
    try {
      this.joinRoom(client, chat_id, login);
      const messages = await this.chatService.getMessages(chat_id);
      const muteds = await this.chatService.channelMutedUsers(chat_id);
      this.server.to(chat_id).emit('fetch muted', muteds);
      client.emit('fetch_msgs', messages);
      const settings = await this.chatService.getSettings(chat_id);
      client.emit('setting info', settings);
      const roles = await this.chatService.getChatRoles(chat_id);
      client.emit('fetch owner', [roles.owner]);
      client.emit('fetch admins', roles.admins);
      client.emit(
        'fetch members',
        roles.members.filter((elem) => {
          return (
            elem.login !== roles.owner.login &&
            roles.admins.find((e) => {
              return e.login === elem.login;
            }) === undefined
          );
        }),
      );
      const chatWithBanned = await this.chatService.chatWithBanned(chat_id);
      client.emit('fetch banned', chatWithBanned.blocked);
      client.emit('fetch role', role);
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
      const chat = await this.chatService.channel(query.chat_id);
      client.emit('fetch admins', chat.admins);
      client.emit(
        'fetch members',
        chat.members.filter((elem) => {
          return (
            elem.login !== chat.owner.login &&
            chat.admins.find((e) => {
              return e.login === elem.login;
            }) === undefined
          );
        }),
      );
      client.emit('admin success', { role: 'member' });
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
      const chat = await this.chatService.channel(query.chat_id);
      client.emit('fetch admins', chat.admins);
      client.emit(
        'fetch members',
        chat.members.filter((elem) => {
          return (
            elem.login !== chat.owner.login &&
            chat.admins.find((e) => {
              return e.login === elem.login;
            }) === undefined
          );
        }),
      );
      client.emit('admin success', { role: 'admin' });
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
      // console.log(role);
      client.emit('fetch role', role);

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
      // console.log('bulki', payload);
      const suggest = await this.chatService.getSearchChats(login);
      client.emit('search suggest', suggest);
    } catch (err) {
      throwError(client, 'Somexxdhing went wriong!');
    }
  }

  @SubscribeMessage('join channel')
  async handleJoin(client: any, payload: any) {
    try {
      const login = payload.login;
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
      if (userLogin !== undefined)
        await this.sendChatStuff(client, chat_id, userLogin, 'member');
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
      const roles = await this.chatService.getChatRoles(payload.chat_id);
      const data = await this.chatService.notInChannelUsers(payload.chat_id);
      this.server.to(payload.chat_id).emit('invitation tags', data);
      this.server.to(payload.chat_id).emit('fetch admins', roles.admins);
      this.server.to(payload.chat_id).emit(
        'fetch members',
        roles.members.filter((elem) => {
          return (
            elem.login !== roles.owner.login &&
            roles.admins.find((e) => {
              return e.login === elem.login;
            }) === undefined
          );
        }),
      );
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
        this.chatService.muteForChannel(
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
      this.chatService.unmuteForChannel(
        payload.login,
        payload.target_id,
        payload.chat_id,
      );
      const muteds = await this.chatService.channelMutedUsers(
        payload.channelId,
      );
      this.server.to(payload.channelId).emit('fetch muted', muteds);
    } catch (error) {
      return { error, body: null };
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
