import "./Game.css";
import { socket } from "../App";
import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { GameEndCard } from "./GameEndCard";
import Switch from "react-switch";
// import io, { Socket } from "socket.io-client";
// const socket = io(process.env.REACT_APP_BACKEND_SOCKET || "");

const GameInstance = (props: any) => {
  let foregroundColor = props.cool ? "#86D99C" : "aliceblue";
  let backgroundColor = props.cool ? "#4E1D8E" : "#292d32";

  let windowSize;
  if (window.innerHeight < window.innerWidth) {
    windowSize = (window.innerHeight * 90) / 100;
  } else {
    windowSize = (window.innerWidth * 90) / 100;
  }
  const [canvasHeight, setCanvasHeight] = useState(windowSize);
  const [canvasWidth, setCanvasWidth] = useState(windowSize);
  useEffect(() => {
    const handleWindowResize = () => {
      const { innerHeight, innerWidth } = window;
      if (innerHeight < innerWidth) {
        setCanvasHeight((innerHeight * 90) / 100);
        setCanvasWidth((innerHeight * 90) / 100);
      } else {
        setCanvasWidth((innerWidth * 90) / 100);
        setCanvasHeight((innerWidth * 90) / 100);
      }
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const [leftTile, setLeftTile] = useState({ x: 0, y: 0 });
  const [rightTile, setRightTile] = useState({ x: 0, y: 0 });
  const [ball, setBall] = useState({ x: 0, y: 0 });
  const [ratio, setRatio] = useState(1);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  useEffect(() => {
    setRatio(canvasHeight / 100);
  }, [canvasHeight, canvasWidth]);
  // const socket = io("http://localhost:3001");
  useEffect(() => {
    setRatio(canvasHeight / 100);
    draw();
  }, [leftTile, rightTile, ball, ratio, leftScore, rightScore]);
  useEffect(() => {
    const TickHandler = (data: any) => {
      setLeftTile(data.coordinates.leftTile);
      setRightTile({
        x: data.coordinates.rightTile.x * ratio,
        y: data.coordinates.rightTile.y * ratio,
      });
      setBall({
        x: data.coordinates.ball.x * ratio,
        y: data.coordinates.ball.y * ratio,
      });
      setLeftScore(data.coordinates.leftScore);
      setRightScore(data.coordinates.rightScore);
    };

    socket.on("game", TickHandler);
    const room_id = localStorage.getItem("room_id");
    socket.emit("game", {
      room_id: room_id,
      login: localStorage.getItem("userEmail"),
    });
    //Handle up event for W and S
    canvasRef.current?.focus();
    return () => {
      console.log("Disconnected");

      socket.off("game");
      // socket.disconnect();
    };
  }, []);

  const handleKeyUp = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const room_id = localStorage.getItem("room_id");

    if (e.key === "w") {
      //if left player
      socket.emit("input", {
        up: false,
        room_id: room_id,
        isPlayer1: localStorage.getItem("isPlayer1"),
      });
    }
    if (e.key === "s") {
      socket.emit("input", {
        down: false,
        room_id: room_id,
        isPlayer1: localStorage.getItem("isPlayer1"),
      });
    }
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const room_id = localStorage.getItem("room_id");
    if (e.key === "w") {
      socket.emit("input", {
        up: true,
        room_id: room_id,
        isPlayer1: localStorage.getItem("isPlayer1"),
      });
    }

    if (e.key === "s") {
      socket.emit("input", {
        down: true,
        room_id: room_id,
        isPlayer1: localStorage.getItem("isPlayer1"),
      });
    }
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    if (canvasRef !== null) {
      const canvas = canvasRef.current;
      if (canvas !== null) {
        const context = canvas.getContext("2d");

        if (context !== null) {
          context.clearRect(0, 0, canvasWidth, canvasHeight);
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvasWidth, canvasHeight);
          context.fillStyle = foregroundColor;
          context.beginPath();
          context.font = "30px Arial";
          context.fillText("" + leftScore, 20 * ratio, 10 * ratio);
          context.fillText("" + rightScore, 80 * ratio, 10 * ratio);
          context.roundRect(
            leftTile.x * ratio,
            leftTile.y * ratio,
            ratio,
            10 * ratio,
            16
          );
          context.roundRect(
            rightTile.x * ratio,
            rightTile.y * ratio,
            ratio,
            10 * ratio,
            16
          );
          if (
            !props.cool ||
            Math.abs(ball.x - canvasWidth / ratio) < 25 ||
            Math.abs(ball.x) < 25
          )
            context.arc(ball.x * ratio, ball.y * ratio, ratio, 0, 2 * Math.PI);
          context.rect(canvasWidth / 2, 0, 4, canvasWidth);
          context.fill();
        }
      }
    }
  };

  const focusCanvas = () => {
    canvasRef.current?.focus();
  };

  return (
    <div>
      <div id="canvasDiv">
        <canvas
          onBlur={focusCanvas}
          ref={canvasRef}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          width={canvasWidth}
          height={canvasHeight}
          tabIndex={0}
        />
      </div>
    </div>
  );
};

const StartButton = () => {
  const [buttonText, setButtonText] = useState("Start");
  const [onQueue, setOnQueue] = useState(false);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    setUpdate(!update);
  }, [onQueue, buttonText]);

  const handleClick = () => {
    if (!onQueue) {
      setButtonText("Cancel");
      setOnQueue(true);
      (async () => {
        await socket.emit("start game", {
          login: localStorage.getItem("userEmail"),
        });
      })();
    } else {
      (async () => {
        await socket.emit("cancel game", {
          login: localStorage.getItem("userEmail"),
        });
      })();
      setButtonText("Start");
      setOnQueue(false);
    }
  };

  return (
    <div>
      {onQueue ? <p>On Queue</p> : null}
      <button onClick={handleClick} className="Start_button">
        {buttonText}
      </button>
    </div>
  );
};
const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<boolean | null>(null);
  const [cool, setCool] = useState(false);

  useEffect(() => {
    setGameStarted(localStorage.getItem("gameStarted") === "true");
    socket.on("start game", (payload: any) => {
      localStorage.setItem("room_id", payload.response.id);
      localStorage.setItem(
        "isPlayer1",
        payload.response.player1.login === localStorage.getItem("userEmail")
          ? "true"
          : "false"
      );
      setGameStarted(true);
    });

    socket.on("end game", (payload) => {
      console.log("end game");
      const isWinner =
        localStorage.getItem("isPlayer1") === "true"
          ? payload.winner
          : !payload.winner;
      localStorage.setItem("gameStarted", "false");
      setWinner(isWinner);
    });

    return () => {
      // socket.off("start game");
    };
  }, []);

  const handleClick = () => {
    setGameStarted(false);
    setWinner(null);
    localStorage.setItem("room_id", "");
    localStorage.setItem("isPlayer1", "");
  };

  const handleCool = () => {
    setCool(!cool);
  };

  return gameStarted ? (
    <div>
      <GameInstance cool={cool} />
      {winner !== null ? (
        <div className="card-disappear-click-zone">
          <div className="add-zone"></div>
          <div className="game-end-card-container">
            <GameEndCard winner={winner} handleClick={handleClick} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <div>
      <div className="Button-msg-zone">
        <StartButton />
      </div>
      <div className="div-switch-game">
        <div>
          <label style={{ color: cool ? "rgb(0,136,0)" : "grey" }}>
            Make It Look Cool
          </label>
        </div>
        <div style={{marginTop:'23px'}}>
          <Switch
            className="switch"
            onChange={handleCool}
            checked={cool}
            checkedIcon={false}
            uncheckedIcon={false}
          />
        </div>
      </div>
    </div>
  );
};
export default Game;
