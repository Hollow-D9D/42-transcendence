interface GameState {
  player1: {
    x: number;
    y: number;
  };
  player2: {
    x: number;
    y: number;
  };
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
  };
}

export default GameState;
