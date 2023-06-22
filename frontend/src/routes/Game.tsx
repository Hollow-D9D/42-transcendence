import React from "react";
import { io, Socket } from "socket.io-client";
import "./Game.css";
import {
  Game_data,
  Player,
  Coordinates,
  StatePong,
  Button,
  ButtonState,
  Msg,
  MsgState,
  PaddleProps,
  StatePaddle,
  SettingsProps,
  SettingsState,
  PropsPong,
} from "./game.interfaces";
import FocusTrap from "focus-trap-react";
import { getUserAvatarQuery } from "../queries/avatarQueries";
import SoloGame from "./SoloGame";
import { socket as chatSocket } from "../App";
import { Navigate } from "react-router-dom";
import { NotifCxt } from "../App";
import { Prev } from "react-bootstrap/esm/PageItem";

class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props);
    this.state = { message: this.props.message };
  }

  static getDerivedStateFromProps(props: SettingsProps, state: SettingsState) {
    return { message: props.message };
  }

  render() {
    return (
      <FocusTrap>
        <aside
          role="dialog"
          tabIndex={-1}
          aria-modal="true"
          className="modal-settings"
          onKeyDown={(event) => {
            this.props.onKeyDown(event);
          }}
        >
          <div className="modal-text">
            Press key for moving {this.state.message}
          </div>
          <button
            onClick={() => {
              this.props.onClickClose();
            }}
            className="closeButton"
          >
            X
          </button>
        </aside>
      </FocusTrap>
    );
  }
}

class StartButton extends React.Component<Button, ButtonState> {
  constructor(props: Button) {
    super(props);
    this.state = {
      showButton: true,
      buttonText: "Start",
      onQueue: false,
    };
  }

  // static getDerivedStateFromProps(props: Button, state: ButtonState){
  //   return {
  //     showButton: props.showButton,
  //     buttonText: props.buttonText
  //   };
  // }
  handleClick = () => {
    // console.log("mta");
    if (!this.state.onQueue) {
      this.setState({ buttonText: "Cancel", onQueue: true });
      // socket.emit("on queue");
      // socket.on("matched" () => {
      //
      // });
    } else {
      this.setState({ buttonText: "Start", onQueue: false });
    }
  };

  render() {
    console.log("render");

    const btt = this.state.showButton ? "unset" : "none";
    return (
      <div>
        {this.state.onQueue ? <p>On Queue</p> : null}
        <button
          onClick={this.handleClick}
          style={{ display: `${btt}` }}
          className="Start_button"
        >
          {this.state.buttonText}
        </button>
      </div>
    );
  }
}

// class Ball extends React.Component< Coordinates, {} >
// {
//   render() {
//     const show = this.props.showBall ? 'unset': 'none';
//     if(window.innerHeight <= window.innerWidth){
//       return (
//          <div
//             style={{
//                top: `calc(${this.props.y}% - 1vh)`,
//                left: `calc(${this.props.x}% - 1vh)`,
//                display: `${show}`

//             }}
//             className={ 'Ball' }
//          />
//       );
//     }
//     if(window.innerHeight > window.innerWidth){
//       return (
//          <div
//             style={{
//                top: `calc(${this.props.y}% - 1/45*90vw/177*100)`,
//                left: `calc(${this.props.x}% - 1/45*90vw/177*100)`,
//                display: `${show}`

//             }}
//             className={ 'Ball' }
//          />
//       );
//     }
//   }
// }

// class Message extends React.Component< Msg, MsgState > {

//     constructor(props: Msg){
//         super(props);
//         this.state = {showMsg: false,
//                       type: 0,};
//         }

//         static getDerivedStateFromProps(props: Msg, state: MsgState){
//           return {
//             showMsg: props.showMsg,
//             type: props.type
//           };
//         }

//         render() {
//           const disp = this.state.showMsg ? 'unset': 'none';
//           var message: string;
//           switch(this.state.type) {
//             case 1:
//                 message = "Please wait for another player";
//                 break;
//             case 2:
//                 message = "You win";
//                 break;
//             case 3:
//                 message = "You lose";
//                 break;
//             case 4:
//                 message = "Waiting for your opponent to accept the invitation";
//                 break;
//             case 5:
//                 message = "Please finish your game before starting a new one";
//                 break;
//              default:
//                  message = "error";
//           }
//        return (
//              <div style={{display: `${disp}`,}} className="Message">{message}</div>
//          )
//      }
//      }

