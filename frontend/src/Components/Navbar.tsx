import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MLogoutValid } from "../modals/MLogoutValid";
import "./Navbar.css";
import { Api } from "../Config/Api";

const GetIcons = (props: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalShow, setModalShow] = useState(false);

  
  const url = props.url;
  const fill =
    url === "private-profile"
      ? "person-badge"
      : url === "leaderboard"
      ? "trophy"
      : url === "chat"
      ? "chat-dots"
      : url === "game"
      ? "dice-6"
      : // : url === "watch"
        // ? "play-btn"
        "box-arrow-right"; 

  return (
    <main>
      <MLogoutValid
        show={modalShow}
        onHide={() => setModalShow(false)}
        onSubmit={async () => {
          console.log("logging otu");
          try {
            await Api.get(`/auth/logout`, {
              headers: {
                "Content-Type": "application/json",
              },
            });
          } catch (err) {
            console.log(err);
          }
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
            <GetIcons url="chat" />
            <GetIcons url="game" />
            <GetIcons url="leaderboard" />
            <GetIcons url="logout" />
          </div>
        </div>
      </div>
    </main>
  );
};
