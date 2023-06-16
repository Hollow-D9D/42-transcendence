import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../globals/contexts";
import { MLogoutValid } from "../modals/MLogoutValid";
import "./Navbar.css";
import axios from "axios";


const GetIcons = (props: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  let auth = useAuth();
  const [modalShow, setModalShow] = useState(false);

  // Determine the icon to display based on the URL
  const url = props.url;
  const fill =
    url === "private-profile"
      ? "person"
      : url === "leaderboard"
      ? "trophy"
      : url === "chat"
      ? "chat-left-dots"
      : url === "game"
      ? "dpad"
      // : url === "watch"
      // ? "play-btn"
      : "box-arrow-right"; // Determine the icon to display based on the URL

  return (
    <main>
      <MLogoutValid
        show={modalShow}
        onHide={() => setModalShow(false)}
        onSubmit={async() => {
          console.log("logging otu");
          try{
            const res = await axios.get(`http://localhost:3001/logout`, {
            headers: {
              // Add your headers here
              'authorization': `Bearer ${localStorage.getItem('userToken')}`,
              "Content-Type": "application/json",
            },
          });
          }
          catch(err){ console.log(err)}
          setModalShow(false);
          localStorage.clear();
          navigate("/auth/signin");
        }}
      />
      <div>
        <i
          id="clickableIcon"
          className={`bi bi-${fill} icons thick ${
            location.pathname === "/app/" + url ? "hide" : "current"
          }`}
          onClick={
            url === "logout"
              ? () => setModalShow(true)
              : () => navigate("/app/" + url)
          }
        />
        <i
          id="clickableIcon"
          className={`bi bi-${fill}-fill icons thin ${
            location.pathname === "/app/" + url ? "current" : "hide"
          }`}
          onClick={() => navigate("/app/" + url)}
        />
      </div>
    </main>
  );
};

export const CNavBar = () => {
  return (
    <main>
      <div className="toolbar-bigger">
        <div className="toolbar">
          <div className="toolbar-top space-around">
            <GetIcons url="private-profile" />
            <GetIcons url="leaderboard" />
            <GetIcons url="chat" />
            <GetIcons url="game" />
            {/* <GetIcons url="watch" /> */}
            <GetIcons url="logout" />
          </div>
        </div>
      </div>
    </main>
  );
};
