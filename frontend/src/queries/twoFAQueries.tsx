import { Navigate, useNavigate } from "react-router";
import { Api } from "../Config/Api";
import { storeToken } from "./authQueries";
import { getUserData } from "./userQueries";

/* Generate 2FA QR code */
export const twoFAGenerate = async () => {
  try {
    const response = await Api.get("/auth/two-factor", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      }
    });
    return response.data.body.qrCode;
  } catch (err) {
    console.log(err);
  }

  return fetchPost(null, "generate", null);
};

/* Validate 2FA code when signin in  */
export const twoFAAuth = async (twoFAcode: string, userSignIn: any) => {
  const response = await Api.get(`auth/two-factor/verify?token=${twoFAcode}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return response;
};

/* Turn on 2FA for signed in user */
export const twoFAOn = async (code: string) => {
  try {
    const response = await Api.get(`/auth/two-factor/enable?token=${code}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const twoFAOff = async () => {
  try {
    const response = await Api.get(`/auth/two-factor/remove`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};

const authRawHeader = () => {
  let token = "Bearer " + localStorage.getItem("userToken");
  let myHeaders = new Headers();
  myHeaders.append("Authorization", token);
  myHeaders.append("Content-Type", "application/json");
  return myHeaders;
};

const fetchPost = async (body: any, url: string, userSignIn: any) => {
  let fetchUrl = process.env.REACT_APP_BACKEND_SOCKET + "/auth/2fa/" + url;

  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: authRawHeader(),
      body: body,
      redirect: "follow",
    });
    const result_1 = await response.json();
    if (!response.ok) {
      return null;
    }
    if (url !== "generate") {
      storeToken(result_1);
      if (url === "authenticate") {
        if (localStorage.getItem("userToken")) {
          await getUserData();
          if (localStorage.getItem("userName")) userSignIn();
          else return null;
        }
      }
    }
    return result_1;
  } catch (error) {
    return console.log("error", error);
  }
};
