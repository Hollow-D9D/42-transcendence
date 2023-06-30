import { Api } from "../Config/Api";

export const uploadAvatarQuery = async (file: any) => {
  try {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg')
      throw 'file must be a picture you weirdo, who the hell puts txt or pdf as an avatar picture';
    const formData = new FormData();
    formData.append("image", file, file.name);
    const fileProps = await Api.post("/profile/upload", formData);
    return fileProps.data.fileName;
  } catch (error) {
    console.error( error);
    throw error;
  }
};

