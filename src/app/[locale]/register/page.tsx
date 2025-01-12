"use client";
import React, { useState } from "react";
import { User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button, Input } from "@material-tailwind/react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RegisterPage() {
  const localActive = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const t = useTranslations("signupPage");

  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{
            marginTop: "120px",
            maxHeight: "1000px",
            minWidth: "300px",
            width: "100%",
            marginBottom: "50px",
          }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold text-white">
                  {t("title")}
                </h3>
                <p className="text-sm text-gray-300">{t("description")}</p>
              </div>
              <div className="relative w-full">
                <Input
                  label={t("labelName")}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  icon={<User size={20} />}
                  maxLength={50}
                  crossOrigin="anonymous"
                />
              </div>
              <Input
                label={t("labelEmail")}
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                maxLength={50}
                crossOrigin="anonymous"
              />
              {/* Password Field */}
              <div className="relative w-full">
                <Input
                  label={t("labelPassword")}
                  type={showPassword ? "text" : "password"}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  maxLength={50}
                  crossOrigin="anonymous"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="white" />
                  ) : (
                    <Eye size={20} color="white" />
                  )}
                </div>
              </div>
              {/* Re-type Password Field */}
              <div className="relative w-full">
                <Input
                  label={t("labelRePassword")}
                  type={showRePassword ? "text" : "password"}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  maxLength={50}
                  crossOrigin="anonymous"
                />
                <div
                  onClick={() => setShowRePassword(!showRePassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showRePassword ? (
                    <EyeOff size={20} color="white" />
                  ) : (
                    <Eye size={20} color="white" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px]">
                {t("buttonSignUp")}
              </Button>
            </div>
            <div className="w-full flex items-center justify-center relative">
              <div className="flex w-full items-center">
                <div className="flex-grow h-[1px] bg-white"></div>
                <p className="px-2 text-white">{t("Or")}</p>
                <div className="flex-grow h-[1px] bg-white"></div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button className="w-full font-bold bg-gray-300 text-black py-3 rounded flex items-center justify-center hover:bg-gray-400 transition duration-150 ease-in-out">
                <img
                  src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                  alt="Google Icon"
                  className="h-6 w-6 mr-2"
                />
                {t("buttonGoogle")}
              </Button>
              <Button className="w-full font-bold bg-gray-300 text-black py-3 rounded flex items-center justify-center hover:bg-gray-400 transition duration-150 ease-in-out">
                <img
                  src="https://www.svgrepo.com/show/303113/facebook-icon-logo.svg"
                  alt="Facebook Icon"
                  className="h-6 w-6 mr-2"
                />
                {t("buttonFacebook")}
              </Button>
            </div>

            <div className="text-center text-sm mt-4">
              <p>
                {t("alreadyHaveAccount")}
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
