import { Api } from "../Config/Api";
import { authHeader } from "./headers";

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