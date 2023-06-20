import { Api } from "../Config/Api";
import { authHeader } from "./headers";
// process.env.REACT_APP_BACKEND_URL = "http://localhost:3001";

export const getUserBlocked = async () => {
  try {
    const friends = await Api.get("/profile/friends", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return friends.data.blocked_users;
  } catch (err) {
    console.log(err);
    return "error";
  }
};

export const getUserPending = async () => {
  try {
    const friends = await Api.get("/profile/friends", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return friends.data.friend_requests;
  } catch (err) {
    console.log(err);
    return "error";
  }
};

export const getUserData = () => {
  return fetchGet("me", storeUserInfo);
};

export const getAchievements = async () => {
  try {
    const achieves = await Api.get("/profile/getAchievements", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return achieves.data.body.achievements;
  } catch (err) {
    console.log(err);
    return "error";
  }
};

const fetchGet = async (url: string, callback: any) => {
  let fetchUrl = process.env.REACT_APP_BACKEND_URL + "/profile";
  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: authHeader(),
      body: null,
      redirect: "follow",
    });
    const result_1 = await response.json();
    if (!response.ok) {
      return "error";
    }
    return callback(result_1);
  } catch (error) {
    return console.log("error", error);
  }
};

export const storeUserInfo = (result: any) => {
  localStorage.setItem("userPicture", result.profpic_url);
  localStorage.setItem("userName", result.full_name || "");
  localStorage.setItem("userEmail", result.login);
  if (result.nickname !== "") {
    localStorage.setItem("userNickname", result.nickname);
  } else {
    localStorage.setItem("userNickname", result.login);
  }
  localStorage.setItem("userGamesWon", result.gamesWon);
  localStorage.setItem("userGamesLost", result.gamesLost);
  localStorage.setItem("userGamesPlayed", result.gamesPlayed);
  localStorage.setItem("userAuth", result.is2fa);
};

export const storeFriendsInfo = (result: any) => {
  return result;
};

export const storeLeaderBoardInfo = (result: any) => {
  return result;
};
