import "./card.css";
import "./tags.css";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../App";
import { newChannel } from "./type/chat.type";
import "react-contexify/dist/ReactContexify.css";
import "./context.css";
import Switch from "react-switch";
import { Tag } from "react-tag-autocomplete";
import { matchSorter } from "match-sorter";

interface NewRoomCardProps {
  newRoomRequest: boolean;
  onNewRoomRequest: () => void;
  updateStatus: number;
}

export function NewRoomCard({
  newRoomRequest,
  onNewRoomRequest,
  updateStatus,
}: NewRoomCardProps) {
  const email = localStorage.getItem("userEmail");
  const [, setUserTag] = useState<Tag[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [isPrivate, setPrivate] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [addedMember, setAddMember] = useState<Tag[]>([]);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (updateStatus === 0) return;
    (async function () {
      await socket.emit("get user tags", email);
    })();
  }, [email, updateStatus]);

  useEffect(() => {
    if (newRoomRequest === false) initVars();

    (async function () {
      await socket.emit("get user tags", email);
    })();
    socket.on("user tags", (data: Tag[]) => {
      setUserTag(data);
    });

    return () => {
      socket.off("user tags");
    };
  }, [newRoomRequest]);

  const onAddMember = (member: Tag) => {
    const members = addedMember.concat(member);
    setAddMember(members);
  };

  const onDeleteMember = (i: number) => {
    const members = addedMember.slice(0);
    members.splice(i, 1);
    setAddMember(members);
  };

  const suggestionsFilter = (searching: string, suggestions: Tag[]) => {
    return matchSorter(suggestions, searching, { keys: ["name"] });
  };

  const handleString = (value: string, setValue: (value: string) => void) => {
    setValue(value);
  };

  const handlePrivate = () => {
    setPrivate((old) => {
      return !old;
    });
  };

  const handleIsPassword = () => {
    setIsPassword((old) => {
      return !old;
    });
  };

  const onCreate = async () => {
    let mode = "PUBLIC";
    if (isPrivate) mode = "PRIVATE";
    else if (isPassword) mode = "PROTECTED";

    const data: newChannel = {
      name: roomName,
      private: isPrivate,
      password: roomPass,
      login: email,
      mode: mode,
    };
    (async function () {
      await socket.emit("create", data);
    })();
    socket.on("error", () => {
      console.log("chat create error");
    });
    initVars();
    onNewRoomRequest();
    (async function () {
      await socket.emit("get search suggest", { login: email });
    })();
  };
  const initVars = () => {
    setRoomName("");
    setAddMember([]);
    setPrivate(false);
    setIsPassword(false);
    setRoomPass("");
  };

  const autoScroll = () => {
    setTimeout(() => {
      if (scroll.current)
        scroll.current.scrollTop = scroll.current.scrollHeight;
    }, 30);
  };

  return (
    <div className="card-chat">
      <div className="card-chat-title">CREATE ROOM</div>
      <div className="input-zone">
        <input
          id="create-room-name"
          value={roomName}
          onChange={(e) => handleString(e.target.value, setRoomName)}
          className="new-room-name-input"
          placeholder="NAME"
        />
      </div>
      <div className="div-switch">
        <label style={{ color: isPrivate ? "rgb(0,136,0)" : "grey" }}>
          private
        </label>
        <Switch
          className="switch"
          onChange={handlePrivate}
          checked={isPrivate}
          checkedIcon={false}
          uncheckedIcon={false}
        />
      </div>
      {isPrivate || (
        <div className="div-switch">
          <label style={{ color: isPassword ? "rgb(0,136,0)" : "grey" }}>
            password
          </label>
          <Switch
            className="switch"
            onChange={handleIsPassword}
            checked={isPassword}
            checkedIcon={false}
            uncheckedIcon={false}
          />
        </div>
      )}
      {isPrivate ||
        (isPassword && (
          <div>
            <input
              type="password"
              value={roomPass}
              onChange={(e) => handleString(e.target.value, setRoomPass)}
              className="password"
            />
          </div>
        ))}
      <div className="flex-block"></div>
      <div onMouseUp={onCreate} className="card-confirm-button">
        CONFIRM
      </div>
    </div>
  );
}
