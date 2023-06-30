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
class Vector2 {
  x: number;
  y: number;

  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }

  changeVal(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  addX(x: number) {
    this.x += x;
  }

  addY(y: number) {
    this.y += y;
  }
}

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

class Game {
  constructor() {
    this.tickCount = 0;
    this.getRandDirection(null);
    this.ball.pos.x = 50;
    this.ball.pos.y = 50;
  }
  tickCount: number;
  interval: NodeJS.Timeout;
  id: string;
  leftTile: any = {
    pos: { x: 10, y: 45 },
    size: new Vector2(1, 10),
    vel: 0,
    acc: 0,
    upPressed: false,
    downPressed: false,
  };
  rightTile: any = {
    pos: { x: 90, y: 45 },
    size: new Vector2(1, 10),
    vel: 0,
    acc: 0,
    upPressed: false,
    downPressed: false,
  };
  ball: any = {
    pos: new Vector2(100 / 2, 100 / 2),
    vel: new Vector2(0, 0),
    tick: () => {
      this.ball.checkCollision();
      this.ball.pos.addX(this.ball.vel.x);
      this.ball.pos.addY(this.ball.vel.y);
    },
    checkCollision: () => {
      const startBX = this.ball.pos.x;
      const startBY = this.ball.pos.y;
      if (this.ball.pos.x < 20) {
        // console.log('left');

        const endBX = startBX + 1;
        const endBY = startBY + 1;
        const startTX = this.leftTile.pos.x;
        const startTY = this.leftTile.pos.y;
        const endTX = startTX + 1;
        const endTY = startTY + 10;

        if (
          startBX <= endTX &&
          endBX >= startTX &&
          startBY <= endTY &&
          endBY >= startTY
        ) {
          if (this.ball.vel.x < 0) this.getRandDirection(true);

          // console.log('Tile collision detected');
          return;
        }
      } else if (this.ball.pos.x > 80) {
        // console.log('right');
        const endBX = startBX + 1;
        const endBY = startBY + 1;
        const startTX = this.rightTile.pos.x;
        const startTY = this.rightTile.pos.y;
        const endTX = startTX + 1;
        const endTY = startTY + 10;

        if (
          startBX <= endTX &&
          endBX >= startTX &&
          startBY <= endTY &&
          endBY >= startTY
        ) {
          if (this.ball.vel.x > 0) this.getRandDirection(false);

          // console.log('Tile collision detected');
          return;
        }
      }
      if (startBY <= 2 || startBY >= 100 - 2) {
        this.ball.vel.y = -this.ball.vel.y;
        // console.log('Collision');
      }

      if (startBX <= 1) {
        this.rightScore++;
        this.resetGame(false);
      }
      if (startBX >= 100 - 1) {
        this.leftScore++;
        this.resetGame(true);
      }
    },
  };
  leftScore = 0;
  rightScore = 0;

  upInputL: false;
  downInputL: false;
  upInputR: false;
  downInputR: false;

  getRandDirection(leftWon: boolean | null): void {
    if (leftWon == null) {
      // let angle = Math.PI;
      let angle = Math.random() * Math.PI * 2;
      if (Math.abs(angle - 1) < 0.7 && Math.abs(angle - 1) > 0.3) angle -= 0.5;
      this.ball.vel.x = (Math.cos(angle) * 3) / 2;
      this.ball.vel.y = (Math.sin(angle) * 3) / 2;
      return;
    }
    if (leftWon) {
      const angle =
        (clamp(Math.random() * Math.PI * 2, Math.PI / 3, (5 * Math.PI) / 3) -
          Math.PI) /
        2;
      this.ball.vel.x = (Math.cos(angle) * 3) / 2;
      this.ball.vel.y = (Math.sin(angle) * 3) / 2;
      return;
    }
    const angle =
      (clamp(Math.random() * Math.PI * 2, Math.PI / 3, (5 * Math.PI) / 3) +
        Math.PI) /
      2;
    this.ball.vel.x = (Math.cos(angle) * 3) / 2;
    this.ball.vel.y = (Math.sin(angle) * 3) / 2;
  }

