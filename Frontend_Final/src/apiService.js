import axiosInstance, { setAuthToken } from "./axiosInstance";

export const apiGet = async (endpoint, token = "") => {
  if (token.length > 0) {
    setAuthToken(token);
  }
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}`, error);
    throw error;
  }
};

export const apiPost = async (endpoint, data, token = "") => {
  if (token.length > 0) {
    setAuthToken(token);
  }
  try {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}`, error);
    throw error;
  }
};

export const apiPut = async (endpoint, data, token = "") => {
  if (token.length > 0) {
    setAuthToken(token);
  }
  try {
    const response = await axiosInstance.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating data at ${endpoint}`, error);
    throw error;
  }
};

export const apiDelete = async (endpoint, token = "") => {
  if (token.length > 0) {
    setAuthToken(token);
  }
  try {
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}`, error);
    throw error;
  }
};
