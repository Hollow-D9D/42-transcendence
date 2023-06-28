import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { GameMatchService } from './game-match.service';
import { ProfileService } from 'src/profile/profile.service';
import { Server, Socket } from 'socket.io';
import { CACHE_MANAGER, Inject } from '@nestjs/common';

import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from 'src/typeorm/userstatus.enum';
import { throwError } from 'src/utils/gateway.utils';

interface UserSocket {
  login: string;
  socket: string;
}

@WebSocketGateway({ cors: true })
export class GameMatchGateway implements OnGatewayInit {
  constructor(
    private readonly gameMatchService: GameMatchService,
    private readonly profileService: ProfileService,
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly jwtService: JwtService,
  ) {
    this.cacheM.set('user_sockets', [], 0);
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

  // handleConnection(client: Socket) {
  //   // console.log('Client connected:', client.id);
  //   // Additional logic for handling connection
  // }

  // handleDisconnect(client: Socket) {
  //   console.log('Client disconnected:', client.id);
  //   // Additional logic for handling disconnection
  // }

  @SubscribeMessage('send invite')
  async handleInviteGame(client: Socket, payload: any) {
    try {
      const userSockets: UserSocket[] =
        (await this.cacheM.get('user_sockets')) || [];
      const player1 = userSockets.find((e) => {
        return e.login === payload.login;
      });
      const player2 = userSockets.find((e) => {
        return e.login === payload.target;
      });
      if (player1 === undefined || player2 === undefined)
        throw 'invalid user or target';
      const info = await this.gameMatchService.getInviteInfo(payload.login);
      this.server
        .to(player2.socket)
        .emit('game invitation', { user: info.user });
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('decline game')
  async handleDeclineGame(client: Socket, payload: any) {
    try {
      const userSockets: UserSocket[] =
        (await this.cacheM.get('user_sockets')) || [];
      const player1 = userSockets.find((e) => {
        return e.login === payload.game.inviterLogin;
      });
      if (player1 === undefined) throw 'invalid user or target';
      this.server.to(player1.socket).emit('game declined', payload.login);
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('start game')
  async handleStartGame(client: Socket, payload: any) {
    try {
      if (!payload.login) throw new Error('No login provided!');
      const response = await this.gameMatchService.addToQueue(payload.login);
      console.log('start game', response);
      if (response.matching) {
        await this.startGameUpdate(response.response.player1.login);
        await this.startGameUpdate(response.response.player2.login);
      }
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('cancel game')
  async handleCancelGame(client: Socket, payload: any) {
    try {
      console.log('cancel game', payload);
      if (!payload.login) throw new Error('No login provided!');
      await this.gameMatchService.cancelMatchLookup(payload.login);
    } catch (err) {
      throwError(client, err.message);
    }
  }

  async startGameUpdate(login: string) {
    const userSockets: UserSocket[] = await this.cacheM.get('user_sockets');
    userSockets.forEach((userSocket) => {
      if (userSocket.login === login) {
        console.log('start game', login);
        // this.server.to(userSocket.socket).emit('start game', { login });
      }
    });
    // await this.profileService.editStatus(login, UserStatus.INGAME);
  }

  @SubscribeMessage('end-game')
  async handleEndGame(client: Socket, payload: any) {
    try {
      if (!payload.login) throw new Error('No login provided!');
      // const reponse = await
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('new-connection')
  async handleNewConnection(client: Socket, payload: any) {
    console.log('new-connection');
    this.addUserSocket(payload.login, client);
  }

  async addUserSocket(login: string, socket: Socket) {
    try {
      let had = false;
      const pair: UserSocket = { login, socket: socket.id };
      const userSockets: UserSocket[] =
        (await this.cacheM.get('user_sockets')) || [];
      userSockets?.forEach((userSocket) => {
        if (userSocket.login === login) {
          userSocket.socket = socket.id;
          had = true;
        }
      });
      if (!had) userSockets.push(pair);
      await this.cacheM.set('user_sockets', userSockets, 0);
      console.log(userSockets);
    } catch (error) {
      throw error;
    }
  }
}