  resetGame(leftWon: boolean): void {
    this.ball.pos = new Vector2(50, Math.random() * 100);
    this.getRandDirection(leftWon);
  }
  handleInputL(): void {
    if (this.upInputL && this.downInputL) {
      this.leftTile.acc = 0;
    } else if (this.upInputL) {
      this.leftTile.acc = -1;
    } else if (this.downInputL) {
      this.leftTile.acc = 1;
    } else {
      if (this.leftTile.acc !== 0) this.leftTile.acc = 0;
    }
  }

  handleInputR(): void {
    if (this.upInputR && this.downInputR) {
      this.rightTile.acc = 0;
    } else if (this.upInputR) {
      this.rightTile.acc = -1;
    } else if (this.downInputR) {
      this.rightTile.acc = 1;
    } else {
      if (this.rightTile.acc !== 0) this.rightTile.acc = 0;
    }
  }

  leftTiletick(): void {
    // console.log('tick');
    if (this.leftTile.acc != 0) {
      this.leftTile.pos.y = clamp(
        this.leftTile.pos.y + this.leftTile.vel,
        0,
        100 - this.leftTile.size.y,
      );
      this.leftTile.vel += this.leftTile.acc;
    } else if (this.leftTile.vel != 0) {
      (this.leftTile.pos.y = clamp(
        this.leftTile.pos.y + this.leftTile.vel,
        0,
        100 - this.leftTile.size.y,
      )),
        (this.leftTile.vel += this.leftTile.vel < 0 ? 0.5 : -0.5);
    }
  }

  rightTiletick(): void {
    // console.log('tick');
    if (this.rightTile.acc != 0) {
      this.rightTile.pos.y = clamp(
        this.rightTile.pos.y + this.rightTile.vel,
        0,
        100 - this.rightTile.size.y,
      );
      this.rightTile.vel += this.rightTile.acc;
    } else if (this.rightTile.vel != 0) {
      (this.rightTile.pos.y = clamp(
        this.rightTile.pos.y + this.rightTile.vel,
        0,
        100 - this.rightTile.size.y,
      )),
        (this.rightTile.vel += this.rightTile.vel < 0 ? 0.5 : -0.5);
    }
  }

  tick(): any {
    this.tickCount++;
    this.ball.tick();
    this.leftTiletick();
    this.rightTiletick();
    const coordinates = {
      leftTile: { x: this.leftTile.pos.x, y: this.leftTile.pos.y },
      rightTile: {
        x: this.rightTile.pos.x,
        y: this.rightTile.pos.y,
      },
      ball: { x: this.ball.pos.x, y: this.ball.pos.y },
      size: 100,
      leftScore: this.leftScore,
      rightScore: this.rightScore,
    };
    // console.log('game');
    return coordinates;
  }
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
  private game: Game[] = [];
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

  handleConnection(client: Socket) {
    // Additional logic for handling connection
    console.log('Client connected:', client.id);
    client.emit('request new connection', {});
  }

  // handleDisconnect(client: Socket) {
  //   console.log('Client disconnected:', client.id);
  //   // Additional logic for handling disconnection
  // }

  private async joinRoom(
    client: Socket,
    roomName: string,
    login: string,
  ): Promise<boolean> {
    if (!this.rooms[roomName]) {
      this.rooms[roomName] = new Set();
    }
    await client.join(roomName);
    this.rooms[roomName].add(login);
    return true;
  }

