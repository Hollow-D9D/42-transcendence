import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { GameMatchService } from './game-match.service';
import { Server, Socket } from 'socket.io';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';

interface UserSocket {
  login: string;
  socket: Socket;
}

@WebSocketGateway({ cors: true })
export class GameMatchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly gameMatchService: GameMatchService,
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly jwtService: JwtService,
  ) {
    this.cacheM.set('user_sockets', []);
  }

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

  handleConnection(client: Socket) {
    // console.log('Client connected:', client.id);
    // Additional logic for handling connection
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Additional logic for handling disconnection
  }

  @SubscribeMessage('start-game')
  async handleStartGame(client: Socket, payload: any) {
    console.log('start-game', payload);
    if (!payload.login)
      client.emit('start-game', {
        error: new Error('No login provided!'),
        body: null,
      });
    const reponse = await this.gameMatchService.addToQueue(payload.login);
    client.emit('start-game', { error: null, body: reponse });
  }

  @SubscribeMessage('new-connection')
  async handleNewConnection(client: Socket, payload: any) {
    console.log('new-connection');
    this.addUserSocket(payload.login, client);
  }

  async addUserSocket(login: string, socket: Socket) {
    try {
      let had = false;
      const pair: UserSocket = { login, socket };
      const userSockets: UserSocket[] = await this.cacheM.get('user_sockets');
      userSockets.forEach((userSocket) => {
        if (userSocket.login === login) {
          userSocket.socket = socket;
          had = true;
        }
      });
      if (!had) userSockets.push(pair);
      await this.cacheM.set('user_sockets', userSockets);
    } catch (error) {
      throw error;
    }
  }
}