// class Paddle extends React.Component< PaddleProps, StatePaddle > {
//     constructor(props: PaddleProps){
//       super(props);
//       this.state = {side: props.side,
//                     y: props.ystart,
//                     show: props.show,
//                 };
//     };

//     componentWillReceiveProps(props: PaddleProps) {
//     this.setState({y: props.y});
//       }

//     render() {
//         const show = this.props.show ? 'unset': 'none';
//         var side: string;
//         if (this.props.side === 'left')
//             side = "Pad-left";
//         else
//             side = "Pad-right";
//         return (
//             <div
//               style={{
//                 display: `${show}`,
//                 top: `${this.state.y}%`,
//               }}
//               className={`${side}`}
//            />
//         );
//        }
//     }

export default class Game extends React.Component<PropsPong, StatePong> {
  static contextType = NotifCxt;
  context!: React.ContextType<typeof NotifCxt>;

  socketOptions = {
    transportOptions: {
      polling: {
        extraHeaders: {
          Token: localStorage.getItem("userToken"),
        },
      },
    },
  };

  socket: Socket;

  MOVE_UP = "ArrowUp";
  MOVE_DOWN = "ArrowDown";
  avatarsFetched = false;

  constructor(props: PropsPong) {
    super(props);
    this.state = {
      paddleLeftY: 50,
      paddleRightY: 50,
      ballX: 50,
      ballY: 50,
      gameStarted: false,
      showStartButton: true,
      roomId: 0,
      playerNumber: 0,
      player1Score: 0,
      player2Score: 0,
      msgType: 0,
      player1Name: "player1",
      player2Name: "player2",
      game_list: [],
      isSettingsShown: false,
      settingsState: "up",
      buttonState: "Start",
      avatarP1URL: "",
      avatarP2URL: "",
      soloGame: false,
      redirectChat: false,
    };
    if (this.props.pvtGame === false)
      this.socket = io(
        `${process.env.REACT_APP_BACKEND_SOCKET}`,
        this.socketOptions
      );
    else this.socket = chatSocket;
    // this.onSettingsKeyDown = this.onSettingsKeyDown.bind(this);
    // this.onSettingsClickClose = this.onSettingsClickClose.bind(this);
    // this.quitSoloMode = this.quitSoloMode.bind(this);
  }

  componentDidMount() {
    // document.onkeydown = this.keyDownInput;
    // document.onkeyup = this.keyUpInput;
    this.socket.on("game_started", () => {
      this.setState({ gameStarted: true, showStartButton: false });
      this.avatarsFetched = false;
      this.socket.off("rejected");
    });
    this.socket.on("update", (info: Game_data) => {
      this.setState({
        ballX: info.xBall,
        ballY: info.yBall,
        paddleLeftY: info.paddleLeft,
        paddleRightY: info.paddleRight,
        player1Score: info.player1Score,
        player2Score: info.player2Score,
        player1Name: info.player1Name,
        player2Name: info.player2Name,
      });
      if (this.avatarsFetched === false) {
        this.avatarsFetched = true;
        this.getAvatars(info.player1Avatar, info.player2Avater);
      }
    });
    this.socket.on("end_game", (winner: number) =>
      winner === this.state.playerNumber
        ? this.setState({
            msgType: 2,
            gameStarted: false,
            showStartButton: true,
            buttonState: "New Game",
            avatarP1URL: "",
            avatarP2URL: "",
          })
        : this.setState({
            msgType: 3,
            gameStarted: false,
            showStartButton: true,
            buttonState: "New Game",
            avatarP1URL: "",
            avatarP2URL: "",
          })
    );

    if (this.props.pvtGame && localStorage.getItem("playernb") === "1") {
      let RoomId = Number(localStorage.getItem("roomid")!);
      this.setState({ roomId: RoomId });
      this.setState({ playerNumber: 1, msgType: 4, buttonState: "Cancel" });
      this.socket.on("rejected", (targetName: string) => {
        this.setState({
          roomId: 0,
          playerNumber: 0,
          msgType: 0,
          buttonState: "Start",
        });
        this.setState({ redirectChat: true });
        console.log(targetName + " rejected");
        this.context?.setNotifText(targetName + " rejected the game");
        this.context?.setNotifShow(true);
      });
    }

    if (this.props.pvtGame && localStorage.getItem("playernb") === "2") {
      let RoomId = Number(localStorage.getItem("roomid")!);
      this.setState({
        roomId: RoomId,
        playerNumber: 2,
        msgType: 0,
        gameStarted: true,
        showStartButton: false,
      });
    }
  }

