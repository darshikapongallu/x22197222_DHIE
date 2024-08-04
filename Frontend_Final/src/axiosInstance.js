import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://3.252.26.137:4343/api",
  timeout: 10000,
});

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;
