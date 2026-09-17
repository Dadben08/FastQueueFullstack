import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://fastqueuefullstack.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("fastqueue_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;