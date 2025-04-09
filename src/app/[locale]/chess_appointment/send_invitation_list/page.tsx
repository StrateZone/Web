import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React from "react";

function page() {
  return (
    <div>
      <div>
        <Navbar></Navbar>
        <div className="relative font-sans">
          <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
          <img
            src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
            alt="Banner Image"
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
          <div className="min-h-[400px] relative z-30 h-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
            <h2 className="sm:text-5xl text-3xl font-bold mb-6">
              Cửa hàng cờ StrateZone
            </h2>
            <p className="sm:text-xl text-lg text-center text-gray-200">
              Nâng tầm chiến thuật - Trang bị như một kiện tướng!
            </p>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default page;
