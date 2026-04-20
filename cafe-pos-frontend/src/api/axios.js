import axios from "axios";
import { logoutUser } from "../utils/auth";
import { getDeviceId } from "../utils/device";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:8080/api",
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
    const code = error.response?.data?.code;

    if (status === 401) {
      logoutUser();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    const isLicenseError =
      code === "LICENSE_NOT_ACTIVATED" ||
      code === "LICENSE_EXPIRED" ||
      message === "License not activated" ||
      message === "License expired";

    if (isLicenseError) {
      const current = window.location.pathname;

      // 🚨 STOP LOOP
      if (current !== "/activate-license") {
        localStorage.removeItem("token");
        // only mark error, DO NOT redirect
if (
  message === "License not activated" ||
  message === "License expired" ||
  message === "This device is not authorized"
) {
  localStorage.setItem("license_error", message);
}

return Promise.reject(error);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;