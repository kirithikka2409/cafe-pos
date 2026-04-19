import axios from "axios";
import { logoutUser } from "../utils/auth";
import { getDeviceId } from "../utils/device";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

// -------------------- REQUEST INTERCEPTOR --------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // optional (recommended for license system)
    config.headers["x-device-id"] = getDeviceId();

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------- RESPONSE INTERCEPTOR --------------------
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // ❌ Login/session expired
    if (status === 401) {
      logoutUser();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 🔑 LICENSE HANDLING (SAFE & CLEAN)
    if (
      message === "License not activated" ||
      message === "License expired" ||
      message === "This device is not authorized"
    ) {
      window.location.href = "/activate-license";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;