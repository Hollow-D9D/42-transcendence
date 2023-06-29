import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, OverlayTrigger } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import DisplayGamesStats from "./DisplayGamesStats";
import { IUserStatus, userModel } from "../../../globals/Interfaces";
import { getOtherUser } from "../../../queries/otherUserQueries";
import DisplayUserFriends from "./DisplayUserFriends";
import { COnUser } from "../../../ContextMenus/COnUser";
import { renderTooltip } from "../../../Components/SimpleToolTip";
import { NotifCxt, UsersStatusCxt } from "../../../App";
import { addFriendQuery } from "../../../queries/userFriendsQueries";
import "./UserPublicProfile.css";
import { getUserFriends } from "../../../queries/userFriendsQueries";
import { blockUserQuery } from "../../../queries/userFriendsQueries";
import { getUserBlocked } from "../../../queries/userQueries";
import { FriendsList } from "../private/users_relations/FriendsList";

const userInfoInit: userModel = {
  id: 0,
  username: "",
  avatar: "",
  friends: [],
  gamesLost: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  playTime: 0,
  rank: 0,
  status: 0,
  winRate: 0,
  nickname: "",
  isFriend: false,
  isBlocked: false,
  paramName: "",
  full_name: "",
};

const initializeUser = async (result: any, setUserInfo: any) => {
  userInfoInit.id = result.id;
  userInfoInit.username = result.login;
  userInfoInit.full_name = result.full_name;
  userInfoInit.avatar = result.profpic_url;
  userInfoInit.friends = result.friends;
  userInfoInit.gamesLost = result.lose_count;
  userInfoInit.gamesPlayed = result.lose_count + result.win_count;
  userInfoInit.gamesWon = result.win_count;
  userInfoInit.playTime = result.matchtime;
  userInfoInit.rank = result.ladder_level;
  userInfoInit.nickname = result.nickname;
  userInfoInit.status = result.status;
  userInfoInit.winRate = userInfoInit.gamesWon / userInfoInit.gamesPlayed || 0;
  setUserInfo(userInfoInit);
  await fetchDataFriends(userInfoInit, setUserInfo);
  await fetchDataBlockes(userInfoInit, setUserInfo);
};

const fetchDataFriends = async (userInfo: any, setUserInfo: any) => {
  const result = await getUserFriends();
  if (userInfo.paramName === localStorage.getItem("userEmail")) {
    userInfo.isFriend = true;
    setUserInfo(userInfo);
  } else if (result !== "error") {
    result.forEach((e: any) => {
      if (e.login === userInfo.paramName) {
        setUserInfo({ ...userInfo, isFriend: true });
      }
    });
  }
};

const fetchDataBlockes = async (userInfo: any, setUserInfo: any) => {
  const result = await getUserBlocked();
  if (userInfo.paramName === localStorage.getItem("userEmail")) {
    setUserInfo({ ...userInfo, isBlocked: true });
  } else if (result !== "error") {
    result.forEach((e: any) => {
      if (e.login === userInfo.paramName) {
        setUserInfo({ ...userInfo, isBlocked: true });
      }
    });
  }
};

