import React, { useState } from 'react'

export const NickUserName: React.FC = () => {
    const [nickname, setNickname] = useState("John Doe");
    const [username, setusername] = useState("");
    
    return (
        <div>
            <div
                style={{
                    position: "absolute",
                    transform: "translate(-0%, -50%)",
                    width: "600px",
                    height: "36px",
                    left: "300px",
                    top: "120px",
                    fontFamily: 'Figma Hand',
                    fontStyle: "normal",
                    fontWeight: 80,
                    fontSize: "24px",
                    lineHeight: "150%",
                    color: "#ccc",
                }}
            >
                <label htmlFor="nickname">Nick Name: </label>
                <input

                    style={{
                        fontSize: "16px",
                        backgroundColor: "#ccc",
                    }}
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
            </div>
            <div
                style={{
                    // fontSize: "20px",
                    // transform: 'translate(-80%, 270%)',
                    position: "absolute",
                    width: "600px",
                    height: "36px",
                    left: "300px",
                    top: "160px",
                    fontFamily: 'Figma Hand',
                    fontStyle: "normal",
                    fontWeight: 80,
                    fontSize: "24px",
                    lineHeight: "150%",
                    color: "#ccc",

                }}>
                <label htmlFor="username">User Name: </label>
                <input
                    style={{
                        fontSize: "16px",
                        backgroundColor: "#ccc",
                    }}
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setusername(e.target.value)}
                />
            </div>
        </div>
    )
}