  componentWillUnmount() {
    this.socket.disconnect();
    this.socket.connect();
    this.socket.off("game_started");
    this.socket.off("update");
    this.socket.off("end_game");
  }

  startButtonHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!this.state.showStartButton) return;
    if (this.state.buttonState === "Cancel") {
      this.socket.disconnect();
      this.socket.connect();
      this.setState({
        gameStarted: false,
        showStartButton: true,
        buttonState: "Start",
      });
      return;
    }
    this.setState({ buttonState: "Cancel" });
    this.socket.emit("start", {}, (player: Player) => {
      if (player.playerNb === 3) {
        this.setState({
          msgType: 5,
        });
        return;
      }
      this.setState({
        roomId: player.roomId,
        playerNumber: player.playerNb,
        msgType: 1,
      });
    });
  };

  // soloButtonHandler = () => this.setState({ soloGame: true });

  // keyDownInput = (e: KeyboardEvent) => {
  //   if (e.key === this.MOVE_UP && this.state.gameStarted) {
  //     e.preventDefault();
  //     this.socket.emit("move", {
  //       dir: 1,
  //       room: this.state.roomId,
  //       player: this.state.playerNumber,
  //     });
  //   }

  //   if (e.key === this.MOVE_DOWN && this.state.gameStarted) {
  //     e.preventDefault();
  //     this.socket.emit("move", {
  //       dir: 2,
  //       room: this.state.roomId,
  //       player: this.state.playerNumber,
  //     });
  //   }
  // };

  // keyUpInput = (e: KeyboardEvent) => {
  //   if (
  //     (e.key === this.MOVE_UP || e.key === this.MOVE_DOWN) &&
  //     this.state.gameStarted
  //   ) {
  //     e.preventDefault();
  //     this.socket.emit("move", {
  //       dir: 0,
  //       room: this.state.roomId,
  //       player: this.state.playerNumber,
  //     });
  //   }
  // };

  // onSettingsKeyDown = (e: KeyboardEvent) => {
  //   if (this.state.settingsState === "up") {
  //     this.setState({ settingsState: "down" });
  //     this.MOVE_UP = e.key;
  //   } else if (this.state.settingsState! === "down") {
  //     this.setState({ isSettingsShown: false, settingsState: "up" });
  //     this.MOVE_DOWN = e.key;
  //   }
  // };

  onSettingsClickClose() {
    this.setState({ isSettingsShown: false, settingsState: "up" });
  }

  showSettings() {
    this.setState({ isSettingsShown: true });
  }

  getAvatars = async (id1: number, id2: number) => {
    const result_1: undefined | string | Blob | MediaSource =
      await getUserAvatarQuery(id1);
    const result_2: undefined | string | Blob | MediaSource =
      await getUserAvatarQuery(id2);
    if (result_1 !== undefined && result_1 instanceof Blob) {
      this.setState({ avatarP1URL: URL.createObjectURL(result_1) });
      if (result_2 !== undefined && result_2 instanceof Blob) {
        this.setState({ avatarP2URL: URL.createObjectURL(result_2) });
      }
    }
  };

  // quitSoloMode() {
  //   this.setState({ soloGame: false });
  // }

  render() {
    // const shoWInfo = this.state.gameStarted ? "flex" : "none";
    /*const showBorder = this.state.gameStarted ? '2px solid rgb(0, 255, 255)' : '0px solid rgb(0, 255, 255)';*/
    // const showBorder = this.state.gameStarted
    //   ? "2px solid rgb(255, 255, 255)"
    //   : "0px solid rgb(255, 255, 255)";
    /*const showShadow = this.state.gameStarted ? '0px 0px 5px 5px rgb(80, 200, 255), inset 0px 0px 5px 5px rgb(0, 190, 255)' : '0';*/
    // const showShadow = "0";

    // var leftName = String(this.state.player1Name);
    // var rightName = String(this.state.player2Name);

    return (
      <div>
        {/* {this.state.soloGame ? (
          <SoloGame clickHandler={this.quitSoloMode}></SoloGame>
        ) : (
          <div className="Radial-background">
            <div className="Page-top">
              <div style={{ display: `${shoWInfo}` }} className="Info-card">
                <div className="Player-left">
                  <div className="Info">
                    {this.state.avatarP1URL ? (
                      <div
                        className="Photo"
                        style={{
                          backgroundImage: `url("${this.state.avatarP1URL}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                    ) : (
                      <div className="Photo"></div>
                    )}
                    <div className="Login" style={{ textAlign: "left" }}>
                      {leftName}
                    </div>
                  </div>
                  <div className="Score">{this.state.player1Score}</div>
                </div>
                <div className="Player-right">
                  <div className="Score">{this.state.player2Score}</div>
                  <div className="Info">
                    <div className="Login" style={{ textAlign: "right" }}>
                      {rightName}
                    </div>
                    {this.state.avatarP2URL ? (
                      <div
                        className="Photo"
                        style={{
                          backgroundImage: `url("${this.state.avatarP2URL}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                    ) : (
                      <div className="Photo"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="Page-mid">
              <div
                style={{ border: `${showBorder}`, boxShadow: `${showShadow}` }}
                className="Field"
              >
                {/* <Paddle
                  show={this.state.gameStarted}
                  side={"left"}
                  y={this.state.paddleLeftY}
                  ystart={this.state.paddleLeftY}
                />
                <Paddle
                  show={this.state.gameStarted}
                  side={"right"}
                  y={this.state.paddleRightY}
                  ystart={this.state.paddleRightY}
                /> */}

        {/* <div className="Center-zone" style={{ display: `${shoWInfo}` }}>
                  <div className="Middle-line-top"></div>
                  <div className="Center-circle"></div>
                  <div className="Middle-line-bottom"></div>
                </div>

                <div className="Pad-right"></div> */}

        {/* <Ball
                  showBall={this.state.gameStarted}
                  x={this.state.ballX}
                  y={this.state.ballY}
                /> */}
        {/* </div>
            </div>*/}

        <div className="Button-msg-zone">
          {/* <Message
                showMsg={
                  this.state.buttonState !== "Start" && !this.state.gameStarted
                }
                type={this.state.msgType}
              /> */}
          <StartButton
            showButton={this.state.showStartButton}
            clickHandler={this.startButtonHandler}
            buttonText={this.state.buttonState}
          />
          {/* <StartButton
                showButton={this.state.showStartButton && this.state.buttonState !== "Cancel"}
                clickHandler={this.soloButtonHandler}
                buttonText="Solo mode"
              /> */}
        </div>

        {/* <div>
              {this.state.isSettingsShown ? ( */}
        {/* <Settings */}
        {/* //   message={this.state.settingsState!}
                //   // onKeyDown={this.onSettingsKeyDown}
                //   onClickClose={this.onSettingsClickClose}
                // />
        //       ) : null} */}
        {/* //     </div> */}
        {/* //     <div className="Page-foot">
        //       <div className="bar"></div>
        //       <div className="innerFoot">
        //         <div className="Button" onClick={() => this.showSettings()}>
        //           Multiplayer Settings
        //         </div>
        //       </div>
        //     </div>
        //   </div> */}
        {/* )} */}
        {/* {this.state.redirectChat ? (
        <Navigate to='/app/chat' replace={true}/>)
        : null } */}
      </div>
    );
  }
}

