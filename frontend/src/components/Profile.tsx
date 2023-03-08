import React from "react";
import ProfileButton from "./ProfileButton";
import { useNavigate } from "react-router-dom";
import SettingPage from "./SettingPage";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handler = () => {
    navigate("/home");
  };

  const handleClick = () => {
    navigate("/PongGame");
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        width: "100%",
        background: "url(/letsPlayPage.png)",
        backgroundColor: "rgba(132, 0, 0, 0.9)",
        height: "100vh",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
      }}
    >
      <button
        style={{
          position: 'fixed',
          backgroundColor: "rgba(132, 0, 0, 0.1)",
          color: 'white',
          cursor: 'pointer',
          border: "none",
          fontSize: "32px",
          top: "580px",
          left: "400px",
          // zIndex: 9999,
        }} 
        onClick={handleClick}
        >
          Let's Play!
        </button>
      <ProfileButton
        size={100}>...</ProfileButton>
    </div>
  );
};

export default Profile;
