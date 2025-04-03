// src/services/walletService.ts
import axios from "axios";

const API_URL = "https://backend-production-ac5e.up.railway.app/api";

export const walletService = {
  getWalletByUserId: async (userId: number) => {
    const response = await axios.get(`${API_URL}/wallets/users/${userId}`);
    return response.data;
  },

  deposit: async (userId: number, amount: number) => {
    const response = await axios.post(`${API_URL}/wallets/deposit`, {
      userId,
      amount,
    });
    return response.data;
  },

  // Thêm các API khác khi cần
};
