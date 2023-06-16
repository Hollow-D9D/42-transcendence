import { authContentHeader } from "./headers";
process.env.REACT_APP_BACKEND_URL = "http://localhost:3001";

export const getUserFriends = async () => {

  try {
    const response = await fetch("http://localhost:3001/profile/friends", {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }

    return result.friends;
  } catch (error) {
    return console.log("error", error);
  }
};

export const getFriendFriends = async (username: string) => {

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/friends?login=${username}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }
    return result.friends;
  } catch (error) {
    return console.log("error", error);
  }
};

export const addFriendQuery = async (otherId: number) => {

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/request?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const acceptFriendQuery = async (otherId: number) => {

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/accept?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const removeFriendQuery = async (otherId: number) => {

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/remove?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const blockUserQuery = async (otherId: number) => {
  try {
    const response = await fetch(`http://localhost:3001/profile/friends/block?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
    });
    const result = await response.json();

    if (!response.ok) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const unblockUserQuery = async (otherId: number) => {
  try {
    const response = await fetch(`http://localhost:3001/profile/friends/unblock?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
    });
    const result = await response.json();
    if (result.error) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const denyInviteQuery = async (otherId: number) => {
  try {
    const response = await fetch(`http://localhost:3001/profile/friends/decline?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};