  private async leaveRoom(client: Socket, roomName: string, login: string) {
    await client.leave(roomName);
    if (this.rooms[roomName]) {
      this.rooms[roomName].delete(login);
      if (this.rooms[roomName].size === 0) {
        delete this.rooms[roomName];
      }
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket, payload: any) {
    try {
      console.log('disconnect');
      let user = await this.profileService.getProfile(payload.login);
      user.user.status = 0;
      await user.user.save();
    } catch (err) {
      throwError(client, err.message);
    }
  }

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
    console.log('start game', payload);

    try {
      if (!payload.login) throw new Error('No login provided!');
      const response = await this.gameMatchService.addToQueue(payload.login);
      console.log('response', response.matching);
      if (response.matching) {
        await this.startGameUpdate(
          response.response.player1.login,
          response.response,
        );
        await this.startGameUpdate(
          response.response.player2.login,
          response.response,
        );
      }
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('accept game invite')
  async handleAcceptGameInvite(client: Socket, payload: any) {
    try {
      if (!payload.login1) throw new Error('No login1 provided!');
      if (!payload.login2) throw new Error('No login2 provided!');
      const user1: any = await this.profileService.getProfile(payload.login1);
      const user2: any = await this.profileService.getProfile(payload.login2);
      const response = await this.gameMatchService.startMatch(
        user1.user,
        user2.user,
      );
      if (response) {
        await this.startGameUpdate(response.player1.login, response);
        await this.startGameUpdate(response.player2.login, response);
      }
    } catch (err) {
      console.log(err);
      //asdasd
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

  async startGameUpdate(login: string, response: any) {
    const userSockets: UserSocket[] = await this.cacheM.get('user_sockets');
    const client = this.server.sockets.sockets.get(
      userSockets.find((e) => e.login === login).socket,
    );
    console.log(client.id);
    this.joinRoom(client, '' + response.id, login);
    userSockets.forEach((userSocket) => {
      if (userSocket.login === login) {
        this.server
          .to(userSocket.socket)
          .emit('start game', { matching: true, response });
      }
    });
    await this.profileService.editStatus(login, UserStatus.INGAME);
  }

  @SubscribeMessage('end-game')
  async handleEndGame(client: Socket, payload: any) {
    try {
      // if (!payload.login) throw new Error('No login provided!');
    } catch (err) {
      throwError(client, err.message);
    }
  }

  @SubscribeMessage('new-connection')
  async handleNewConnection(client: Socket, payload: any) {
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
    } catch (error) {
      throw error;
    }
  }

  @SubscribeMessage('input')
  handleInputL(client: any, payload: any): void {
    if (payload.isPlayer1 === 'true') {
      if (payload.up !== undefined) {
        this.game[payload.room_id].upInputL = payload.up;
      } else this.game[payload.room_id].downInputL = payload.down;

      this.game[payload.room_id].handleInputL();
    } else {
      if (payload.up !== undefined) {
        this.game[payload.room_id].upInputR = payload.up;
      } else this.game[payload.room_id].downInputR = payload.down;

      this.game[payload.room_id].handleInputR();
    }
  }

  @SubscribeMessage('game')
  handleMessage(client: any, payload: any) {
    this.joinRoom(client, '' + payload.room_id, payload.login);
    // clearInterval(this.interval);
    const WINSCORECOUNT = 3;
    const TICK_INTERVAL = 60;
    console.log('game', payload.room_id);
    if (!this.game[payload.room_id]) {
      this.game[payload.room_id] = new Game();
      this.game[payload.room_id].interval = setInterval(() => {
        // console.log('tick');
        if (
          this.game[payload.room_id].leftScore >= WINSCORECOUNT ||
          this.game[payload.room_id].rightScore >= WINSCORECOUNT
        ) {
          clearInterval(this.game[payload.room_id].interval);
          this.game[payload.room_id].interval = null;
          this.server.to(payload.room_id).emit('end game', {
            winner: this.game[payload.room_id].leftScore >= WINSCORECOUNT,
          });
          this.server
            .in(payload.room_id)
            .fetchSockets()
            .then((promise) => {
              promise.forEach((socket) => {
                socket.leave(payload.room_id);
              });
            });
          const stats = {
            duration:
              (this.game[payload.room_id].tickCount * TICK_INTERVAL) / 1000,
            winner_score: WINSCORECOUNT,
            loser_score:
              this.game[payload.room_id].leftScore === WINSCORECOUNT
                ? this.game[payload.room_id].rightScore
                : this.game[payload.room_id].leftScore,
            leftWon: this.game[payload.room_id].leftScore >= WINSCORECOUNT,
          };
          console.log(stats);
          this.gameMatchService.endGame(stats, payload.room_id).then();
          this.game[payload.room_id] = undefined;
          return;
        }

        const coordinates = this.game[payload.room_id].tick();
        this.server.to(payload.room_id).emit('game', { coordinates }); // FIX emit to room
      }, TICK_INTERVAL);
    }
  }
}
