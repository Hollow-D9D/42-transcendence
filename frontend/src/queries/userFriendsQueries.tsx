import { authContentHeader } from "./headers";
process.env.REACT_APP_BACKEND_URL = "http://localhost:3001";

// export const getUserFriends = (otherId: number) => {
//   let body = JSON.stringify({
//     otherId: otherId,
//   });
//   console.log("getUserFriends")
//   return fetchGet("friends", authContentHeader, body);
// };

export const getUserFriends = async () => {
  console.log("getUserFriends")

  try {
    const response = await fetch("http://localhost:3001/profile/friends", {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    console.log("result::::", result)
    if (!response.ok) {
      console.log("POST error on ");
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

// export const addFriendQuery = (otherId: number) => {
//   let body = JSON.stringify({
//     otherId: otherId,
//   });
//   return fetchGet("add_friend", authContentHeader, body);
// };

export const addFriendQuery = async (otherId: number) => {
  console.log("addFriendQuery")

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/request?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    // console.log("result::::", result)
    if (!response.ok) {
      console.log("POST error on ");
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const acceptFriendQuery = async (otherId: number) => {
  console.log("acceptFriendQuery")

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/accept?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    console.log("result::::", result)
    if (!response.ok) {
      console.log("POST error on ");
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

// export const removeFriendQuery = (otherId: number) => {
//   let body = JSON.stringify({
//     otherId: otherId,
//   });
//   return fetchGet("rm_friend", authContentHeader, body);
// };

export const removeFriendQuery = async (otherId: number) => {
  console.log("removeFriendQuery")

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/remove?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    console.log("result::::", result)
    if (!response.ok) {
      console.log("POST error on ");
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

export const blockUserQuery = (otherId: number) => {
  let body = JSON.stringify({
    otherId: otherId,
  });
  return fetchGet("block_user", authContentHeader, body);
};

export const unblockUserQuery = (otherId: number) => {
  let body = JSON.stringify({
    otherId: otherId,
  });
  return fetchGet("unblock_user", authContentHeader, body);
};

export const cancelInviteQuery = (otherId: number) => {
  let body = JSON.stringify({
    otherId: otherId,
  });
  return fetchGet("cancel_invite", authContentHeader, body);
};

// export const denyInviteQuery = (otherId: number) => {
//   let body = JSON.stringify({
//     otherId: otherId,
//   });
//   return fetchGet("deny_invite", authContentHeader, body);
// };

export const denyInviteQuery = async(otherId: number) => {
  console.log("denyInviteQuery")

  try {
    const response = await fetch(`http://localhost:3001/profile/friends/decline?friend_id=${otherId}`, {
      method: "GET",
      headers: authContentHeader(),
      redirect: "follow",
    });
    const result = await response.json();
    console.log("result::::", result)
    if (!response.ok) {
      console.log("POST error on ");
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

const fetchGet = async (url: string, header: any, body: any) => {
  let fetchUrl = "http://localhost:3001/profile/friends";

  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: header(),
      // body: body,
      redirect: "follow",
    });
    const result = await response.json();
    console.log("result::::", result)
    // if (!response.ok) {
    //   console.log("POST error on ", url);
    //   return "error";
    // }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};
