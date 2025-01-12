import BannerHero from "@/components/banner_hero";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React from "react";
import { User } from "lucide-react";

function Page() {
  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{
            marginTop: "120px", // Thêm khoảng cách giữa Navbar và form
            maxHeight: "1000px", // Kích thước tối đa của form
            minWidth: "300px", // Kích thước tối thiểu của form
            width: "100%", // Đảm bảo form vừa với màn hình nhỏ hơn
            marginBottom: "50px", // Thêm khoảng cách giữa Navbar và form
          }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-extrabold text-white">Sign Up</h3>
                <p className="text-sm text-gray-300">
                  Create your account by filling in the information below.
                </p>
              </div>
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full text-white py-3 px-4 pr-10 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                />
                <User
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full text-white py-3 px-4 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full text-white py-3 px-4 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              />
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px] 
              hover:bg-gray-700 transition duration-150 ease-in-out"
              >
                Sign Up
              </button>
            </div>
            <div className="w-full flex items-center justify-center relative">
              <div className="flex w-full items-center">
                <div className="flex-grow h-[1px] bg-white"></div>
                <p className="px-2 text-white">Or</p>
                <div className="flex-grow h-[1px] bg-white"></div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button className="w-full font-bold bg-gray-300 text-black py-3 rounded flex items-center justify-center hover:bg-gray-400 transition duration-150 ease-in-out">
                <img
                  src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                  alt="Google Icon"
                  className="h-6 w-6 mr-2"
                />
                Sign Up With Google
              </button>
              <button className="w-full font-bold bg-gray-300 text-black py-3 rounded flex items-center justify-center hover:bg-gray-400 transition duration-150 ease-in-out">
                <img
                  src="https://www.svgrepo.com/show/303113/facebook-icon-logo.svg"
                  alt="Facebook Icon"
                  className="h-6 w-6 mr-2"
                />
                Sign Up With Facebook
              </button>
            </div>

            <div className="text-center text-sm mt-4">
              <p>
                Already have an account?{" "}
                <span className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400">
                  Log In
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Page;
