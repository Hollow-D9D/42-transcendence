import React, { useState } from 'react'
import { FaCamera } from "react-icons/fa";
import { NickUserName } from "./NickUserName";

export const ChangeProfileImage: React.FC = () => {
    const [avatar_image, setAvatar_image] = useState("");

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // const file = event.target.files?.[0];
        // if (file) {
        //     const reader = new FileReader();
        //     reader.onloadend = () => {
        //         setProfileImage(reader.result as string);
        //     };
        //     reader.readAsDataURL(file);
        // }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center"
            }}>
            {avatar_image ? (
                <img src={avatar_image} alt="Profile" style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
            ) : (
                <div>
                    <label htmlFor="profile-image-input">
                        <div
                            style={{
                                width: "200px",
                                height: "200px",
                                // left: "150px",
                                // top: "62px",
                                borderRadius: "50%",
                                backgroundColor: "#ccc",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                textAlign: "center",
                                transform: 'translate(20%, 30%)',
                            }}
                        >
                            <FaCamera size={60} color="#fff" />
                        </div>
                        <div style={{
                            cursor: "pointer",
                            transform: 'translate(10%, 700%)',
                            textAlign: "justify",
                            position: "absolute",
                            width: "336px",
                            height: "32px",
                            left: "26px",
                            top: "48.37px",
                            fontFamily: 'Figma Hand',
                            fontStyle: "normal",
                            fontWeight: 400,
                            fontSize: "21px",
                            lineHeight: "150%",
                            color: "#E6E6E6",
                        }} >
                            Change profile image
                        </div>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        id="profile-image-input"
                        onChange={handleProfileImageChange}
                        style={{ display: "none" }}
                    />
                </div>
            )
            }
            <NickUserName />
        </div >
    )
}
