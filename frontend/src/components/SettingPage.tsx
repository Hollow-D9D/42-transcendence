import React, { useState } from "react";
import { ChangeProfileImage } from "./ChangeProfileImage";
import { SPAchievements } from "./SPAchievements";
import { SPHistory } from "./SPHistory";

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
    const [updatedSettings, setUpdatedSettings] = useState<boolean>(false);


    const handleSave = () => {
        // onSave(updatedSettings);
    };

    const handleSettingChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        // const newSettings = [...updatedSettings];
        // newSettings[index].value = event.target.value;
        // setUpdatedSettings(newSettings);
        setUpdatedSettings(true);
    };

    return (
        <div
            style={{
                position: "absolute",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                display: 'flex',
                padding: '0 20px',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: "border-box",
                left: 0,
                right: 0,
                top: 0,
                height: "200vh",
                background: "#B12D2D",
            }}>
            <ChangeProfileImage />
            <SPAchievements />
            <SPHistory />

            {/* {updatedSettings.map((setting, index) => (
                <div key={setting.name}>
                    <label 
                    htmlFor={setting.name}>{setting.name}:</label>
                    <input
                        type="text"
                        id={setting.name}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(index, e)}
                    />
                </div>
            ))} */}
            {/* {updatedSettings.map((setting, index) => (
                <div key={index}> */}
            <label>
                {/* {setting.name}
                        <input type="text" ></input>
                        value={setting.value} onChange={(event) => handleSettingChange(index, event)} /> */}
            </label>
            {/* </div>))} */}
            <button
                style={{ fontSize: "30px" }}
                onClick={handleSave}>
                Save
            </button>
        </div >
    );
};

export default SettingPage;
