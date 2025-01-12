"use client";
import React, { useState } from "react";
import { User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Input, Checkbox, Button, Typography } from "@material-tailwind/react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false); // Quản lý trạng thái hiển thị mật khẩu
  const localActive = useLocale();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{ marginTop: "120px", marginBottom: "50px" }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold text-white">Login</h3>
                <p className="text-sm text-gray-300">
                  Welcome back! Please enter your details.
                </p>
              </div>
              <div className="relative w-full">
                <Input
                  label="Email"
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  icon={<User size={20} />}
                  maxLength={50}
                  crossOrigin="anonymous"
                />
              </div>

              <div className="relative w-full mt-4">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  maxLength={50}
                  crossOrigin="anonymous"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-2.5 text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="w-full flex items-center">
                <Checkbox
                  id="remember-me"
                  label={
                    <Typography className="flex font-medium text-white">
                      Remember me
                    </Typography>
                  }
                  color="blue"
                  crossOrigin="anonymous"
                  ripple
                />
              </div>
              <Link
                href={`/${localActive}/forgot_password`}
                className="text-sm font-medium whitespace-nowrap cursor-pointer underline underline-offset-2 hover:text-gray-400"
              >
                Forgot Password ?
              </Link>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px]">
                Log In
              </Button>
            </div>
            <div className="w-full flex items-center justify-center relative">
              <div className="flex w-full items-center">
                <div className="flex-grow h-[1px] bg-white"></div>
                <p className="px-2 text-white">Or</p>
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
                Sign In With Google
              </Button>
              <Button className="w-full font-bold bg-gray-300 text-black py-3 rounded flex items-center justify-center hover:bg-gray-400 transition duration-150 ease-in-out">
                <img
                  src="https://www.svgrepo.com/show/303113/facebook-icon-logo.svg"
                  alt="Google Icon"
                  className="h-6 w-6 mr-2"
                />
                Sign In With Facebook
              </Button>
            </div>

            <div className="text-center text-sm mt-4">
              <p>
                Don't have an account?{" "}
                <Link
                  href={`/${localActive}/register`}
                  className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
                >
                  Sign up for free
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
