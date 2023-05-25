import { Inject, CACHE_MANAGER } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
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
    throw new Error('Method not implemented.');
  }

  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
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

      // await this.chatService.addMessage(chat_id, sender, message);
      // this.server.to(chat_id).emit('message', { sender, message });
    } catch (err) {
      throwError(client, err);
    }
  }
}
