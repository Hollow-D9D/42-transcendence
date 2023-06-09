import { storeToken } from "./authQueries";
import { getUserData } from "./userQueries";
import axios from 'axios';

/* Generate 2FA QR code */
export const twoFAGenerate = async () => {
  try {
    const response = await axios.get("http://localhost:3001/auth/two-factor", {
      headers: {
        "authorization" : `Bearer ${ localStorage.getItem('userToken') }`
      }
    });
    console.log("we've got there", response.data);
    return response.data.body.qrCode;
  } catch (err) {
    console.log(err);
    
  }
  

  return fetchPost(null, "generate", null);
};

/* Validate 2FA code when signin in  */
export const twoFAAuth = (
  twoFAcode: string,
  email: string,
  userSignIn: any
) => {
  let raw = JSON.stringify({
    username: email,
    twoFAcode: twoFAcode,
  });
  return fetchPost(raw, "authenticate", userSignIn);
};

/* Turn on 2FA for signed in user */
export const twoFAOn = async (code: string) => {
  // let raw = JSON.stringify({
  //   twoFAcode: code,
  // });
  try {
    
    const response = await axios.get(`http://localhost:3001/auth/two-factor/enable?token=${code}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
        "Content-Type": "application/json"
      },
    })
    console.log(response);
    
    return response;
  } catch(err) {
    console.log(err);
  }
  // console.log("TURN ON");
  // return fetchPost(raw, "turn-on", null);
};

export const twoFAOff = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/auth/two-factor/remove`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
        "Content-Type": "application/json"
      },
    })
    console.log(response);
    
    return response;
  } catch(err) {
    console.log(err);
  }
};

const authRawHeader = () => {
  let token = "bearer " + localStorage.getItem("userToken");
  let myHeaders = new Headers();
  myHeaders.append("Authorization", token);
  myHeaders.append("Content-Type", "application/json");
  return myHeaders;
};

const fetchPost = async (body: any, url: string, userSignIn: any) => {
  let fetchUrl = process.env.REACT_APP_BACKEND_URL + "/auth/2fa/" + url;

  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: authRawHeader(),
      body: body,
      redirect: "follow",
    });
    const result_1 = await response.json();
    if (!response.ok) {
      console.log("POST error on ", url);
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
