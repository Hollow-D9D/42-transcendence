import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, OverlayTrigger } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import DisplayGamesStats from "./DisplayGamesStats";
import { IUserStatus, userModel } from "../../../globals/Interfaces";
import { getUserAvatarQuery } from "../../../queries/avatarQueries";
import { getOtherUser } from "../../../queries/otherUserQueries";
import DisplayUserFriends from "./DisplayUserFriends";
import { COnUser } from "../../../ContextMenus/COnUser";
import { renderTooltip } from "../../../Components/SimpleToolTip";
import { NotifCxt, UsersStatusCxt } from "../../../App";
import { addFriendQuery } from "../../../queries/userFriendsQueries";
import "./UserPublicProfile.css";
import { getUserFriends } from "../../../queries/userFriendsQueries";
import { userInfo } from "os";
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
  score: 0,
  winRate: 0,
  nickname: "",
  isFriend: false,
  paramName: ""
};

const initializeUser = async (result: any, setUserInfo: any) => {

  userInfoInit.id = result.id;
  userInfoInit.username = result.login;
  userInfoInit.avatar = result.profpic_url;
  userInfoInit.friends = result.friends;
  userInfoInit.gamesLost = result.gamesLost;
  userInfoInit.gamesPlayed = result.gamesPlayed;
  userInfoInit.gamesWon = result.gamesWon;
  userInfoInit.playTime = result.playTime;
  userInfoInit.rank = result.rank;
  userInfoInit.nickname = result.nickname;
  userInfoInit.score = result.score;
  userInfoInit.winRate = result.winRate === null ? 0 : result.winRate;
  setUserInfo(userInfoInit);
  fetchDataFriends(userInfoInit, setUserInfo);
};

const fetchDataFriends = async (userInfo: any, setUserInfo: any) => {

  const result = await getUserFriends();
  if (result !== "error") {
    result.forEach((e: any) => {
      if (e.login === userInfo.paramName || userInfo.paramName === userInfo.username) {
        userInfo.isFriend = true;
      }
    })
    setUserInfo(userInfo);

  };
}
export default function UserProfile() {
  const usersStatus = useContext(UsersStatusCxt);
  const notif = useContext(NotifCxt);
  let params = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<userModel>(userInfoInit);
  const [isFetched, setIsFetched] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
  const [isUser, setIsUser] = useState(true);
  const [status, setStatus] = useState(0);


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
        if (result !== "error") {
          userInfo.paramName = params.userName;
          initializeUser(result.body.user, setUserInfo);

          setIsFetched(true);
        } else setIsUser(false);
      }
    };
    fetchIsUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched, usersStatus]);

  useEffect(() => {
    let found = undefined;
    if (isFetched && usersStatus && userInfo) {
      found = usersStatus.find((x: IUserStatus) => x.key === userInfo.id);
      if (found) setStatus(found.userModel.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersStatus, isFetched, userInfo]);

  const handleClickFriend = (otherId: number, otherUsername: string) => {
    const addFriend = async () => {
      const result = await addFriendQuery(otherId);
      if (result !== "error") {
        notif?.setNotifText("Friend request sent to " + otherUsername + "!");
      } else notif?.setNotifText("Could not send friend request :(.");
      notif?.setNotifShow(true);
    };
    addFriend();
  };

  let myId: number = 0;
  if (localStorage.getItem("userID"))
    myId = Number(localStorage.getItem("userID"));
  return (
    <main>
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
                    {userInfo.nickname}
                  </div>
                  <div
                    className="IBM-text"
                    style={{ fontSize: "0.8em", fontWeight: "400" }}
                  >
                    {status === 1
                      ? "online"
                      : status === 2
                        ? "playing"
                        : status === 0
                          ? "offline"
                          : ""}
                  </div>
                </Col>
                {myId !== 0 && userInfo.id === myId ? null : (
                  <Col className="">
                    {/* {status === 2 ? (
                      <OverlayTrigger overlay={renderTooltip("Watch game")}>
                        <div
                          id="clickableIcon"
                          className="buttons-round-big float-end"
                          onClick={(e: any) => {
                            handleClickWatch(userInfo.id);
                          }}
                        >
                          <i className="bi bi-caret-right-square-fill big-icons" />
                        </div>
                      </OverlayTrigger>
                    ) : (
                      <div className="buttons-round-big-disabled float-end">
                        <i className="bi bi-caret-right-square-fill big-icons" />
                      </div>
                    )} */}
                    {!userInfo.isFriend ?
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
                      </OverlayTrigger> : null}

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
                <Col>Total Win</Col>
                <Col>Play Time</Col>
              </Row>
              <Row className="IBM-text text-huge">
                <Col>{Math.round(userInfo.winRate * 10) / 10}</Col>
                <Col>{userInfo.gamesWon}</Col>
                <Col>{Math.floor(userInfo.playTime / 1000)}s</Col>
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
