import { authHeader } from "./headers";

process.env.REACT_APP_BACKEND_URL = "http://localhost:3001";

export const getUserBlocked = () => {
  return fetchGet("get_blocked", storeFriendsInfo);
};

export const getUserPending = () => {
  return fetchGet("get_pending", storeFriendsInfo);
};

export const getUserData = () => {
  return fetchGet("me", storeUserInfo);
};

export const getLeaderBoard = () => {
  return fetchGet("get_leaderboard", storeLeaderBoardInfo);
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
  // localStorage.setItem("userID", result.id);
  // localStorage.setItem("userToken", result.userToken);
  localStorage.setItem("userName", result.full_name || "");
  localStorage.setItem("userNickname", result.nickname || result.login);
  localStorage.setItem("userEmail", result.login);
  localStorage.setItem("userPicture", result.profpic_url);
  localStorage.setItem("userGamesWon", result.gamesWon);
  localStorage.setItem("userGamesLost", result.gamesLost);
  localStorage.setItem("userGamesPlayed", result.gamesPlayed);
  localStorage.setItem("userAuth", result.twoFA);
};

export const storeFriendsInfo = (result: any) => {
  return result;
};

export const storeLeaderBoardInfo = (result: any) => {
  return result;
};
