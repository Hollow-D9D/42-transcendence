import { authContentHeader } from "./headers";

export const getOtherUser = async (otherUsername: string) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_SOCKET}/profile/PublicProfile?login=${otherUsername}`,
      {
        method: "GET",
        headers: authContentHeader(),
        redirect: "follow",
      }
    );
    const result = await response.json();
    if (!response.ok) {
      return "error";
    }
    return result;
  } catch (error) {
    return console.log("error", error);
  }
};

const fetchGetOtherUser = async (url: string, body: any) => {
  let fetchUrl = process.env.REACT_APP_BACKEND_URL + "/users/" + url;
  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: authContentHeader(),
      body: body,
      redirect: "follow",
    });
    const result_1 = await response.json();
    if (!response.ok) return "error";
    return result_1;
  } catch (error) {
    return console.log("error", error);
  }
};
