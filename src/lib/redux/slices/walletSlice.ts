import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  balance: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setBalance, setLoading, setError } = walletSlice.actions;
export default walletSlice.reducer;