// import React, { useRef, useEffect, useState, KeyboardEvent } from "react";
// import io, { Socket } from "socket.io-client";
// const socket = io(process.env.REACT_APP_BACKEND_SOCKET || "");

// const Game = () => {
//   let windowSize;
//   if (window.innerHeight < window.innerWidth) {
//     windowSize = (window.innerHeight * 90) / 100;
//   } else {
//     windowSize = (window.innerWidth * 90) / 100;
//   }
//   const [canvasHeight, setCanvasHeight] = useState(windowSize);
//   const [canvasWidth, setCanvasWidth] = useState(windowSize);
//   useEffect(() => {
//     const handleWindowResize = () => {
//       const { innerHeight, innerWidth } = window;
//       if (innerHeight < innerWidth) {
//         setCanvasHeight((innerHeight * 90) / 100);
//         setCanvasWidth((innerHeight * 90) / 100);
//       } else {
//         setCanvasWidth((innerWidth * 90) / 100);
//         setCanvasHeight((innerWidth * 90) / 100);
//       }
//     };

//     window.addEventListener("resize", handleWindowResize);

//     return () => {
//       window.removeEventListener("resize", handleWindowResize);
//     };
//   }, []);

//   const [leftTile, setLeftTile] = useState({ x: 0, y: 0 });
//   const [rightTile, setRightTile] = useState({ x: 0, y: 0 });
//   const [ball, setBall] = useState({ x: 0, y: 0 });
//   const [ratio, setRatio] = useState(1);
//   const [leftScore, setLeftScore] = useState(0);
//   const [rightScore, setRightScore] = useState(0);
//   useEffect(() => {
//     setRatio(canvasHeight / 100);
//   }, [canvasHeight, canvasWidth]);
//   // const socket = io("http://localhost:3001");
//   useEffect(() => {
//     // console.log("leftTile");
//     console.log(ratio);
//     setRatio(canvasHeight / 100);
//     draw();
//   }, [leftTile, rightTile, ball, ratio, leftScore, rightScore]);
//   useEffect(() => {
//     const TickHandler = (data: any) => {
//       // console.log(ratio);

