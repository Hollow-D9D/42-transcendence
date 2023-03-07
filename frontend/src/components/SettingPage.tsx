import React, { useState } from "react";
import { FaCamera } from "react-icons/fa";

type Setting = {
    name: string;
    value: string;
};

type SettingProps = {
    settings: Setting[];
    onSave: (settings: Setting[]) => void;
};

const SettingPage: React.FC = ({ }) => {
    //   const [updatedSettings, setUpdatedSettings] = useState(settings);
    const [updatedSettings, setUpdatedSettings] = useState(false);
    const [profileImage, setProfileImage] = useState("");


    const handleSave = () => {
        // onSave(updatedSettings);
    };

    const handleSettingChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        // const newSettings = [...updatedSettings];
        // newSettings[index].value = event.target.value;
        // setUpdatedSettings(newSettings);
        setUpdatedSettings(true);
    };

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
                backgroundColor: "rgba(132, 0, 0, 0.9)",
                height: "100vh",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                display: 'flex',
                padding: '0 20px',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
            <h1>Settings</h1>
            <div
                style={{
                    display: "flex",
                    alignItems: "center"
                }}>
                {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
                ) : (
                    <div
                        style={{ marginLeft: "20px" }}>
                        <label htmlFor="profile-image-input">
                            <div
                                style={{
                                    width: "150px",
                                    height: "150px",
                                    borderRadius: "50%",
                                    backgroundColor: "#ccc",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <FaCamera size={50} color="#fff" />
                            </div>
                            <span
                                style={{
                                    marginLeft: "10px",
                                    fontSize: "16px"
                                }}>
                                Change profile image
                            </span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id="profile-image-input"
                            onChange={handleProfileImageChange}
                            style={{ display: "none" }}
                        />
                    </div>
                )}

            </div>
            {/* {updatedSettings.map((setting, index) => ( */}
            {/* <div key={index}> */}
            <label>
                {/* {setting.name} */}
                <input type="text" ></input>
                {/* value={setting.value} onChange={(event) => handleSettingChange(index, event)} /> */}
            </label>
            {/* </div> */}
            {/* )) */}
            {/* } */}
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default SettingPage;
