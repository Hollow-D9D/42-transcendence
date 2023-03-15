import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



const AccountPage: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAuthorize = () => {
    setIsAuthorized(true);
    navigate("/profile");
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
