import "./chatPreview.css";
import { useEffect, useState } from "react";
import {
  chatPreview,
  newDM,
  fetchDM,
  oneSuggestion,
  updateChannel,
  updateUser,
} from "./type/chat.type";
import { Menu, Item, useContextMenu, theme } from "react-contexify";
import "./context.css";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { current } from "@reduxjs/toolkit";
import { socket } from "../../App";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MENU_CHANNEL = "menu_channel";
const MENU_DM = "menu_dm";

declare var global: {
  selectedChat: chatPreview;
};

export default function Preview({
  current,
  onSelect,
  onNewRoomRequest,
  updateStatus,
  blockedList,
}: {
  current: chatPreview | undefined;
  onSelect: (chatPreview: chatPreview | undefined) => void;
  onNewRoomRequest: () => void;
  updateStatus: number;
  blockedList: [];
}) {
  const [roomPreview, setPreviews] = useState<chatPreview[]>([]);
  const email = localStorage.getItem("userEmail");
  const { show } = useContextMenu();
  const [hide, setHide] = useState<any>();
  const [role, setRole] = useState<any>();
  const [menuEvent, setMenuEvent] = useState<any>(null);

  // console.log("global:::::", global.selectedChat);

  useEffect(() => {
    (async function () {
      await socket.emit("get search suggest", { login: email });
    })();
    socket.on("fetch role", (data) => {
      setRole(data || "noRole");
    });
    socket.on("search suggest", (data: any) => {
      let previews: chatPreview[] = [];
      data.channels.forEach((elem: any) => {
        let isBlocked = false;
        let avatarPic = "";
        let name = elem.group ? elem.name : elem.name.split(":");
        if (!elem.group) {
          name = name[1] === email ? name[2] : name[1];
          let user = data.blocked.find((e: any) => {
            return e.login === name;
          });
          if (user === undefined) {
            user = data.friends.find((e: any) => {
              return e.login === name;
            });
          } else isBlocked = true;
          // console.log(data.friends);

          // if (user)
          name = user.nickname;
          avatarPic = user.profpic_url;
        }
        previews.push({
          id: elem.id,
          dm: !elem.group,
          name: name,
          isPassword: elem.mode === "PROTECTED",
          password: elem.password,
          updateAt: "",
          lastMsg: "",
          unreadCount: 0,
          ownerEmail: "",
          ownerId: 0,
          isBlocked: isBlocked,
          avatar: avatarPic,
        });
      });
      if (data) setPreviews(previews);
    });
    return () => {
      socket.off("search suggest");
    };
  }, [updateStatus, email]);

  useEffect(() => {
    socket.on("add preview", (data) => {
      (async () => {
        await socket.emit("get search suggest", { login: email });
      })();
    });
    socket.on("update preview", () => {
      (async function () {
        await socket.emit("get search suggest", { login: email });
      })();
    });
    socket.on("fetch channel", (value) => {
      let name = value.group ? value.name : value.name.split(":");
      if (!value.group) name = name[1] === email ? name[2] : name[1];
      onSelect({
        id: value.id,
        dm: !value.group,
        name: name,
        isPassword: value.mode === "PROTECTED",
        password: value.password,
        updateAt: "",
        lastMsg: "",
        ownerEmail: "",
        ownerId: -1,
        isBlocked: false,
        avatar: "",
      });
    });
    return () => {
      socket.off("fetch channel");
      socket.off("add preview");
      socket.off("update preview");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (menuEvent) {
      if (hide) hide();
      show(menuEvent, { id: JSON.stringify(global.selectedChat) });
      setMenuEvent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockedList, show, hide, current]);

  const addPreview = (channelId: number) => {
    // current = {
    //   id : channelId,
    // }
  };

  const search = (channelId: number) => {
    for (let i = 0; i < roomPreview.length; i++) {
      if (roomPreview[i].id === channelId) {
        onSelect(roomPreview[i]);
        break;
      }
    }
  };

  function handleLeave() {
    let update: updateChannel = {
      chat_id: global.selectedChat.id,
      dm: global.selectedChat.dm,
      login: email,
      password: "",
      target: -1,
      private: false,
      isPassword: false,
      newPassword: "",
    };
    (async function () {
      await socket.emit("leave channel", update);
    })();
    // onSelect(undefined);
  }

  if (global.selectedChat)
    global.selectedChat.isBlocked = blockedList.find(
      (map: any) => map.id === global.selectedChat.ownerId
    )!;
  return (
    <div className="preview-zone">
      <div className="preview-chat-search">
        <ChatSearch
          onSearchMyChat={(channelId) => search(channelId)}
          onSearchPublicChat={(channelId) => addPreview(channelId)}
          updateStatus={updateStatus}
        />
        <AddRoom
          onRequest={() => {
            onNewRoomRequest();
          }}
        />
      </div>
      <div className="preview-chat-list">
        {roomPreview.map((value, index) => {
          // console.log(index);
          return value.isBlocked ? (
            <></>
          ) : (
            <div key={index}>
              <PreviewChat
                data={value}
                onClick={() => {
                  onSelect(value);
                }}
                selected={value.id === current?.id}
                blockedList={blockedList}
                setHide={setHide}
                setMenuEvent={setMenuEvent}
                role={role}
              />
            </div>
          );
        })}
        {global.selectedChat?.dm ||
        (role !== "owner" && role !== "member" && role !== "admin") ? (
          <></>
        ) : (
          <Menu id={JSON.stringify(global.selectedChat)} theme={theme.dark}>
            {role !== "owner" ? (
              <Item onClick={handleLeave}>Leave chat</Item>
            ) : (
              <Item onClick={handleLeave}>Delete chat</Item>
            )}
          </Menu>
        )}
      </div>
    </div>
  );
}

function ChatSearch({
  onSearchMyChat,
  onSearchPublicChat,
  updateStatus,
}: {
  onSearchMyChat: (channelId: number) => void;
  onSearchPublicChat: (channelId: number) => void;
  updateStatus: number;
}) {
  const [suggestion, setSug] = useState<oneSuggestion[]>([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (updateStatus === 0) return;
    (async function () {
      await socket.emit("get search suggest", { login: email });
    })();
  }, [updateStatus, email]);

  let lastId = 20000;

  function returnId(): number {
    lastId++;
    return lastId;
  }

  useEffect(() => {
    (async function () {
      await socket.emit("get search suggest", { login: email });
    })();
    socket.on("search suggest", (data: any) => {
      let previews: oneSuggestion[] = [];
      if (data) {
        data.friends.forEach((elem: any) => {
          if (
            elem.login === email ||
            data.blocked.find((e: any) => {
              return e.login === elem.login;
            })
          )
            return;
          previews.push({
            category: "user",
            picture: elem.profpic_url,
            name: elem.nickname,
            id: elem.id,
            data_id: returnId(),
          });
        });
        // data.channels.forEach((elem: any) => {
        //   previews.push({
        //     category: "public chat",
        //     picture: "",
        //     name: elem.name,
        //     id: elem.id,
        //     data_id: returnId(),
        //   });
        // });

        setSug(previews);
      }
    });

    return () => {
      socket.off("search suggest");
    };
  }, [email]);

  const handleOnSelect = (data: oneSuggestion) => {
    // updateStatus = data.id;

    // socket.emit("into channel", {
    //   chat_id: data.id,
    //   login: email,
    //   password: "",
    // });
    // socket.emit("read msgs", data.id);
    // socket.emit("get setting", data.id);
    // socket.emit("get channel", data.id);
    // // if (data.catagory === "user") {

    let dm: newDM = {
      email: email,

      target_login: data.name,
    };
    (async function () {
      await socket.emit("create dm", dm);
    })();
    //   });
    // } else if (data.catagory === "my chat") onSearchMyChat(data.data_id);
    // else if (data.catagory === "public chat") onSearchPublicChat(data.data_id);
  };

  const formatResult = (data: oneSuggestion) => {
    return (
      <div className="search-result">
        <div className="result-type">
          <p style={{ display: data.category === "my chat" ? "" : "none" }}>
            My Chat
          </p>
          <p style={{ display: data.category === "public chat" ? "" : "none" }}>
            Public Chat
          </p>
          <p style={{ display: data.category === "user" ? "" : "none" }}>
            User
          </p>
        </div>
        <p className="result">{data.name}</p>
      </div>
    );
  };

  return (
    <div className="input-search">
      <ReactSearchAutocomplete
        items={suggestion}
        fuseOptions={{ keys: ["name"] }}
        onSelect={handleOnSelect}
        autoFocus={true}
        placeholder="search"
        formatResult={formatResult}
        styling={{ height: "35px" }}
      />
    </div>
  );
}

function AddRoom({ onRequest }: { onRequest: () => void }) {
  return (
    <div onMouseUp={onRequest} className="add-room-button">
      +
    </div>
  );
}

function PreviewChat({
  data,
  onClick,
  selected,
  blockedList,
  setHide,
  setMenuEvent,
  role,
}: {
  data: chatPreview;
  onClick?: () => void;
  selected: boolean;
  blockedList: [];
  setHide: (d: any) => void;
  setMenuEvent: (event: any) => void;
  role: string;
}) {
  const [avatarURL, setAvatarURL] = useState(
    process.env.REACT_APP_PUBLIC_URL + "/target.png"
  );

  useEffect(() => {
    const getAvatar = () => {
      if (data.avatar === "") {
        setAvatarURL(process.env.REACT_APP_PUBLIC_URL + "/target.png");
      } else {
        setAvatarURL(data.avatar);
      }
    };
    getAvatar();
  }, [data.ownerId, data.avatar]);

  const handleMenu = (event: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let { hideAll } = useContextMenu({
      id: JSON.stringify(global.selectedChat),
    });
    setHide(hideAll);
    global.selectedChat = data;
    global.selectedChat.isBlocked = blockedList.find(
      (map: any) => map.id === data.ownerId
    )!;
    if (!data.dm && (role === "owner" || role === "admin" || role === "member"))
      setMenuEvent(event);
  };

  return (
    <>
      <div
        className="preview-chat"
        onMouseDown={onClick}
        style={{ backgroundColor: selected ? "rgb(255 255 255 / 29%)" : "" }}
        onContextMenu={(e) => handleMenu(e)}
      >
        <div>
          <div
            className="preview-chat-img"
            style={{
              backgroundImage: `url("${avatarURL}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="preview-chat-info">
            <div className="preview-chat-info-1">
              <p className="preview-chat-name">{data.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
