// Banner.js
import React from "react";

interface BannerProps {
  title: string;
  subtitle: string;
}

const Banner: React.FC<BannerProps> = ({ title, subtitle }) => {
  return (
    <div className="relative font-sans">
      <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
      <img
        src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
        alt="Banner Image"
        className="absolute inset-0 w-full h-full object-cover z-10"
      />
      <div className="min-h-[300px] relative z-30 h-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
        <h2 className="sm:text-4xl text-2xl font-bold mb-6">{title}</h2>
        <p className="sm:text-xl text-lg text-center text-gray-200">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default Banner;
