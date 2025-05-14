import axios from "axios";

const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/refresh-token`,
      { refreshToken },
      { headers: { Accept: "application/json" } }
    );

    if (response.data.success) {
      const { newToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem("accessToken", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return newToken;
    }
    throw new Error("Failed to refresh token");
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

// Axios Interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const getAuthHeader = async () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRequest = async (
  path: string,
  query?: Record<string, unknown>
) => {
  try {
    const params = new URLSearchParams();
    const headers = await getAuthHeader();

    if (query) {
      for (const key in query) {
        const value = query[key];
        if (Array.isArray(value)) {
          value.forEach((val) => params.append(key, String(val)));
        } else {
          params.append(key, String(value));
        }
      }
    }

    const { data } = await axios.get(
      `${API_BASE_URL}/api${path}?${params.toString()}`,
      { headers }
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data.error || "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};

export const postRequest = async (
  path: string,
  requestBody?: Record<string, unknown>,
  query?: Record<string, unknown>
) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(
      `${API_BASE_URL}/api${path}`,
      requestBody,
      {
        params: query,
        headers,
      }
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errData = error.response?.data;
      return {
        success: false,
        error:
          errData?.error || errData?.message || "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};
// lib/api.ts
export const putRequest = async (
  path: string,
  requestBody?: Record<string, unknown>,
  query?: Record<string, unknown>
) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.put(
      `${API_BASE_URL}/api${path}`,
      requestBody,
      {
        params: query,
        headers,
      }
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errData = error.response?.data;
      return {
        success: false,
        error:
          errData?.error || errData?.message || "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};
