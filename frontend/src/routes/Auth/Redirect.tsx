import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storeUserInfo } from "../../queries/userQueries";
import { Api, addAuthHeader } from "../../Config/Api";

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
          const res = await Api.get(`/auth?code=${code}&state=${state}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log(res);

          const token = res.data.body.token ? res.data.body.token : null;
          if (token) {
            const profile = await Api.get(`/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            addAuthHeader(token);
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
