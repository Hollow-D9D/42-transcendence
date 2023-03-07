import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AccountPage: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  const handleAuthorize = () => {
    setIsAuthorized(true);
    navigate("/profile");
    console.log(222)
  };

  return (
    <div>
      {isAuthorized && (
        <button onClick={() => handleAuthorize()}>Authorize</button>
      )}
    </div>
  );
};

export default AccountPage;
