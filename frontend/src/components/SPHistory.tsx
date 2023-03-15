import React from 'react'
import { useNavigate } from 'react-router-dom';
import Oval from './OvalShaped';
import Square from './SquareShaped';

export const SPHistory: React.FC = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/HistoryShowMore");
    };
    return (
        <div>
            <h1 style={{
                display: 'flex',
                left: "520px",
                top: "-550px",
                position: "relative",
                fontFamily: "Figma Hand",
                color: "#ccc",
                fontSize: "21px",
                lineHeight: "150%",
                textAlign: "justify",
                fontStyle: "normal",
                fontWeight: 400,
            }}>History</h1>
            <div
                style={{
                    backgroundColor: "#ccc",
                    borderRadius: "2%",
                    position: "relative",
                    width: "400px",
                    height: "500px",
                    left: "350px",
                    top: "-550px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center", 
                    alignItems: "center"
                }}
            >

                <div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <div
                                style={{
                                    position: "relative",
                                    fontFamily: 'Inter',
                                    fontStyle: "normal",
                                    color: "#B12D2D",
                                    fontWeight: 900,
                                    fontSize: "24px",
                                    textAlign: "left",
                                    lineHeight: "0%",
                                    letterSpacing: "-0.019em",
                                    left: "10px",
                                    top: "80px",
                                }}
                            >
                                A.Name
                            </div>
                            <Oval
                                width="395px"
                                height="130px"
                                borderRadius="30%/35%"
                                border="1.5px dashed red"
                                color="#B12D2D"
                                marginBottom="10px"
                                marginBlockStart="10px"
                                marginLeft="0px"
                            >
                                <Square
                                    position="relative"
                                    width="120px"
                                    height="60px"
                                    borderRadius="10%"
                                    border="1.5px solid #A4A4A4"
                                    color="#ccc"
                                    marginLeft="220px"
                                    marginBlockStart="35px"
                                />
                            </Oval>
                        </div>
                    ))}
                </div>

                <button
                    style={{
                        marginBlockStart: "12px",
                        marginBlockEnd: "15px",
                        fontSize: "14px",
                        border: "#ccc",
                        // backgroundColor: "white",
                        color: "#B12D2D",
                        padding: "0px 0px",
                        cursor: "pointer",
                        // borderRadius: "20px",
                    }}
                    onClick={handleClick}>

                    Show more
                </button>
            </div>
        </div>
    )
}
