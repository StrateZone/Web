// src/redux/features/wallet/walletSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { walletService } from "./walletService";
import { paymentService } from "./paymentService";
interface WalletState {
  walletId: number | null;
  userId: number | null;
  balance: number;
  status: number;
  loading: boolean;
  error: string | null;
  transactionHistory: any[];
}

const initialState: WalletState = {
  walletId: null,
  userId: null,
  balance: 0,
  status: 0,
  loading: false,
  error: null,
  transactionHistory: [],
};

export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (userId: number, { rejectWithValue }) => {
    try {
      return await walletService.getWalletByUserId(userId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wallet"
      );
    }
  }
);
export const createZaloPayment = createAsyncThunk(
  "wallet/zaloPay",
  async (
    paymentData: {
      userId: number;
      amount: number;
      description?: string;
      returnUrl?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await paymentService.createZaloPayment({
        ...paymentData,
        description: paymentData.description || "Nạp tiền vào ví",
        returnUrl: paymentData.returnUrl || `${window.location.origin}/wallet`,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Payment failed");
    }
  }
);
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchWallet
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletId = action.payload.walletId;
        state.userId = action.payload.userId;
        state.balance = action.payload.balance;
        state.status = action.payload.status;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = walletSlice.actions;
export default walletSlice.reducer;