//       setLeftTile(data.coordinates.leftTile);
//       setRightTile({
//         x: data.coordinates.rightTile.x * ratio,
//         y: data.coordinates.rightTile.y * ratio,
//       });
//       setBall({
//         x: data.coordinates.ball.x * ratio,
//         y: data.coordinates.ball.y * ratio,
//       });
//       setLeftScore(data.coordinates.leftScore);
//       setRightScore(data.coordinates.rightScore);
//     };

//     socket.on("game", TickHandler);
//     console.log("Subscribed");
//     socket.emit("game");
//     //Handle up event for W and S

//     return () => {
//       console.log("Disconnected");

//       socket.off("game", TickHandler);
//       socket.disconnect();
//     };
//   }, []);
//   const handleKeyUp = (e: KeyboardEvent<HTMLCanvasElement>) => {
//     if (e.key === "w") {
//       //if left player
//       socket.emit("inputL", { up: false });
//     }
//     if (e.key === "s") {
//       socket.emit("inputL", { down: false });
//     }
//   };
//   const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
//     // console.log("aaaa", e.key);
//     if (e.key === "w") {
//       console.log("w");
//       socket.emit("inputL", { up: true });
//     }

//     if (e.key === "s") {
//       socket.emit("inputL", { down: true });
//     }
//   };

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const draw = () => {
//     if (canvasRef !== null) {
//       const canvas = canvasRef.current;
//       if (canvas !== null) {
//         const context = canvas.getContext("2d");

//         if (context !== null) {
//           context.clearRect(0, 0, canvasWidth, canvasHeight);
//           context.fillStyle = "aliceblue";
//           context.beginPath();
//           context.font = "30px Arial";
//           context.fillText("" + leftScore, 20 * ratio, 10 * ratio);
//           context.fillText("" + rightScore, 80 * ratio, 10 * ratio);
//           context.roundRect(
//             leftTile.x * ratio,
//             leftTile.y * ratio,
//             ratio,
//             10 * ratio,
//             16
//           );
//           context.roundRect(
//             rightTile.x * ratio,
//             rightTile.y * ratio,
//             ratio,
//             10 * ratio,
//             16
//           );
//           context.arc(ball.x * ratio, ball.y * ratio, ratio, 0, 2 * Math.PI);
//           context.rect(canvasWidth / 2, 0, 4, canvasWidth);
//           context.fill();
//         }
//       }
//     }
//   };

//   return (
//     <div>
//       <div id="canvasDiv">
//         <canvas
//           ref={canvasRef}
//           onKeyDown={handleKeyDown}
//           onKeyUp={handleKeyUp}
//           width={canvasWidth}
//           height={canvasHeight}
//           tabIndex={0}
//         />
//       </div>
//     </div>
//   );
// };

// export default Game;

// /*
// class Vector2 {
//   x: number;
//   y: number;

//   constructor(_x: number, _y: number) {
//     this.x = _x;
//     this.y = _y;
//   }

//   changeVal(x: number, y: number) {
//     this.x = x;
//     this.y = y;
//   }

//   addX(x: number) {
//     this.x += x;
//   }

//   addY(y: number) {
//     this.y += y;
//   }
// }

// const clamp = (num: number, min: number, max: number) =>
//   Math.min(Math.max(num, min), max);

// const Canvas = () => {
//   const [canvasWidth, setCanvasWidth] = useState(
//     (window.innerWidth * 80) / 100
//   );
//   const [canvasHeight, setCanvasHeight] = useState(
//     (window.innerHeight * 80) / 100
//   );
//   const timer = useRef<any>(0);
//   //Initial parameters
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   let leftScore = 0;
//   let rightScore = 0;
//   //Ball object
//   const ball = {
//     pos: new Vector2(canvasWidth / 2, canvasHeight / 2),
//     vel: new Vector2(0, 0),
//     tick: () => {
//       ball.checkCollision();
//       ball.pos.addX(ball.vel.x);
//       ball.pos.addY(ball.vel.y);
//     },
//     checkCollision: () => {
//       const startBX = ball.pos.x;
//       const startBY = ball.pos.y;
//       const endBX = startBX + 10;
//       const endBY = startBY + 10;
//       const startTX = leftTile.pos.x;
//       const startTY = leftTile.pos.y;
//       const endTX = startTX + 20;
//       const endTY = startTY + 150;

//       if (
//         startBX <= endTX &&
//         endBX >= startTX &&
//         startBY <= endTY &&
//         endBY >= startTY
//       ) {
//         if (ball.vel.x < 0) ball.vel.x = -ball.vel.x;
//         console.log("Tile collision detected");
//         return;
//       }
//       if (startBY <= 0 || startBY >= canvasHeight - 10) {
//         ball.vel.y = -(ball.vel.y + 0.1);
//         console.log("Collision");
//       }

//       if (startBX <= 0) {
//         rightScore++;
//         restart(false);
//       }
//       if (startBX >= canvasWidth - 10) {
//         leftScore++;
//         restart(true);
//       }
//     },
//   };

//   const restart = (leftWon: boolean) => {
//     ball.pos = new Vector2(canvasWidth / 2, Math.random() * canvasHeight);
//     getRandDirection(leftWon);
//   };

//   //Ball random direction
//   const getRandDirection = (leftWon: boolean | null) => {
//     if (leftWon == null) {
//       const angle = Math.random() * Math.PI * 2;

//       ball.vel.x = Math.cos(angle) * 8;
//       ball.vel.y = Math.sin(angle) * 8;
//       return;
//     }
//     if (leftWon) {
//       const angle =
//         (clamp(Math.random() * Math.PI * 2, Math.PI / 3, (5 * Math.PI) / 3) -
//           Math.PI) /
//         2;
//       ball.vel.x = Math.cos(angle) * 8;
//       ball.vel.y = Math.sin(angle) * 8;
//       return;
//     }
//     const angle =
//       (clamp(Math.random() * Math.PI * 2, Math.PI / 3, (5 * Math.PI) / 3) +
//         Math.PI) /
//       2;
//     ball.vel.x = Math.cos(angle) * 8;
//     ball.vel.y = Math.sin(angle) * 8;
//   };

//   //Left tile
//   const [leftTile, setLeftTile] = useState({
//     pos: { x: 30, y: canvasHeight / 2 },
//     size: new Vector2(20, 150),
//     vel: 0,
//     acc: 0,
//     upPressed: false,
//     downPressed: false,
//   });

//   const handleInput = useCallback(() => {
//     // console.log(leftTile.upPressed, leftTile.acc);
//     if (leftTile.upPressed && leftTile.downPressed) {
//       setLeftTile((prev) => ({ ...prev, pos: { ...prev.pos }, acc: 0 }));
//     } else if (leftTile.upPressed) {
//       setLeftTile((prev) => ({ ...prev, pos: { ...prev.pos }, acc: -4 }));
//     } else if (leftTile.downPressed) {
//       setLeftTile((prev) => ({ ...prev, pos: { ...prev.pos }, acc: 4 }));
//     } else {
//       if (leftTile.acc !== 0)
//         setLeftTile((prev) => ({ ...prev, pos: { ...prev.pos }, acc: 0 }));
//     }
//   }, [leftTile]);

//   const tick = useCallback(() => {
//     handleInput();
//     if (leftTile.acc != 0) {
//       setLeftTile((prev) => ({
//         ...prev,
//         pos: {
//           ...prev.pos,
//           y: clamp(prev.pos.y + prev.vel + prev.acc, 0, canvasHeight - 150),
//         },
//         vel: prev.vel + prev.acc,
//       }));
//     }

//     if (leftTile.vel !== 0) {
//       setLeftTile((prev) => ({
//         ...prev,
//         pos: {
//           ...prev.pos,
//           y: clamp(prev.pos.y + prev.vel, 0, canvasHeight - 150),
//         },
//         vel: prev.vel + prev.vel < 0 ? 2 : -2,
//       }));
//     }
//   }, [leftTile, handleInput]);

//   //Press W or S to move the tile
//   const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
//     console.log("aaaa", e.key);
//     if (e.key === "w" && !leftTile.upPressed) {
//       setLeftTile((prev) => ({
//         ...prev,
//         pos: { ...prev.pos },
//         upPressed: true,
//       }));
//     }
//     if (e.key === "s" && !leftTile.downPressed) {
//       setLeftTile((prev) => ({
//         ...prev,
//         pos: { ...prev.pos },
//         downPressed: true,
//       }));
//     }
//     // setstate for rerender;
//   };

//   //Handle up event for W and S
//   const handleKeyUp = (e: KeyboardEvent<HTMLCanvasElement>) => {
//     if (e.key === "w") {
//       setLeftTile((prev) => ({
//         ...prev,
//         pos: { ...prev.pos },
//         upPressed: false,
//       }));
//     }
//     if (e.key === "s") {
//       setLeftTile((prev) => ({
//         ...prev,
//         pos: { ...prev.pos },
//         downPressed: false,
//       }));
//     } else return;
//     // setstate for rerender;
//   };

//   //Draw on the canvas
//   const draw = () => {
//     console.log(leftTile.pos);
//     console.log("Acc" + leftTile.acc);
//     console.log("Vel" + leftTile.vel);
//     if (canvasRef !== null) {
//       const canvas = canvasRef.current;
//       if (canvas !== null) {
//         const context = canvas.getContext("2d");

//         if (context !== null) {
//           context.clearRect(0, 0, canvasWidth, canvasHeight);
//           context.beginPath();
//           context.font = "30px Arial";
//           context.fillText("" + leftScore, canvasWidth / 5, canvasHeight / 7);
//           context.fillText(
//             "" + rightScore,
//             canvasWidth - canvasWidth / 5,
//             canvasHeight / 7
//           );
//           context.roundRect(
//             leftTile.pos.x,
//             leftTile.pos.y,
//             leftTile.size.x,
//             leftTile.size.y,
//             16
//           );
//           context.arc(ball.pos.x, ball.pos.y, 10, 0, 2 * Math.PI);
//           context.fill();
//         }
//       }
//     }
//   };

//   //Global tick which occurs every 200 m-meters
//   const globalTick = useCallback(() => {
//     tick();
//     ball.tick();
//     draw();
//   }, [leftTile, tick]);

//   //Return statement

//   useEffect(() => {
//     const handleWindowResize = () => {
//       const { innerHeight, innerWidth } = window;
//       setCanvasWidth((innerWidth * 80) / 100);
//       setCanvasHeight((innerHeight * 80) / 100);
//     };

//     getRandDirection(null);

//     window.addEventListener("resize", handleWindowResize);

//     return () => {
//       window.removeEventListener("resize", handleWindowResize);
//     };
//   }, []);

//   useEffect(() => {
//     // console.log(leftTile, timer, leftTile.vel);

//     timer && clearInterval(timer.current);
//     const num = setInterval(() => {
//       globalTick();
//     }, 40);
//     // console.log("num", num);
//     timer.current = num;
//   }, [leftTile]);

//   return (
//     <div id="canvasDiv">
//       <canvas
//         onKeyDown={handleKeyDown}
//         onKeyUp={handleKeyUp}
//         ref={canvasRef}
//         width={canvasWidth}
//         height={canvasHeight}
//         tabIndex={0}
//       />
//     </div>
//   );
// };

// export default Canvas;
// */
