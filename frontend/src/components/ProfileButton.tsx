import { type } from 'os';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
    children: string;
    // onClick: () => void;
    size: number;
}

const ProfileButton: React.FC<Props> = ({ size }) => {
    const navigate = useNavigate();

    const onClick = () => {
        navigate("/SettingPage");
    };

    return (
        <button style={{
            position: 'fixed',
            width: size,
            height: size,
            backgroundImage: "url('data:image/jpeg;base64,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')",
            borderRadius: '50%',
            color: 'red',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            // backgroundColor: "blue",
            // border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            top: '1rem',
            right: '1rem',
            // top: "10px",
            // right: "100px",
            outline: 'none',
            transform: 'translate(0%, 0%)',
            // transform: "translate(280%,-80%)",
            zIndex: 9999,
        }}
            onClick={onClick}>
            User Profile
        </button>
    );
};

export default ProfileButton;
