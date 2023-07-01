import { useContext, useEffect, useState } from "react";
import "./roomStatus.css";
import {
  chatPreview,
  mute,
  oneUser,
  Tag,
  updateChannel,
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
  blockedList,
}: {
  current: chatPreview | undefined;
  role: string;
  outsider: boolean | undefined;
  blockedList: [];
}) {
  const [add, setAdd] = useState<boolean>(false);
  const [invitationTag, setTag] = useState<Tag[]>([]);

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (current) {
      (async function () {
        await socket.emit("read room status", {
          channelId: current?.id,
          login: email,
        });
        await socket.emit("get invitation tags", { chat_id: current?.id });
      })();
    }
  }, [current, email]);

  useEffect(() => {
    socket.on("invitation tags", (data: Tag[]) => {
      setTag(data);
    });

    return () => {
      socket.off("invitation tags");
    };
  }, [current, email]);

  const handleInvite = (member: Tag) => {
    setAdd(false);

    let update: updateChannel = {
      chat_id: current!.id,
      login: email,
      password: "",
      target: member.name,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };
    (async function () {
      await socket.emit("join channel", update);
    })();
  };

  const onDelete = (i: number) => { };

  return (
    <div className="chat-status-zone">
      <div className="status-top">
        {role !== "noRole" || current?.dm ? (
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
        isPassword={
          current?.password !== null && current?.password !== "" ? true : false
        }
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
  const [muteds, setMuteds] = useState<string[]>([""]);
  const [banned, setBanned] = useState<oneUser[] | null>([]);

  useEffect(() => {
    setMembers(
      members?.map((elem): oneUser => {
        return {
          nickname: elem.nickname,
          login: elem.login,
          id: elem.id,
          role: "member",
          isMuted: muteds?.some((e) => {
            return e === elem.login;
          }),
          isFriend: false,
          status: elem.status,
          isBlocked: false,
          profpic_url: elem.profpic_url,
        };
      }) || null
    );
  }, [muteds]);

  useEffect(() => {
    socket.on("fetch muted", (data: any) => {
      setMuteds(
        data.map((e: any) => {
          return e.user.login;
        })
      );
    });

    socket.on("fetch owner", (data: any) => {
      if (data.length === 0) {
        setOwner([]);
        return;
      }
      setOwner([
        {
          nickname: data[0]?.nickname,
          login: data[0]?.login,
          id: data[0]?.id,
          role: "owner",
          isMuted: false,
          isFriend: false,
          status: data[0]?.status,
          isBlocked: false,
          profpic_url: data[0]?.profpic_url,
        },
      ]);
    });

    socket.on("fetch admins", (data: any) => {
      setAdmins(
        data.map((elem: any): oneUser => {
          return {
            nickname: elem.nickname,
            login: elem.login,
            id: elem.id,
            role: "admin",
            isMuted: muteds?.some((e) => {
              return e === elem.login;
            }),
            isFriend: false,
            status: elem.status,
            isBlocked: false,
            profpic_url: elem.profpic_url,
          };
        })
      );
    });

    socket.on("fetch members", (data) => {
      setMembers(
        data.map((elem: any): oneUser => {
          return {
            nickname: elem.nickname,
            login: elem.login,
            id: elem.id,
            role: "member",
            isMuted: muteds?.some((e) => {
              return e === elem.login;
            }),
            isFriend: false,
            status: elem.status,
            isBlocked: false,
            profpic_url: elem.profpic_url,
          };
        })
      );
    });

    socket.on("fetch banned", (data) => {
      setBanned(
        data.map((elem: any): oneUser => {
          return {
            nickname: elem.nickname,
            login: elem.login,
            id: elem.id,
            role: "banned",
            isMuted: muteds?.some((e) => {
              return e === elem.login;
            }),
            isFriend: false,
            status: elem.status,
            isBlocked: false,
            profpic_url: elem.profpic_url,
          };
        })
      );
    });

    return () => {
      socket.off("fetch owner");
      socket.off("fetch muted");
      socket.off("fetch admins");
      socket.off("fetch members");
      socket.off("fetch banned");
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
        mutedList={muteds}
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
        mutedList={muteds}
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
        mutedList={muteds}
      />
      <p
        className="status-type"
        style={{ display: banned?.length ? "" : "none" }}
      >
        BANNED
      </p>
      <Status
        users={banned}
        current={current}
        role={role}
        blockedList={blockedList}
        mutedList={muteds}
      />
    </div>
  );
}

function Status({
  users,
  current,
  role,
  blockedList,
  mutedList,
}: {
  users: oneUser[] | null;
  current: chatPreview | undefined;
  role: string;
  blockedList: [];
  mutedList: string[];
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
    socket.on("admin success", (payload: any) => {
      global.selectedUser.role = payload.role;
    });
    return () => {
      socket.off("admin success");
    };
  }, []);

  function handleCreateGame() {
    (async () => {
      console.log("send invite");
      await socket.emit("send invite", { login: localStorage.getItem("userEmail"), target: global.selectedUser.login });
    })();
  }

  function handleMute(mins: number) {
    let update: mute = {
      login: email,
      duration: mins,
      target: global.selectedUser.login,
      channelId: current!.id,
    };
    (async function () {
      await socket.emit("mute user", update);
    })();
  }

  function handleUnmute() {
    let update = {
      login: email,
      target: global.selectedUser.login,
      target_id: global.selectedUser.id,
      chat_id: current!.id,
    };
    (async function () {
      await socket.emit("unmute user", update);
    })();
  }

  function handleBeAdmin() {
    let update: updateChannel = {
      chat_id: current?.id,
      login: email,
      password: "",
      target: global.selectedUser.login,
      private: false,
      isPassword: false,
      newPassword: "",
      dm: false,
    };
    (async function () {
      await socket.emit("be admin", update);
    })();
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
    (async function () {
      await socket.emit("not admin", update);
    })();
  }

  function handleBanUser() {
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
    (async function () {
      await socket.emit("ban user", update);
    })();
  }

  function handleUnbanUser() {
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
    (async function () {
      await socket.emit("unban user", update);
    })();
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
    (async function () {
      await socket.emit("kick out", update);
    })();
  }

  return (
    <>
      {users?.map((value, index) => {
        return (
          <div key={'user' + JSON.stringify(value)}>
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
        {global.selectedUser?.status === 1 ? (
          <Item onClick={handleCreateGame}>invite to a game!</Item>
        ) : (
          null
        )}
        <Separator />
        {role === "owner" && global.selectedUser?.role !== "banned" ? (
          <>
            <Item
              style={{
                display: global.selectedUser?.role === "member" ? "" : "none",
              }}
              onClick={handleBeAdmin}
            >
              assign as admin
            </Item>
            <Item
              style={{
                display: global.selectedUser?.role !== "member" ? "" : "none",
              }}
              onClick={handleNotAdmin}
            >
              unset admin right
            </Item>
          </>
        ) : (
          null
        )}
        {(role === "admin" || role === "owner") &&
          global.selectedUser?.role !== "banned" && global.selectedUser?.role !== "owner" ? (
          <>
            <Submenu style={{}} label="mute">
              <Item onClick={() => handleMute(1)}>1 mins</Item>
              <Item onClick={() => handleMute(2)}>2 mins</Item>
              <Item onClick={() => handleMute(5)}>5 mins</Item>
              <Item onClick={() => handleMute(10)}>10 mins</Item>
            </Submenu>

            {global.selectedUser?.isMuted && (
              <Item onClick={() => handleUnmute()}>unmute</Item>
            )}
            <Item onClick={handleKickOut}>kick out</Item>
            <Item onClick={() => handleBanUser()}>ban</Item>
          </>
        ) : (
          ((role === "admin" || role === "owner") && global.selectedUser?.role !== 'owner' ? (
            <Item onClick={() => handleUnbanUser()}>unban</Item>
          ) : (
            null
          ))
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
  data: oneUser;
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
    let found = usersStatus?.find((elem) =>{
      return data.id === elem.userModel.id
    })?.userModel.status;

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
  }, [data.id, usersStatus]);

  const handleMenu = (event: any) => {
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
    // global.selectedUser.status = global.onlineStatus;
    event.preventDefault();
    setSelData({ data: data, event: event });
  };

  return (
    <div
      style={{ display: data ? "" : "none" }}
      className="one-status"
      onContextMenu={email !== data?.login ? (e) => handleMenu(e) : undefined}
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
    (async function () {
      await socket.emit("join channel", update);
    })();
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
