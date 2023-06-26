import "./card.css";
import "./tags.css";
import { useEffect, useState } from "react";
import { socket } from "../../App";
import { setting, updateChannel } from "./type/chat.type";
import Switch from "react-switch";

export function SettingCard({
  channelId,
  settingRequest,
  onSettingRequest,
}: {
  channelId: number | undefined;
  settingRequest: boolean;
  onSettingRequest: () => void;
}) {
  const email = localStorage.getItem("userEmail");
  const [newPass, setNewPass] = useState("");
  const [isPrivate, setPrivate] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [current, setCurrent] = useState<setting | undefined>(undefined);

  useEffect(() => {
    socket.on("setting info", (data: setting) => {
      setCurrent(data);
      initVars(data);
    });

    if (settingRequest === false && current) initVars(current);

    return () => {
      socket.off("setting info");
    };
  }, [settingRequest, current]);

  const handleString = (value: string, setValue: (value: string) => void) => {
    setValue(value);
  };

  const handlePrivate = () => {
    setIsPassword(false);
    setNewPass("");
    setPrivate((old) => {
      return !old;
    });
  };

  const handleIsPassword = () => {
    setIsPassword((old) => {
      return !old;
    });
  };

  const onUpdate = () => {
    let mode = "PUBLIC";
    if (isPrivate) mode = "PRIVATE";
    else if (isPassword) mode = "PROTECTED";

    let data: updateChannel = {
      chat_id: channelId,
      login: email,
      password: "",
      target: 0,
      private: isPrivate,
      isPassword: isPassword,
      newPassword: newPass,
      dm: false,
    };
    socket.emit("update setting", data);
    socket.emit("get setting");
    // socket.emit("get search suggest", { login: email });
    onSettingRequest();
  };

  const initVars = (data: setting) => {
    setPrivate(data.private);
    setIsPassword(data.isPassword);
    setNewPass("");
  };

  return (
    <div className="card-chat">
      <div className="card-chat-title">CHANNEL SETTING</div>
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
      <div style={{ display: isPassword ? "" : "none" }}>
        <input
          value={newPass}
          type="password"
          onChange={(e) => handleString(e.target.value, setNewPass)}
          className="password"
          placeholder="new channel password"
        />
      </div>

      <div className="flex-block" />
      <div onMouseUp={onUpdate} className="card-confirm-button">
        UPDATE
      </div>
    </div>
  );
}
