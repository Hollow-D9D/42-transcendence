import { useContext, useEffect, useState } from "react";
import "./roomStatus.css";
import {
  chatPreview,
  gameInvitation,
  mute,
  oneUser,
  Tag,
  updateChannel,
  updateUser,
} from "./type/chat.type";
import {
  Menu,
  Item,
  Separator,
  useContextMenu,
  Submenu,
  theme,
} from "react-contexify";
import "./context.css";
import { AddUserIcon, QuitIcon } from "./icon";
import ReactTags from "react-tag-autocomplete";
import { socket } from "../../App";
import { getUserAvatarQuery } from "../../queries/avatarQueries";
import { Player } from "../game.interfaces";
import { useNavigate } from "react-router-dom";
import { UsersStatusCxt } from "../../App";
import { IUserStatus } from "../../globals/Interfaces";

declare var global: {
  selectedUser: oneUser;
  onlineStatus: number | undefined;
};

export default function RoomStatus({
  current,
  role,
  outsider,
  updateStatus,
  blockedList,
}: {
  current: chatPreview | undefined;
  role: string;
  outsider: boolean | undefined;
  updateStatus: number;
  blockedList: [];
}) {
  const [add, setAdd] = useState<boolean>(false);
  const [invitationTag, setTag] = useState<Tag[]>([]);

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (current) {

      socket.emit("read room status", { channelId: current?.id, login: email });
      socket.emit("get invitation tags", { chat_id: current?.id });
    }
  }, [updateStatus, current, email]);

  useEffect(() => {
    socket.on("invitation tags", (data: Tag[]) => {
      setTag(data);


    });
    // socket.emit("invitation tags"); //REMOVE
    // setTag(
    //   [{
    //     id: 1,
    //     name: "valod"
    //   }, {
    //     id: 2,
    //     name: "bulki"
    //   }
    //   ]);
    return () => {
      socket.off("invitation tags");
    };
  }, [current, email]);

  const handleInvite = (member: Tag) => {
    setAdd(false);

    let update: updateChannel = {
      chat_id: current!.id,
      login: member.name,
      password: "",
      target: member.name,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };
    socket.emit("join channel", update);
  };

  const onDelete = (i: number) => { };

  return (
    <div className="chat-status-zone">
      <div className="status-top">
        {current ? (
          add ? (
            <div className="add-box">
              <ReactTags
                tags={[]}
                suggestions={invitationTag}
                placeholderText="invite to chat"
                noSuggestionsText="user not found"
                onAddition={handleInvite}
                onDelete={onDelete}
                autofocus={true}
                onBlur={() => {
                  setAdd(false);
                }}
              />
              <QuitIcon
                onClick={() => {
                  setAdd(false);
                }}
              />
            </div>
          ) : (
            <>
              <AddUserIcon
                onClick={() => {
                  setAdd(true);
                }}
              />
            </>
          )
        ) : (
          <></>
        )}
      </div>
      <MemberStatus current={current} role={role} blockedList={blockedList} />
      <JoinChannel
        channelId={current?.id}
        outsider={outsider}
        isPassword={(current?.password !== null && current?.password !== "") ? true : false}
      />
    </div>
  );
}

function MemberStatus({
  current,
  role,
  blockedList,
}: {
  current: chatPreview | undefined;
  role: string;
  blockedList: [];
}) {
  const [owner, setOwner] = useState<oneUser[] | null>([]);
  const [admins, setAdmins] = useState<oneUser[] | null>([]);
  const [members, setMembers] = useState<oneUser[] | null>([]);
  const [inviteds, setInviteds] = useState<oneUser[] | null>([]);

  useEffect(() => {
    socket.on("fetch owner", (data: oneUser[] | null) => {
      setOwner(data);
    });

    socket.on("fetch admins", (data: oneUser[] | null) => {
      setAdmins(data);
    });

    socket.on("fetch members", (data: oneUser[] | null) => {
      setMembers(data);
    });

    socket.on("fetch inviteds", (data: oneUser[] | null) => {
      setInviteds(data);
    });

    return () => {
      socket.off("fetch owner");
      socket.off("fetch admins");
      socket.off("fetch members");
      socket.off("fetch inviteds");
    };
  }, [current]);

  return (
    <div className="member-status">
      <p
        className="status-type"
        style={{ display: owner?.length ? "" : "none" }}
      >
        OWNER
      </p>
      <Status
        users={owner}
        current={current}
        role={role}
        blockedList={blockedList}
      />
      <p
        className="status-type"
        style={{ display: admins?.length ? "" : "none" }}
      >
        ADMINS
      </p>
      <Status
        users={admins}
        current={current}
        role={role}
        blockedList={blockedList}
      />
      <p
        className="status-type"
        style={{ display: members?.length ? "" : "none" }}
      >
        MEMBERS
      </p>
      <Status
        users={members}
        current={current}
        role={role}
        blockedList={blockedList}
      />
      {/* <p
        className="status-type"
        style={{ display: inviteds?.length ? "" : "none" }}
      >
        Invited Users
      </p>
      <Status
        users={inviteds}
        current={current}
        role={role}
        blockedList={blockedList}
      /> */}
    </div>
  );
}

