import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./slices/walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
});

// Infer the RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
