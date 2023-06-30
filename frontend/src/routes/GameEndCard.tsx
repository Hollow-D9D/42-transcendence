import "./chat_modes/card.css";
import { useEffect, useState } from "react";
import { socket } from "../App";
import { useNavigate } from "react-router-dom";

export function GameEndCard(props: any) {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(true);

  const endGame = async () => {
    props.handleClick();
    setShowCard(false);
  };

  if (!showCard) {
    return null;
  }

  return (
    <>
      <div className="card-chat">
        <div className="card-chat-title">GAME END</div>
        <div className="flex-block" />
        <div style={{ flex: "6" }}>
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