export default function UserProfile() {
  const usersStatus = useContext(UsersStatusCxt);
  const notif = useContext(NotifCxt);
  let params = useParams();
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<userModel>(userInfoInit);
  const [isFetched, setIsFetched] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
  const [isUser, setIsUser] = useState(true);

  useEffect(() => {
    const getAvatar = async () => {
      setAvatarURL(userInfo.avatar);
    };
    if (isFetched && userInfoInit.id) getAvatar();
  }, [isFetched]);

  useEffect(() => {
    const fetchIsUser = async () => {
      let result;

      if (!isFetched && params.userName !== undefined) {
        result = await getOtherUser(params.userName);
        console.log(result);
        if (result !== "error") {
          userInfo.paramName = params.userName;
          await initializeUser(result.body.user, setUserInfo);
          setIsFetched(true);
        } else setIsUser(false);
      }
    };
    fetchIsUser();
  }, [isFetched, usersStatus]);

  const handleClickFriend = (otherId: number, otherUsername: string) => {
    const addFriend = async () => {
      const result = await addFriendQuery(otherId);
      if (result !== "error") {
        notif?.setNotifText("Friend request sent to " + otherUsername + "!");
        setReloadKey((prevKey) => prevKey + 1);
      } else notif?.setNotifText("Could not send friend request :(.");
      notif?.setNotifShow(true);
    };
    addFriend();
  };

  const handleBlockUser = (otherId: number, otherUsername: string) => {
    const blockUser = async () => {
      const result = await blockUserQuery(otherId);
      if (result !== "error") {
        userInfo.isBlocked = true;
        notif?.setNotifText(otherUsername + " blocked!");
        setReloadKey((prevKey) => prevKey + 1);
      } else notif?.setNotifText("Could not block user :(.");
      notif?.setNotifShow(true);
    };
    blockUser();
  };

  let myId: number = 0;
  if (localStorage.getItem("userID"))
    myId = Number(localStorage.getItem("userID"));
  return (
    <main key={reloadKey}>
      {isUser && isFetched ? (
        <main
          className="p-5"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <COnUser userModel={userInfo} />
          <div className="public-left">
            <Container className="p-5">
              <Row className="wrapper public-profile-header">
                <div className="p-2 public-profile-round">
                  <div
                    className="profile-pic-inside"
                    style={{
                      backgroundImage: `url("${avatarURL}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                </div>
                <Col md="auto" className="">
                  <div className="public-username-text">
                    @
                    {userInfo.nickname.length > 10
                      ? userInfo.nickname.substring(0, 7) + "..."
                      : userInfo.nickname}
                  </div>
                  <div className="public-rank-text">
                    {userInfo.rank ? `Rank #${userInfo.rank}` : "unranked"}
                  </div>
                  <div className="public-nickname-text">
                    {userInfo.full_name}
                  </div>
                  <div
                    className="IBM-text"
                    style={{ fontSize: "0.8em", fontWeight: "400" }}
                  >
                    {userInfo.status === 1
                      ? "online"
                      : userInfo.status === 2
                      ? "playing"
                      : userInfo.status === 0
                      ? "offline"
                      : ""}
                  </div>
                </Col>
                {myId !== 0 && userInfo.id === myId ? null : (
                  <Col className="">
                    {!userInfo.isFriend && !userInfo.isBlocked ? (
                      <OverlayTrigger overlay={renderTooltip("Add friend")}>
                        <div
                          id="clickableIcon"
                          className="buttons-round-big float-end"
                          onClick={(e: any) => {
                            handleClickFriend(userInfo.id, userInfo.username);
                          }}
                        >
                          <i className="bi bi-person-plus-fill big-icons" />
                        </div>
                      </OverlayTrigger>
                    ) : null}
                    {!userInfo.isBlocked ? (
                      <OverlayTrigger overlay={renderTooltip("Block user")}>
                        <div
                          id="clickableIcon"
                          className="buttons-round-big float-end"
                          onClick={(e: any) => {
                            handleBlockUser(userInfo.id, userInfo.username);
                          }}
                        >
                          <i className="bi bi-person-x-fill big-icons" />
                        </div>
                      </OverlayTrigger>
                    ) : null}
                  </Col>
                )}
              </Row>
            </Container>
            <Container className="p-5 text-center">
              <Row
                className="ROBOTO-text"
                style={{ fontSize: "1.2em", fontWeight: "400" }}
              >
                <Col>Win Rate</Col>
                <Col>Games Won</Col>
                <Col>Total Games</Col>
                <Col>Play Time</Col>
              </Row>
              <Row className="IBM-text text-huge">
                <Col>{Math.round(userInfo.winRate * 10) / 10}</Col>
                <Col>{userInfo.gamesWon}</Col>
                <Col>{userInfo.gamesPlayed}</Col>
                <Col>{Math.floor(userInfo.playTime)}s</Col>
              </Row>
            </Container>
            <Container className="">
              <DisplayGamesStats userInfo={userInfo} />
            </Container>
          </div>
          <div className="public-right">
            <DisplayUserFriends userInfo={userInfo} myId={myId} />
          </div>
        </main>
      ) : isUser && !isFetched ? null : (
        <main>User does not exist.</main>
      )}
    </main>
  );
}
