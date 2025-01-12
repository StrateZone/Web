"use client";
import React from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { Button, Input } from "@material-tailwind/react";
import { useLocale, useTranslations } from "next-intl";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function ForgotPasswordPage() {
  const localActive = useLocale();
  const t = useTranslations("forgotPassword");

  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{ marginTop: "80px" }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold text-white">
                  {t("forgotPasswordTitle")}
                </h3>
                <p className="text-sm text-gray-300">
                  {t("forgotPasswordDescription")}
                </p>
              </div>
              <div className="relative w-full">
                <Input
                  label={t("labelEmail")}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  icon={<Mail size={20} />}
                  maxLength={50}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px] 
              hover:bg-gray-700 transition duration-150 ease-in-out"
              >
                {t("buttonSendResetLink")}
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              <p>
                {t("alreadyRememberPassword")}
                <Link
                  href={`/${localActive}/login`}
                  className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
                >
                  {t("linkLogIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
