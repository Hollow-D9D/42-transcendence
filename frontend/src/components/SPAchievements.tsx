import React from 'react'
import { useNavigate } from 'react-router-dom';

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
                top: "120px",
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
                    top: "120.73px",
                    display: "flex",
                    flexDirection: "column",
                    // justifyContent: "center", 
                    alignItems: "center"
                }}

            >
                <div style={{

                    width: "247px",
                    height: "150px",
                    borderRadius: "30%/35%",
                    border: "1.5px dashed red",
                    color: "#B12D2D",
                    marginBottom: "10px",
                    marginBlockStart: "10px",
                    // backgroundImage: "radial-gradient(circle at center, , #ff00f0)",
                    left: "100px",
                    top: "40.55px",


                }}>
                    <div style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "10%",
                        border: "1.5px dashed red",
                        color: "#ccc",
                        // marginBottom: "20px",
                        // backgroundImage: "radial-gradient(circle at center, , #ff00f0)",
                        left: "140px",
                        top: "30.55px",
                    }}>

                    </div>
                    <div
                        style={{
                            position: "relative",
                            fontFamily: 'Inter',
                            fontStyle: "normal",
                            fontWeight: 900,
                            fontSize: "24px",
                            textAlign: "left",
                            lineHeight: "0%",
                            letterSpacing: "-0.019em",
                        }}
                    >
                        A.Name
                    </div>
                </div>


                <div style={{
                    width: "247px",
                    height: "150px",
                    borderRadius: "30%/35%",
                    border: "1.5px dashed red",
                    color: "#B12D2D",
                    top: "800px",
                    // backgroundImage: "radial-gradient(circle at center, , #ff00f0)",
                }}>
                    <div style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "10%",
                        border: "1.5px dashed red",
                        color: "#ccc",
                        // marginBottom: "20px",
                        // backgroundImage: "radial-gradient(circle at center, , #ff00f0)",
                        left: "140px",
                        top: "30.55px",
                    }}>

                    </div>
                    <div
                        style={{
                            position: "relative",
                            fontFamily: 'Inter',
                            fontStyle: "normal",
                            fontWeight: 900,
                            fontSize: "24px",
                            textAlign: "left",
                            lineHeight: "0%",
                            letterSpacing: "-0.019em",
                        }}
                    >
                        A.Name
                    </div>
                </div>
                <button
                    style={{
                        marginBlockStart: "30px",
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
