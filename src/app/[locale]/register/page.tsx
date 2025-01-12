"use client";
import React from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button, Input } from "@material-tailwind/react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RegisterPage() {
  const localActive = useLocale();
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
                <h3 className="text-4xl font-extrabold text-white">Sign Up</h3>
                <p className="text-sm text-gray-300">
                  Create your account by filling in the information below.
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
              <Input
                label="Password"
                type="password"
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                maxLength={50}
                crossOrigin="anonymous"
              />

              <Input
                label="Confirm Password"
                type="password"
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                maxLength={50}
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px]">
                Sign Up
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
                Sign Up With Google
              </Button>
              <Button className="w-full font-bold bg-gray-300 text-black py-3 rounded flex items-center justify-center hover:bg-gray-400 transition duration-150 ease-in-out">
                <img
                  src="https://www.svgrepo.com/show/303113/facebook-icon-logo.svg"
                  alt="Facebook Icon"
                  className="h-6 w-6 mr-2"
                />
                Sign Up With Facebook
              </Button>
            </div>

            <div className="text-center text-sm mt-4">
              <p>
                Already have an account?{" "}
                <Link
                  href={`/${localActive}/login`}
                  className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
                >
                  Log In
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
