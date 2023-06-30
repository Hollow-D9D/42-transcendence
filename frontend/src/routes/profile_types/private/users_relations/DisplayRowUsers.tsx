import { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useContextMenu } from "react-contexify";
import { NotifCxt } from "../../../../App";
import {
  removeFriendQuery,
  blockUserQuery,
  unblockUserQuery,
  addFriendQuery,
  acceptFriendQuery,
  denyInviteQuery,
} from "../../../../queries/userFriendsQueries";

export const DisplayRow = (props: any) => {
  const { show } = useContextMenu();
  function displayMenu(e: React.MouseEvent<HTMLElement>, targetUser: string) {
    e.preventDefault();
    show(e, {
      id: "onUserSimple",
      props: {
        userName: targetUser,
      },
    });
  }

  return (
    <main>
      <Container className="">
        <Row className="wrapper">
          <Col
            className="col-auto profile-pic-round-sm"
            id="clickableIcon"
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              displayMenu(e, props.userModel.login)
            }
          >
            <div
              className={`profile-pic-wrapper ${
                props.userModel.status === 2 ? "ingame" : ""
              }`}
            >
              <div
                className="profile-pic-inside-sm"
                style={{
                  backgroundImage: `url("${props.userModel.profpic_url}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
            <div
              className={`status-private ${
                props.userModel.status === 1
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
            className="content"
            id="clickableIcon"
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              displayMenu(e, props.userModel.login)
            }
          >
            <div className="profile-username-text" style={{ fontSize: "15px" }}>
              @
              {props.userModel && props.userModel.login
                ? props.userModel.nickname.length > 10
                  ? props.userModel.nickname.substring(0, 7) + "..."
                  : props.userModel.nickname
                : null}
            </div>
          </Col>
          <Col>
            {props.listType === "friends" ? (
              <ButtonsFriends
                id={props.userModel.id}
                username={props.userModel.login}
                hook={props.hook}
                state={props.state}
              />
            ) : props.listType === "blocked" ? (
              <ButtonsBlocked
                id={props.userModel.id}
                username={props.userModel.login}
                hook={props.hook}
                state={props.state}
              />
            ) : props.listType === "pending" ? (
              <ButtonsPending
                id={props.userModel.id}
                username={props.userModel.login}
                hook={props.hook}
                state={props.state}
              />
            ) : props.listType === "addFriend" ? (
              <ButtonsAdding
                id={props.userModel.id}
                username={props.userModel.login}
                isFriend={props.userModel.isFriend}
              />
            ) : null}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

const ButtonsFriends = (props: any) => {
  const notif = useContext(NotifCxt);

  const handleClickRemove = (e: any) => {
    e.preventDefault();
    const removeFriend = async () => {
      const result = await removeFriendQuery(props.id);
      if (result !== "error") {
        notif?.setNotifText(props.username + " removed from friends!");
        props.hook(!props.state);
      } else
        notif?.setNotifText(
          "Could not remove " + props.username + " from friends :(."
        );
      notif?.setNotifShow(true);
    };
    removeFriend();
  };

  const handleClickBlock = (e: any) => {
    e.preventDefault();
    const blockFriend = async () => {
      const result = await blockUserQuery(props.id);
      if (result !== "error") {
        notif?.setNotifText(props.username + " blocked.");
        props.hook(!props.state);
      } else notif?.setNotifText("Could not block " + props.username + " :(.");
      notif?.setNotifShow(true);
    };
    blockFriend();
  };

  return (
    <main>
      <Col className="float-end">
        <button
          type="button"
          className="IBM-text btn btn-sm text-button"
          onClick={(e) => handleClickRemove(e)}
        >
          Remove
        </button>
      </Col>
      <Col className="float-end">
        <button
          type="button"
          className="IBM-text btn btn-sm text-button"
          onClick={(e) => handleClickBlock(e)}
        >
          Block
        </button>
      </Col>
    </main>
  );
};

const ButtonsBlocked = (props: any) => {
  const notif = useContext(NotifCxt);

  const handleClickUnblock = (e: any) => {
    e.preventDefault();
    const unblockUser = async () => {
      const result = await unblockUserQuery(props.id);
      if (result !== "error") {
        notif?.setNotifText(props.username + " unblocked.");
        props.hook(!props.state);
      } else
        notif?.setNotifText("Could not unblock " + props.username + " :(.");
      notif?.setNotifShow(true);
    };
    unblockUser();
  };

  return (
    <main>
      <Col className=""></Col>
      <Col className="float-end">
        <button
          type="button"
          className="IBM-text btn btn-sm text-button"
          onClick={(e) => handleClickUnblock(e)}
        >
          Unblock
        </button>
      </Col>
    </main>
  );
};

const ButtonsPending = (props: any) => {
  const notif = useContext(NotifCxt);

  const handleClickAccept = (e: any) => {
    e.preventDefault();
    const acceptFriend = async () => {
      const result = await acceptFriendQuery(props.id);
      if (result !== "error") {
        notif?.setNotifText(props.username + " added as friend!");
        props.hook(!props.state);
      } else
        notif?.setNotifText(
          "Could not accept friend request from " + props.username + " :(."
        );
      notif?.setNotifShow(true);
    };
    acceptFriend();
  };

  const handleClickIgnore = (e: any) => {
    e.preventDefault();
    const ignoreFriend = async () => {
      const result = await denyInviteQuery(props.id);
      if (result !== "error") {
        notif?.setNotifText("Request from " + props.username + " ignored.");
        props.hook(!props.state);
      } else
        notif?.setNotifText(
          "Could not ignore request from " + props.username + " :(."
        );
      notif?.setNotifShow(true);
    };
    ignoreFriend();
  };

  return (
    <main>
      <Col className="float-end">
        <button
          type="button"
          className="IBM-text btn btn-sm text-button"
          onClick={(e) => handleClickAccept(e)}
        >
          Accept
        </button>
      </Col>
      <Col className="float-end">
        <button
          type="button"
          className="IBM-text btn btn-sm text-button"
          onClick={(e) => handleClickIgnore(e)}
        >
          Ignore
        </button>
      </Col>
    </main>
  );
};

const ButtonsAdding = (props: any) => {
  const notif = useContext(NotifCxt);

  const handleClickAccept = (e: any) => {
    e.preventDefault();
    
    const addFriend = async () => {
      const result = await addFriendQuery(props.id);
      if (result !== "error") {
        notif?.setNotifText(props.username + " added as friend!");
      } else
        notif?.setNotifText(
          "Could not accept friend request from " +
            props.username +
            " :(."
        );
      notif?.setNotifShow(true);
    };
    addFriend();
  };

  return (
    <main>
      {!props.isFriend ? (
        <Col className="float-end">
          <button
            type="button"
            className="IBM-text btn btn-sm text-button"
            onClick={(e) => handleClickAccept(e)}
          >
            Send Request
          </button>
        </Col>
      ) : (
        ""
      )}
    </main>
  );
};
