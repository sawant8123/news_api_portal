import axios from "axios";

const BASE_API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_API,
  timeout: 8000,
});

// Attach access token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          // Use raw axios to avoid interceptor recursion
          const res = await axios.post(
            `${BASE_API}/token/refresh/`,
            { refresh: refreshToken },
            { timeout: 7000 }
          );
          localStorage.setItem("access", res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login"; // force logout
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
