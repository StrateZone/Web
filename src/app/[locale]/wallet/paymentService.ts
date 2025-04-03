// src/services/paymentService.ts
import axios from "axios";

const API_URL = "https://backend-production-ac5e.up.railway.app/api";

export const paymentService = {
  createZaloPayment: async (data: {
    userId: number;
    amount: number;
    description: string;
    returnUrl: string;
  }) => {
    const response = await axios.post(
      `${API_URL}/zalo-pay/create-payment`,
      data
    );
    return response.data;
  },
};
