// app/client-layout.tsx (Client Component)
"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import { NextIntlClientProvider } from "next-intl";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import Layout from "@/components/layout";

export default function ClientLayout({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: any;
}) {
  return (
    <Provider store={store}>
      <NextIntlClientProvider messages={messages}>
        <SessionProvider>
          <Layout>{children}</Layout>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            pauseOnFocusLoss
          />
        </SessionProvider>
      </NextIntlClientProvider>
    </Provider>
  );
}
