import React from 'react'
import { useNavigate } from 'react-router-dom';
import Oval from './OvalShaped';
import Square from './SquareShaped';

export const SPAchievements: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/AchievementShowMore");
    };
    return (
        <div>
            <h1 style={{
                display: 'flex',
                left: "80px",
                top: "60px",
                position: "relative",
                fontFamily: "Figma Hand",
                color: "#ccc",
                fontSize: "21px",
                lineHeight: "150%",
                textAlign: "justify",
                fontStyle: "normal",
                fontWeight: 400,
                zIndex: 66,
            }}>Achievements</h1>
            <div
                style={{
                    backgroundColor: "#ccc",
                    borderRadius: "2%",
                    position: "relative",
                    width: "250px",
                    height: "400px",
                    left: "20px",
                    top: "60.73px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center", 
                    alignItems: "center"
                }}

            >
                <div>
                    {[...Array(2)].map((_, i) => (
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
                                width="247px"
                                height="150px"
                                borderRadius="30%/35%"
                                border="1.5px dashed red"
                                color="#B12D2D"
                                marginBottom="10px"
                                marginBlockStart="10px"
                                marginLeft="0px"
                            >
                                <Square
                                    position="relative"
                                    width="80px"
                                    height="80px"
                                    borderRadius="10%"
                                    border="1.5px solid #A4A4A4"
                                    color="#ccc"
                                    marginLeft="130px"
                                    marginBlockStart="30px"
                                />
                            </Oval>
                        </div>
                    ))}
                </div>
                <button
                    style={{
                        marginBlockStart: "17px",

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
        </div >
    )
}
