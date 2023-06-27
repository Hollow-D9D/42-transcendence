import { Api } from "../Config/Api";

const authFileHeader = () => {
  let token = "bearer " + localStorage.getItem("userToken");
  let myHeaders = new Headers();
  myHeaders.append("Authorization", token);
  return myHeaders;
};

export const uploadAvatarQuery = async (file: any) => {
  try {
    const formData = new FormData();
    formData.append("image", file, file.name);
    const fileProps = await Api.post("/profile/upload", formData);
    return fileProps.data.fileName;
  } catch (error) {
    console.error("Error saving image:", error);
    throw error;
  }
};

export const getAvatarQuery = () => {
  return fetchAvatar("GET", null, authFileHeader(), "avatar");
};

export const getUserAvatarQuery = async (otherId: number) => {
  let body = JSON.stringify({
    userId: otherId,
  });
  let header = authFileHeader();
  header.append("Content-Type", "application/json");
  return fetchAvatar("GET", body, header, "getProfPic");

};

const fetchAvatar = async (
  method: string,
  body: any,
  header: any,
  url: string
) => {
  let fetchUrl = process.env.REACT_APP_BACKEND_URL + "/profile/" + url;

  let requestOptions: RequestInit | undefined;
  if (method === "POST")
    requestOptions = {
      method: method,
      headers: header,
      body: body,
      redirect: "follow",
    };
  else
    requestOptions = {
      method: method,
      headers: header,
      redirect: "follow",
    };

  try {
    const response = await fetch(fetchUrl, requestOptions);
    const result_1 = await response.blob();
    if (!response.ok) {
      return "error";
    }
    return result_1;
  } catch (error) {
    console.log("error", error);
  }
};