function Status({
  users,
  current,
  role,
  blockedList,
}: {
  users: oneUser[] | null;
  current: chatPreview | undefined;
  role: string;
  blockedList: [];
}) {
  const email = localStorage.getItem("userEmail");
  const [selData, setSelData] = useState<any>(null);
  const { show } = useContextMenu();
  const [hide, setHide] = useState<any>();
  const usersStatus = useContext(UsersStatusCxt);
  const navigate = useNavigate();

  useEffect(() => {
    if (selData && selData.event) {
      if (hide) hide();
      show(selData.event, { id: JSON.stringify(selData.data) });
      selData.event = null;
    }
  }, [selData, show, hide, usersStatus, blockedList]);

  useEffect(() => {
    socket.on("admin success", (() => { global.selectedUser.isAdmin = true }))
    return (() => {
      socket.off("admin success");
    })
  }, [])
  function handleAddFriend() {
    let update: updateUser = {
      selfEmail: email,
      otherId: global.selectedUser.id,
    };
    socket.emit("add friend", update);
  }

  function handleCreateGame() {
    socket.emit("start_private", (player: Player) => {
      const invitation: gameInvitation = {
        gameInfo: player,
        inviterId: Number(localStorage.getItem("userID")),
        inviterName: localStorage.getItem("userNickname")!,
        targetId: global.selectedUser.id,
      };
      socket.emit("send invitation", invitation);
      localStorage.setItem("roomid", player.roomId.toString());
      localStorage.setItem("playernb", player.playerNb.toString());
      navigate("/app/privateGame");
    });
  }

  function handleMute(mins: number) {
    let update: mute = {
      duration: mins,
      login: global.selectedUser.login,
      channelId: current!.id,
    };
    socket.emit("mute user", update);
  }

  function handleBlockUser() {
    let update: updateUser = {
      selfEmail: email,
      otherId: global.selectedUser.id,
    };
    socket.emit("block user", update);
  }

  function handleUnblockUser() {
    let update: updateUser = {
      selfEmail: email,
      otherId: global.selectedUser.id,
    };
    socket.emit("unblock user", update);
  }

  function handleBeAdmin() {

    console.log("global.selectedUser", global.selectedUser);
    let update: updateChannel = {
      chat_id: current!.id,
      login: email,
      password: "",
      target: global.selectedUser.login,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };
    console.log("update::", update);

    socket.emit("be admin", update);
  }

  function handleNotAdmin() {
    let update: updateChannel = {
      chat_id: current!.id,
      login: email,
      password: "",
      target: global.selectedUser.login,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };
    socket.emit("not admin", update);
  }

  function handleKickOut() {
    let update: updateChannel = {
      chat_id: current!.id,
      login: email,
      password: "",
      target: global.selectedUser.login,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };
    socket.emit("kick out", update);
  }

  return (
    <>
      {users?.map((value, index) => {
        return (
          <div key={index}>
            <OneStatus
              data={value}
              setSelData={setSelData}
              setHide={setHide}
              blockedList={blockedList}
            />
          </div>
        );
      })}
      <Menu id={JSON.stringify(global.selectedUser)} theme={theme.dark}>
        <Item onClick={handleAddFriend}>add friend</Item>
        {global.selectedUser?.isOnline ? (
          <Item onClick={handleCreateGame}>invite to a game!</Item>
        ) : (
          <></>
        )}
        {global.selectedUser?.isBlocked ? (
          <Item onClick={handleUnblockUser}>unblock user</Item>
        ) : (
          <Item onClick={handleBlockUser}>block user</Item>
        )}
        <Separator />
        {role === "owner"
          //  && global.selectedUser?.isInvited === false 
          ? (
            <>

              <Item
                style={{
                  display: global.selectedUser?.isAdmin === false ? "" : "none",
                }}
                onClick={handleBeAdmin}
              >
                assign as admin
              </Item>
              <Item
                style={{
                  display: global.selectedUser?.isAdmin === true ? "" : "none",
                }}
                onClick={handleNotAdmin}
              >
                unset admin right
              </Item>
            </>
          ) : (
            <></>
          )}
        {(role === "admin" || role === "owner")
          // &&
          // global.selectedUser?.isInvited === false 
          ? (
            <>
              <Submenu label="mute">
                <Item onClick={() => handleMute(5)}>5 mins</Item>
                <Item onClick={() => handleMute(10)}>10 mins</Item>
                <Item onClick={() => handleMute(15)}>15 mins</Item>
                <Item onClick={() => handleMute(20)}>20 mins</Item>
              </Submenu>
              <Item onClick={handleKickOut}>kick out</Item>
            </>
          ) : (
            <></>
          )}
      </Menu>
    </>
  );
}

