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
import { getPayload } from 'src/utils/auth.utils';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  private rooms: { [roomName: string]: Set<string> } = {};

  afterInit() {
    console.log('should be uncommented');
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
    // const hasPerm = this.chatService.checkPermission(login, +roomName);
    // if (hasPerm) {
    //   client.join(roomName);
    //   this.rooms[roomName].add(login);
    //   return true;
    // }
    return false;
  }

  // private leaveRoom(client: Socket, roomName: string, login: string) {
  //   client.leave(roomName);
  //   if (this.rooms[roomName]) {
  //     this.rooms[roomName].delete(login);
  //     if (this.rooms[roomName].size === 0) {
  //       delete this.rooms[roomName];
  //     }
  //   }
  // }

  @SubscribeMessage('join_chat')
  async handleJoin(client: any, payload: any) {
    const login = payload.login;
    const roomName = payload.chat_id;
    if (!login) throwError(client, 'No login');
    if (!roomName) throwError(client, 'No chat_id');

    if (this.joinRoom(client, roomName, login)) {
      client.emit('join_chat', { chat_id: roomName });
    } else {
      throwError(client, 'No permission');
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeave(client: any, payload: any) {
    const login = payload.login;
    const roomName = payload.chat_id;
    if (!login) throwError(client, 'No login');
    if (!roomName) throwError(client, 'No chat_id');

    // this.leaveRoom(client, roomName, login);
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any) {
    try {
      const jwt = payload.token;
      if (!jwt) throwError(client, 'No token');
      const jwtPayload = getPayload(jwt);

      const sender = jwtPayload.login;
      const chat_id = payload.chat_id;
      const message = payload.message;

      if (!sender) throwError(client, 'No sender');
      if (!chat_id) throwError(client, 'No chat_id');
      if (!message) throwError(client, 'No message');

      await this.chatService.addMessage(chat_id, sender, message);
      this.server.to(chat_id).emit('message', { sender, message });
    } catch (err) {
      throwError(client, err);
    }
  }
}
