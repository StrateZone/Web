"use client";

import React from "react"; // Ensure React is imported
import { store } from "@/app/store"; // Ensure the store is correctly exported and typed
import { Provider } from "react-redux";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