function OneStatus({
  data,
  setSelData,
  setHide,
  blockedList,
}: {
  data: any;
  setSelData: (d: any) => void;
  setHide: (d: any) => void;
  blockedList: [];
}) {
  const email = localStorage.getItem("userEmail");
  const [avatarURL, setAvatarURL] = useState("");
  const usersStatus = useContext(UsersStatusCxt);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setAvatarURL(data.profpic_url);

    // setStatus(data.status);
    let found = data.status;
    switch (found) {
      case 0:
        setStatus("status-offline");
        break;
      case 1:
        setStatus("status-online");
        break;
      case 2:
        setStatus("status-ingame");
        break;
    }
    // }
  }, [data.id, usersStatus]);

  const handleMenu = (event: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let { hideAll } = useContextMenu({
      id: JSON.stringify(global.selectedUser),
    });
    setHide(hideAll);
    global.selectedUser = data;
    global.onlineStatus = usersStatus?.find(
      (map: IUserStatus) => map.key === data.id
    )?.userModel.status;
    global.selectedUser.isBlocked = blockedList.find(
      (map: any) => map.id === data.id
    )!;
    global.selectedUser.isOnline = global.onlineStatus === 1;

    event.preventDefault();
    console.log(":::::::", data);

    setSelData({ data: data, event: event });
  };

  return (
    <div
      style={{ display: data ? "" : "none" }}
      className="one-status"
      onContextMenu={email !== data?.email ? (e) => handleMenu(e) : undefined}
      onClick={() => navigate("/app/public/" + data?.login)}
    >
      <div
        className={`one-pic status-ball ${status}`}
        style={{
          backgroundImage: `url("${avatarURL}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <p className="one-name">@{data?.nickname}</p>
    </div>
  );
}

function JoinChannel({
  channelId,
  outsider,
  isPassword,
}: {
  channelId: number | undefined;
  outsider: boolean | undefined;
  isPassword: boolean | undefined;
}) {
  const email = localStorage.getItem("userEmail");
  const [password, setPass] = useState("");

  const handleSetPass = (event: any) => {
    setPass(event.target.value);
  };

  const handleJoin = () => {
    let update: updateChannel = {
      chat_id: channelId,
      login: email,
      password: password,
      target: -1,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };

    socket.emit("join channel", update);
    setPass("");
  };

  return (
    <div style={{ display: outsider ? "" : "none" }}>
      <div
        className="password-zone"
        style={{ display: isPassword ? "" : "none" }}
      >
        <p className="protected-tag">PROTECTED</p>
        <p className="password-tag">password</p>
        <input
          className="password-input"
          id="password"
          type="password"
          value={password}
          onChange={handleSetPass}
          placeholder="password"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJoin();
          }}
        />
      </div>
      <div
        className="join-channel-button"
        style={{ display: outsider ? "" : "none" }}
        onMouseUp={handleJoin}
      >
        join channel
      </div>
    </div>
  );
}
