import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

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
        rightScore++;
        restart(false);
      }
      if (startBX >= 100 - 1) {
        leftScore++;
        restart(true);
      }
    },
  };
  leftScore = 0;
  rightScore = 0;

  upInput: false;
  downInput: false;

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
  handleInput(up: boolean, down: boolean): void {
    if (this.upInput && this.downInput) {
      this.leftTile.acc = 0;
    } else if (this.upInput) {
      this.leftTile.acc = -1;
    } else if (this.downInput) {
      this.leftTile.acc = 1;
    } else {
      if (this.leftTile.acc !== 0) this.leftTile.acc = 0;
    }
  }

  tick(): void {
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
}

let leftScore = 0;
let rightScore = 0;

const leftTile = {};

const rightTile = {};

const restart = (leftWon: boolean) => {};
const ball = {};

//Input
const handleInput = () => {};
const leftTileTick = () => {};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private game: Game = new Game();
  private interval: NodeJS.Timeout;

  @SubscribeMessage('input')
  handleInput(client: any, payload: any): void {
    if (payload.up !== undefined) {
      this.game.upInput = payload.up;
    } else this.game.downInput = payload.down;
    handleInput();
  }

  @SubscribeMessage('game')
  handleMessage(client: any, payload: any): void {
    clearInterval(this.interval);
    this.game.getRandDirection(null);
    this.game.ball.pos.x = 50;
    this.game.ball.pos.y = 50;

    this.interval = setInterval(() => {
      this.game.ball.tick();
      leftTileTick();
      const coordinates = {
        leftTile: { x: this.game.leftTile.pos.x, y: this.game.leftTile.pos.y },
        rightTile: { x: 90, y: 45 },
        ball: { x: this.game.ball.pos.x, y: this.game.ball.pos.y },
        size: 100,
        leftScore: this.game.leftScore,
        rightScore: this.game.rightScore,
      };
      this.server.emit('game', { coordinates });
      // console.log('game');
    }, 40);
  }
}
