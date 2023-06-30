import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { useContextMenu } from "react-contexify";
import { getGameStats } from "../../../queries/gamesQueries";
import { getOtherUser } from "../../../queries/otherUserQueries";

export default function DisplayGamesStats(props: any) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const getPlayedGamesStats = async () => {
      const result_1 = await getGameStats(props.userInfo.username);
      if (result_1 !== "error") {
        setGames(result_1);
      } else console.log("Could not get games stats.");
    };
    getPlayedGamesStats();
  }, []);

  return (
    <main>
      <Row>
        <Col className="">
          <Card className="p-3 main-card">
            <Card.Body className="public-card">
              <Row className="public-wrapper">
                <Col className="text-wrapper">
                  <div
                    className="IBM-text"
                    style={{ fontSize: "1em", fontWeight: "500" }}
                  >
                    Latest Games
                  </div>
                </Col>
                <Col>
                  <div
                    className="IBM-text float-end"
                    style={{ fontSize: "1em", fontWeight: "500" }}
                  >
                    {games.length}
                  </div>
                </Col>
              </Row>
              {games && games.length !== 0 ? (
                <div>
                  <Row className="text-title-games">
                    <Col xs={3}>Result</Col>
                    <Col xs={4}>Opponent</Col>
                    <Col xs={2}>Score</Col>
                    <Col >Duration</Col>
                    <Col ></Col>
                  </Row>
                  <div
                    className=""
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {games !== undefined
                      ? games!.map((_h, index) => {
                        return (
                          <DisplayGamesRow
                            key={index}
                            game={games[index]}
                            name={props.userInfo.username}
                          />
                        );
                      })
                      : null}
                  </div>
                </div>
              ) : (
                <Row className="text-title-games">
                  <Col>No game history.</Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </main>
  );
}

const DisplayGamesRow = (props: any) => {
  const { show } = useContextMenu();
  const [avatarURL, setAvatarURL] = useState("");

  useEffect(() => {
    const getAvatar = async () => {
      let result;
      if (props.name === props.game.winnerLogin)
        result = await getOtherUser(props.game.loserLogin);
      else
        result = await getOtherUser(props.game.winnerLogin);
      if (result)
        setAvatarURL(result.body.user.profpic_url)
      else
        setAvatarURL(
          "https://img.myloview.fr/stickers/default-avatar-profile-in-trendy-style-for-social-media-user-icon-400-228654852.jpg"
        );
    };
    getAvatar();
  }, []);

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
          who: targetUserId,
          username: targetUserUsername,
        }
      },
    });
  }

  return (
    <main className="text-games">
      <Row className="wrapper">
        <Col>{props.game.loserLogin !== props.name ? "Victory" : "Defeat"}</Col>
        <Col className="col-auto profile-pic-round-sm">
          <div
            className={`profile-pic-wrapper-sm`}
          >
            <div
              className="profile-pic-inside-sm"
              style={{
                backgroundImage: `url("${avatarURL}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              id="clickableIcon"
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                displayMenu(
                  e,
                  props.game.id,
                  props.game.winnerLogin
                )
              }
            ></div>
          </div>
        </Col>
        <Col
          xs={3}
          id="clickableIcon"
          className="text-left public-hover"
          onClick={(e: React.MouseEvent<HTMLElement>) =>
            displayMenu(e, props.game.id, props.game.winnerLogin)
          }
        >
          @{props.name === props.game.winnerLogin ? props.game.loserLogin : props.game.winnerLogin}

        </Col>
        <Col className="text-center">{`${props.game.winnerScore}:${props.game.loserScore}`}</Col>
        <Col className="text-center">
          {Math.floor(props.game.duration)}s
        </Col>
        <Col xs={1}></Col>
      </Row>
    </main>
  );
};
