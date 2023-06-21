import { useCallback, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../globals/contexts";
import { getUserData } from "../../queries/userQueries";
import "./Auth.css";
import { NotifCxt } from "../../App";
import { addAuthHeader } from "../../Config/Api";

export default function Auth() {
  const notif = useContext(NotifCxt);
  let navigate = useNavigate();
  let auth = useAuth();
  let location = useLocation();
  const hrefURL =
    "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-9bf87a7dc6727592572c086dcb74d50c619a0e3065ade141ccb0b92282caaf07&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fredirect&response_type=code&state=absjhasagsgsajg";

  // Use a callback to avoid re-rendering
  const userSignIn = useCallback(() => {
    let username = localStorage.getItem("userName");
    if (username)
      auth.signin(username, () => {
        navigate("/app/private-profile", { replace: true });
        window.location.reload();
      });
  }, [navigate, auth]);

  // useEffect to get access token from URL
  useEffect(() => {
    // get access token from URL Query
    const access_token = location.search.split("=")[1];
    if (access_token) {
      addAuthHeader(access_token);
      localStorage.setItem("userToken", access_token);
      // getUserData is a fetch that might take time. In order for sign in
      // to operate after the function, it needs to use await, asyn and .then
      // keywords. Otherwise, things might happen in the wrong order.
      const fetchData = async () => {
        const data = await getUserData();
        if (data === "error") {
          notif?.setNotifText(
            "Unable to retrieve your informations. Please try again later!"
          );
        } else {
          // await getLeaderBoard();
          userSignIn();
          notif?.setNotifText(
            "Welcome " + localStorage.getItem("userName") + "!"
          );
        }
        notif?.setNotifShow(true);
      };
      // sign in the user
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div className="Auth-form-container">
      <form className="Auth-form">
        <div className="Auth-form-content">
          <Outlet />
          <Button
            variant="secondary"
            className="submit-button"
            size="sm"
            href={hrefURL}
          >
            Sign in with 42
          </Button>
        </div>
      </form>
    </div>
  );
}
