import React from "react";
import ProfileButton from "./ProfileButton";
import { useNavigate } from "react-router-dom";
import SettingPage from "./SettingPage";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  
  const handler = () => {
    navigate("/home");
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(132, 0, 0, 0.9)",
        height: "100vh",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          // padding: "300px",
          position: "absolute",
          // top: "0",
          left: "10",
          right: "10",
          // bottom: "10",
          // backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          display: "flex",
          // textAlign: "center",
          // justifyContent: "center",
          fontSize: "15px",
          fontWeight: "bold",
          zIndex: "1",
        }}
      >
        <button
          style={{
            position: 'fixed',
            backgroundImage: "white",
            color: 'red',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            // backgroundColor: "blue",
            // border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            // top: '1rem',
            // right: '1rem',
            // top: "10px",
            // right: "100px",
            outline: 'none',
            transform: 'translate(10%, 0%)',
            // transform: "translate(280%,-80%)",
            // zIndex: 9999,
          }} >Let's Play!</button>
      </div>

      <div
      // style={{
      //   width: "20px",
      //   height: "250px",
      //   position: "absolute",

      //   // position: "relative",
      //   padding: "100px",
      //   zIndex: "1",
      // }}
      >
        <ProfileButton
          size={100}>...</ProfileButton>
      </div>
    </div>
  );
};

export default Profile;
