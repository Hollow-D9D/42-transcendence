import { Outlet, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { INotifCxt, IUserStatus } from "./globals/Interfaces";
import { TAlert } from "./toasts/TAlert";
import { GameRequestCard } from "./routes/gameRequestCard";
import { gameInvitation } from "./routes/chat_modes/type/chat.type";
import { useContext } from "react";

let LoginStatus = {
  islogged: false,
  setUserName: () => { },
};

export const UsernameCxt = createContext(LoginStatus);

export const UsersStatusCxt = createContext<IUserStatus[] | undefined>(
  undefined
);

export const NotifCxt = createContext<INotifCxt | undefined>(undefined);
const socketOptions = {
  transportOptions: {
    polling: {
      extraHeaders: {
        Token: localStorage.getItem("userToken"),
      },
    },
  },
};

export const socket = io(
  `${process.env.REACT_APP_BACKEND_SOCKET}`,
  socketOptions
);

export default function App() {
  const [usersStatus, setUsersStatus] = useState<IUserStatus[] | undefined>(
    undefined
  );
  const [notifShow, setNotifShow] = useState(false);
  const [notifText, setNotifText] = useState("error");
  const [gameRequest, setGameRequest] = useState(false);
  const [gameInfo, setGameInfo] = useState<gameInvitation | undefined>(
    undefined
  );

  let userstatusTab: IUserStatus[] = [];

  useEffect(() => {
    socket.on("update-status", (data, str: string) => {
      userstatusTab = [];
      for (let i = 0; i <= data.length - 1; i++) {
        let newUser: IUserStatus = {
          key: data[i].id,
          userModel: { id: 0, status: -1 },
        };
        newUser.userModel.id = data[i].id;
        newUser.userModel.status = data[i].status;
        userstatusTab.push(newUser);
      }
      setUsersStatus(userstatusTab);
    });
  }, [usersStatus]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("request new connection", () => {
      if (localStorage.getItem("userLogged") === "true")
        socket.emit("new-connection", {
          login: localStorage.getItem("userEmail"),
        });
    });

  

    socket.on("game invitation", (payload) => {
      setGameRequest(true);
      setGameInfo({
        inviterId: payload.user.id,
        inviterName: payload.user.nickname,
        targetId: -1,
        gameInfo: {
          roomId: 0,
          playerNb: 2,
        },
        avatar: payload.user.profpic_url,
        inviterLogin: payload.user.login,
      });
      return () => {
        socket.off("game invitation");
      };
    });
    socket.on("game declined", (payload) => {
      setNotifText(payload + " declined invitation!");
      setNotifShow(true);
      return () => {
        socket.off("game declined");
      };
    });

    socket.on("start game", (payload) => {
      localStorage.setItem("gameStarted", "true");
      localStorage.setItem("room_id", payload.response.id);
      localStorage.setItem(
        "isPlayer1",
        payload.response.player1.login === localStorage.getItem("userEmail")
          ? "true"
          : "false"
      );
      navigate("/app/game");
      setGameRequest(false);
      return () => {
        socket.off("start game");
      };
    });
    return () => {
      
    };
  }, []);

  return (
    <div className="App">
      <UsernameCxt.Provider value={LoginStatus}>
        <UsersStatusCxt.Provider value={usersStatus}>
          <NotifCxt.Provider value={{ setNotifShow, setNotifText }}>
            <TAlert show={notifShow} setShow={setNotifShow} text={notifText} />
            <Outlet />
          </NotifCxt.Provider>
          <div
            className="card-disappear-click-zone"
            style={{ display: gameRequest ? "" : "none" }}
          >
            <div
              className="add-zone"
              onClick={(event) => event.stopPropagation()}
            >
              <GameRequestCard
                game={gameInfo}
                gameRequest={gameRequest}
                onGameRequest={() => {
                  setGameRequest((old) => {
                    return !old;
                  });
                }}
              />
            </div>
          </div>
        </UsersStatusCxt.Provider>
      </UsernameCxt.Provider>
    </div>
  );
}
