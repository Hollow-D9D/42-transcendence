import axios from "axios";

const host = process.env.REACT_APP_BACKEND_SOCKET || "localhost:3001";

export const Api = axios.create({
  baseURL: host,
});

export const addAuthHeader = (token: string) => {
  Api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
