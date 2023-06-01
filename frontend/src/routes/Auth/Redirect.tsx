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
      console.log("redirect:::::::::::::::", code, state);

      // Send the code and state to the backend
      if (code && state) {
        try {
          const res = await axios.get(`http://localhost:3001/auth?code=${code}&state=${state}`, {
            headers: {
              // Add your headers here
              // Authorization: "Bearer YOUR_ACCESS_TOKEN",
              "Content-Type": "application/json",
            },
          });
          
          const token = (res.data.body.token) ? res.data.body.token : null;
          console.log(res);
          
          if (token) {
            console.log();
            
            const profile = await axios.get(`http://localhost:3001/profile`, {
              headers : {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            });
            console.log("profile", profile);
            console.log('logiiiiiiin::::::::', profile.data.body.user.profpic_url)
            localStorage.setItem("userToken", token);
            // localStorage.setItem("userEmail", profile.data.body.user.login);
            // localStorage.setItem("userName", profile.data.body.user.full_name);
            // localStorage.setItem("userName", profile.data.body.user.full_name);
            // localStorage.setItem("userEmail", profile.data.user.login);

            storeUserInfo(profile.data.body.user);
            
            if (res) {
              localStorage.setItem("userLogged", "true");
              navigate("/app/private-profile");
            }
          }
            
          
          // Handle the response from the backend if needed
        } catch (error) {
          // Handle any error that occurred during the request
          console.log("I am here:::::::::", error);
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

