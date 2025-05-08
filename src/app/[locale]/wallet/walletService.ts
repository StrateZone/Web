import axios from "axios";
import { useLocale } from "next-intl";

const API_URL = "https://backend-production-ac5e.up.railway.app/api";

// Biến toàn cục để ngăn nhiều yêu cầu refresh đồng thời
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const handleTokenExpiration = async (retryCallback: () => Promise<void>) => {
  // Lấy locale hiện tại (nếu có), mặc định là 'vn'

  if (isRefreshing) {
    await refreshPromise;
    await retryCallback();
    return;
  }

  isRefreshing = true;
  refreshPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Không có refresh token, vui lòng đăng nhập lại");
      }

      console.log("Sending refreshToken:", refreshToken);
      const response = await axios.post(
        `${API_URL}/auth/refresh-token?refreshToken=${encodeURIComponent(
          refreshToken
        )}`,
        null,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // API trả về 200 với body JSON
      const data = response.data;
      if (!data.data?.newToken) {
        throw new Error("Không có token mới trong phản hồi");
      }

      localStorage.setItem("accessToken", data.data.newToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      console.log("Refresh token thành công:", {
        newToken: data.data.newToken,
        newRefreshToken: data.data.refreshToken,
      });

      await retryCallback();
      resolve();
    } catch (error: any) {
      console.error("Refresh token thất bại:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authData");
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      document.cookie =
        "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      window.location.href = `/vn/login`;
      reject(error);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  });

  await refreshPromise;
};

export const walletService = {
  getWalletByUserId: async (userId: number) => {
    try {
      const response = await axios.get(`${API_URL}/wallets/users/${userId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handleTokenExpiration(() =>
          walletService.getWalletByUserId(userId)
        );
        return;
      }
      console.error("Lỗi khi lấy thông tin ví:", error);
      throw error.response?.data?.message || "Không thể lấy thông tin ví";
    }
  },

  deposit: async (userId: number, amount: number) => {
    try {
      const response = await axios.post(
        `${API_URL}/wallets/deposit`,
        {
          userId,
          amount,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handleTokenExpiration(() =>
          walletService.deposit(userId, amount)
        );
        return;
      }
      console.error("Lỗi khi nạp tiền vào ví:", error);
      throw error.response?.data?.message || "Không thể nạp tiền vào ví";
    }
  },
};
