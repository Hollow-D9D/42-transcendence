import { Api } from "../Config/Api";
import { authHeader } from "./headers";

// process.env.REACT_APP_BACKEND_URL = "http://localhost:3001";

export const updateAvatarQuery = (file: any) => {
  var formdata = new FormData();
  formdata.append("avatar", file.files[0], "avatar.jpeg");
  return fetchPost(formdata, "update_avatar", authHeader, file);
};

// export const updateUsernameQuery = (username: string) => {
//   var raw = JSON.stringify({
//     username: username,
//   });
//   return fetchPost(raw, "update_username", authContentHeader, username);
// };

// export const updateNicknameQuery = (nickname: string) => {
//   var raw = JSON.stringify({
//     nickname: nickname,
//   });
//   return fetchPost(raw, "editNickname", authContentHeader, nickname);
// };

export const updateNicknameQuery = async (nickname: string) => {
  try {
    const response = await Api.get(`/profile/editNickname`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        "Content-Type": "application/json",
      },
      params: {
        newdata: { nickname: nickname },
      },
    });
    if (!response.data.error) {
      localStorage.setItem("userNickname", nickname);
      return "success";
    }
    return "error";
  } catch (error) {
    return console.log("error", error);
  }
};

const fetchPost = async (
  bodyContent: any,
  url: string,
  header: any,
  data: string
) => {
  let fetchUrl = process.env.REACT_APP_BACKEND_URL + "/profile/" + url;

  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: header(),
      body: bodyContent,
      redirect: "follow",
    });
    await response.json();
    if (!response.ok) {
      console.log("POST error on ", url);
      return "error";
    }
    storeUserModif(url, data);
    return "success";
  } catch (error) {
    return console.log("error", error);
  }
};

const storeUserModif = (url: string, data: string) => {
  // if (url === "update_username") localStorage.setItem("userName", data);
  // if (url === "editNickname") localStorage.setItem("userNickname", data);
  if (url === "update_avatar") localStorage.setItem("userPicture", data);
};
