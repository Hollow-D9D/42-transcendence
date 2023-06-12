import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { storeUserInfo } from "../../queries/userQueries"

export default function AuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      // Send the code and state to the backend
      if (code && state) {
        try {
          const res = await axios.get(`http://localhost:3001/auth?code=${code}&state=${state}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          const token = (res.data.body.token) ? res.data.body.token : null;
          if (token) {
            const profile = await axios.get(`http://localhost:3001/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            });
            localStorage.setItem("userToken", token);
            storeUserInfo(profile.data.body.user);
            if (res) {
              localStorage.setItem("userLogged", "true");
              navigate("/app/private-profile");
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [location, navigate]);

  return (
    <div>
      <h3 className="Auth-form-title">Loading...</h3>
      <div className="text-secondary"></div>
    </div>
  );
}

