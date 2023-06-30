import { authContentHeader } from "./headers";

export const getGameStats = async(otherUsername: string) => {
  let body = JSON.stringify({
    otherId: otherUsername,
  });
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_SOCKET}/profile/GameHistory?login=${otherUsername}`,
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
