import axios from "axios";
import { getCookie } from "../utils/cookie";

const baseURL = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["X-CSRFToken"] = getCookie("csrftoken");

export const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

export const instanceWithToken = axios.create({
  baseURL,
});

instanceWithToken.interceptors.request.use(
  (config) => {
    const accessToken = getCookie("access_token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.log("Request Error!!");
    return Promise.reject(error);
  }
);

instanceWithToken.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("Response Error!!");
    return Promise.reject(error);
  }
);
