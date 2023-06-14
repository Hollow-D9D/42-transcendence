import { authHeader } from "./headers";
import axios from "axios";
process.env.REACT_APP_BACKEND_URL = "http://localhost:3001";

export const getUserBlocked = async() => {
  try {
    const friends = await axios.get("http://localhost:3001/profile/friends", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      },
    })
    console.log(friends.data);
    
    return friends.data.blocked_users;
  } catch (err) {
    console.log(err);
    return "error";
    
  }
};

export const getUserPending = async () => {
  try {
    const friends = await axios.get("http://localhost:3001/profile/friends", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      },
    })
    return friends.data.friend_requests;
  } catch (err) {
    console.log(err);
    return "error";
    
  }
};

export const getUserData = () => {
  return fetchGet("me", storeUserInfo);
};

export const getAchievements = () => {
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

  localStorage.setItem("userPicture", result.profpic_url);
  localStorage.setItem("userName", result.full_name || "");
  localStorage.setItem("userEmail", result.login);
  if (result.nickname !== "") {
    localStorage.setItem("userNickname", result.nickname);
  }
  else {
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
