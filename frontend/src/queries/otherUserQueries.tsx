import { authContentHeader } from "./headers";

export const getOtherUser = async(otherUsername: string) => {
  // let body = JSON.stringify({
  //   login: otherUsername,
  // });
  try {
    console.log("mdaaa: " + otherUsername);
    
    const response = await fetch(`http://localhost:3001/profile/PublicProfile?login=${otherUsername}`, {
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
  // return fetchGetOtherUser("get_user", body);
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
