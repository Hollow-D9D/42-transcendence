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

const getRandDirection = (leftWon: boolean | null) => {
  if (leftWon == null) {
    // let angle = Math.PI;
    let angle = Math.random() * Math.PI * 2;
    if (Math.abs(angle - 1) < 0.7 && Math.abs(angle - 1) > 0.3) angle -= 0.5;
    ball.vel.x = (Math.cos(angle) * 3) / 2;
    ball.vel.y = (Math.sin(angle) * 3) / 2;
    return;
  }
  if (leftWon) {
    const angle =
      (clamp(Math.random() * Math.PI * 2, Math.PI / 3, (5 * Math.PI) / 3) -
        Math.PI) /
      2;
    ball.vel.x = (Math.cos(angle) * 3) / 2;
    ball.vel.y = (Math.sin(angle) * 3) / 2;
    return;
  }
  const angle =
    (clamp(Math.random() * Math.PI * 2, Math.PI / 3, (5 * Math.PI) / 3) +
      Math.PI) /
    2;
  ball.vel.x = (Math.cos(angle) * 3) / 2;
  ball.vel.y = (Math.sin(angle) * 3) / 2;
};

let leftScore = 0;
let rightScore = 0;

const leftTile = {
  pos: { x: 10, y: 45 },
  size: new Vector2(1, 10),
  vel: 0,
  acc: 0,
  upPressed: false,
  downPressed: false,
};

const rightTile = {
  pos: { x: 90, y: 45 },
  size: new Vector2(1, 10),
  vel: 0,
  acc: 0,
  upPressed: false,
  downPressed: false,
};

const restart = (leftWon: boolean) => {
  ball.pos = new Vector2(50, Math.random() * 100);
  getRandDirection(leftWon);
};
const ball = {
  pos: new Vector2(100 / 2, 100 / 2),
  vel: new Vector2(0, 0),
  tick: () => {
    ball.checkCollision();
    ball.pos.addX(ball.vel.x);
    ball.pos.addY(ball.vel.y);
  },
  checkCollision: () => {
    const startBX = ball.pos.x;
    const startBY = ball.pos.y;
    if (ball.pos.x < 20) {
      // console.log('left');

      const endBX = startBX + 1;
      const endBY = startBY + 1;
      const startTX = leftTile.pos.x;
      const startTY = leftTile.pos.y;
      const endTX = startTX + 1;
      const endTY = startTY + 10;

      if (
        startBX <= endTX &&
        endBX >= startTX &&
        startBY <= endTY &&
        endBY >= startTY
      ) {
        if (ball.vel.x < 0) getRandDirection(true);

        // console.log('Tile collision detected');
        return;
      }
    } else if (ball.pos.x > 80) {
      // console.log('right');
      const endBX = startBX + 1;
      const endBY = startBY + 1;
      const startTX = rightTile.pos.x;
      const startTY = rightTile.pos.y;
      const endTX = startTX + 1;
      const endTY = startTY + 10;

      if (
        startBX <= endTX &&
        endBX >= startTX &&
        startBY <= endTY &&
        endBY >= startTY
      ) {
        if (ball.vel.x > 0) getRandDirection(false);

        // console.log('Tile collision detected');
        return;
      }
    }
    if (startBY <= 2 || startBY >= 100 - 2) {
      ball.vel.y = -ball.vel.y;
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

//Input
let upInput = false;
let downInput = false;

const handleInput = () => {
  if (upInput && downInput) {
    leftTile.acc = 0;
  } else if (upInput) {
    leftTile.acc = -1;
  } else if (downInput) {
    leftTile.acc = 1;
  } else {
    if (leftTile.acc !== 0) leftTile.acc = 0;
  }
};
const leftTileTick = () => {
  if (leftTile.acc != 0) {
    leftTile.pos.y = clamp(
      leftTile.pos.y + leftTile.vel,
      0,
      100 - leftTile.size.y,
    );
    leftTile.vel += leftTile.acc;
  } else if (leftTile.vel != 0) {
    (leftTile.pos.y = clamp(
      leftTile.pos.y + leftTile.vel,
      0,
      100 - leftTile.size.y,
    )),
      (leftTile.vel += leftTile.vel < 0 ? 0.5 : -0.5);
  }
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private interval: NodeJS.Timeout;

  @SubscribeMessage('input')
  handleInput(client: any, payload: any): void {
    if (payload.up !== undefined) {
      upInput = payload.up;
    } else downInput = payload.down;
    handleInput();
  }

  @SubscribeMessage('game')
  handleMessage(client: any, payload: any): void {
    clearInterval(this.interval);
    getRandDirection(null);
    ball.pos.x = 50;
    ball.pos.y = 50;

    this.interval = setInterval(() => {
      ball.tick();
      leftTileTick();
      const coordinates = {
        leftTile: { x: leftTile.pos.x, y: leftTile.pos.y },
        rightTile: { x: 90, y: 45 },
        ball: { x: ball.pos.x, y: ball.pos.y },
        size: 100,
        leftScore: leftScore,
        rightScore: rightScore,
      };
      this.server.emit('game', { coordinates });
      // console.log('game');
    }, 40);
  }
}
