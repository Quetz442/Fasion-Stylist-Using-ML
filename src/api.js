import axios from "axios";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const authApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

authApi.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const validateUser = async () => {
  try {
    const response = await authApi.get("/validate-user/");
    return response.data;
  } catch (error) {
    return { authenticated: false };
  }
};

export const login = async (username, password) => {
  try {
    const response = await api.post("/token/", { username, password });
    if (response.data.access) {
      setAccessToken(response.data.access);
    }
    return response.data;
  } catch (error) {
    return { error: "Login failed" };
  }
};

export const signup = async (username, email, password) => {
  try {
    const response = await api.post("/signup/", { username, email, password });
    return response.data;
  } catch (error) {
    return { error: "Signup failed" };
  }
};

export default api;
