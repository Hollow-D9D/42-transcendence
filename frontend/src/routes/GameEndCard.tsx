import "./chat_modes/card.css";
import { useEffect, useState } from "react";
import { socket } from "../App";
import { useNavigate } from "react-router-dom";

export function GameEndCard(props: any) {
  const navigate = useNavigate();
  const [avatarURL, setAvatarURL] = useState("");
  const [showCard, setShowCard] = useState(true); // State to manage the visibility of the card

  const endGame = async () => {
    props.handleClick();
    setShowCard(false); // Set showCard to false to hide the card
  };

  if (!showCard) {
    return null; // If showCard is false, don't render the card at all
  }

  return (
    <>
      <div className="card-chat">
        <div className="card-chat-title">GAME END</div>
        <div className="flex-block" />
        <div style={{ flex: "6" }}>
          {/* <div
            className="challenger-avatar"
            style={{
              backgroundImage: `url("${props.avatarURL}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          /> */}
          {/* <div className="text">{game?.inviterName}</div> */}
          {props.winner ? (
            <div className="text">You Win</div>
          ) : (
            <div className="text">You Lose</div>
          )}
        </div>
        <div className="button-container">
          <div className="join-button" onClick={endGame}>
            Okay
          </div>
        </div>
      </div>
    </>
  );
}
