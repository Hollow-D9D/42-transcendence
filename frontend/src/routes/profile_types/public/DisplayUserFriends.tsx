import { useState, useEffect, useContext } from "react";
import {
  Col,
  Card,
  Container,
  Row,
  OverlayTrigger,
  Spinner,
} from "react-bootstrap";
import { useContextMenu } from "react-contexify";
import { useNavigate } from "react-router-dom";
import { UsersStatusCxt } from "../../../App";
import { ItableRow, IUserStatus } from "../../../globals/Interfaces";
import { getFriendFriends } from "../../../queries/userFriendsQueries";

export default function DisplayUserFriends(props: any) {
  const usersStatus = useContext(UsersStatusCxt);
  const [friendsList, setFriendsList] = useState<ItableRow[] | undefined>(
    undefined
  );

  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdate] = useState(false);

  let friends: ItableRow[] = [];

  useEffect(() => {
    const fetchDataFriends = async () => {

      const result = await getFriendFriends(props.userInfo.username, "friends");
      if (result !== "error") return result;
    };

    const fetchData = async () => {
      let fetchedFriends = await fetchDataFriends();
      if (fetchedFriends !== undefined && fetchedFriends.length !== 0) {
        for (let i = 0; i < fetchedFriends.length; i++) {
          let newRow: ItableRow = {
            key: i,
            userModel: { nickname: "", login: "", profpic_url: "", id: 0, status: -1 },
          };

          newRow.userModel.id = fetchedFriends[i].id;
          newRow.userModel.login = fetchedFriends[i].login;
          newRow.userModel.nickname = fetchedFriends[i].nickname;
          let found = undefined;
          if (usersStatus) {
            found = usersStatus.find(
              (x: IUserStatus) => x.key === fetchedFriends[i].id
            );
            if (found) newRow.userModel.status = found.userModel.status;
          }
          newRow.userModel.profpic_url = fetchedFriends[i].profpic_url;
          friends.push(newRow);
        }
      }
      setFriendsList(friends);
      setFetched("true");
    };

    fetchData();
  }, [isUpdated, usersStatus]);

  return (
    <main>
      <Col className="p-3">
        <Card className="p-3 main-card">
          <Card.Body>
            <Row className="public-wrapper" style={{ marginBottom: "25px" }}>
              <Col className="text-wrapper">
                <div
                  className="IBM-text"
                  style={{ fontSize: "1em", fontWeight: "500" }}
                >
                  Friends
                </div>
              </Col>
              <Col>
                <div
                  className="IBM-text float-end"
                  style={{ fontSize: "1em", fontWeight: "500" }}
                >
                  {friendsList ? friendsList.length : 0}
                </div>
              </Col>
            </Row>
            <div
              className="public-card-friends"
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              {isFetched === "true" ? (
                friendsList?.length !== 0 ? (
                  friendsList!.map((h, index) => {
                    return (
                      <DisplayFriendsRow
                        listType={"friends"}
                        hook={setUpdate}
                        key={index}
                        userModel={h.userModel}
                        myId={props.myId}
                      />

                    );
                  })
                ) : (
                  <span>No friends.</span>
                )
              ) : (
                <Spinner animation="border" />
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </main>
  );
}

const DisplayFriendsRow = (props: any) => {
  const { show } = useContextMenu();
  const navigate = useNavigate();

  const [isInBlocked, setIsInBlocked] = useState<boolean>(false);

  useEffect(() => {
    const fetchDataFriends = async () => {
      const result = await getFriendFriends(props.userModel.login, "");
      if (result && result.length !== 0) {
        result.some((block: any) => {
          if (block.login === localStorage.getItem("userEmail")) {
            setIsInBlocked(true);
            console.log("isInBlocked", block.login, localStorage.getItem("userEmail"), isInBlocked);
            return
          }
        });
      }
    };

    fetchDataFriends()

    console.log("login:", props.userModel.login);
  })

  function displayMenu(
    e: React.MouseEvent<HTMLElement>,
    targetUserId: number,
    targetUserUsername: string
  ) {
    e.preventDefault();
    show(e, {
      id: "onUser",
      props: {
        userModel: {
          id: targetUserId,
          username: targetUserUsername,
        }
      },
    });
  }

  return (
    <main>
      <Container
        className="text-games"
        style={{
          marginTop: "calc(1vw + 15px)",
          marginBottom: "calc(1vw + 15px)",
        }}
      >
        <Row className="wrapper">
          <Col className="col-auto profile-pic-round-sm">
            <div className="profile-pic-wrapper-sm">
              <div
                className="profile-pic-inside-sm"
                style={{
                  backgroundImage: `url("${props.userModel.profpic_url}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                id="clickableIcon"

                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  if (!isInBlocked) {
                    displayMenu(e, props.userModel.id, props.userModel.login)
                  }
                }
                }
              ></div>
            </div>
            <div
              className={`status-private-sm ${props.userModel.status === 1
                ? "online"
                : props.userModel.status === 2
                  ? "ingame"
                  : props.userModel.status === 0
                    ? "offline"
                    : ""
                }`}
            ></div>
          </Col>
          <Col
            md={"auto"}
            id="clickableIcon"
            className="text-left public-hover"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              if (!isInBlocked) {
                displayMenu(e, props.userModel.id, props.userModel.login)
              }
            }
            }
          >
            <div>
              @
              {props.userModel.nickname.length > 10
                ? props.userModel.nickname.substring(0, 7) + "..."
                : props.userModel.nickname}
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};
