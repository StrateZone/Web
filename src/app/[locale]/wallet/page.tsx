"use client";
import React, { useState } from "react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
// import { DefaultPagination } from "@/components/pagination";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";

function WalletPage() {
  // Dữ liệu mẫu
  const [showBalance, setShowBalance] = useState(true);

  const transactions = [
    {
      id: 1,
      date: "05/10/2023",
      description: "Mua gói Premium",
      amount: 500000,
      type: "out",
    },
    {
      id: 2,
      date: "04/10/2023",
      description: "Nạp tiền từ thẻ",
      amount: 2000000,
      type: "in",
    },
    {
      id: 3,
      date: "03/10/2023",
      description: "Mua vật phẩm game",
      amount: 150000,
      type: "out",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Banner */}
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">Ví StrateZone</h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            Quản lý tài khoản trong hệ thống
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex text-black">
        {/* Left-aligned Wallet Content */}
        <div className="w-full max-w-2xl p-6 bg-white shadow-sm rounded-lg mt-6 mb-10 ml-6">
          {" "}
          {/* Thêm ml-6 để căn trái */}
          {/* Số dư */}
          <div className="text-left mb-8">
            {" "}
            {/* Đổi từ text-center sang text-left */}
            <h3 className="text-black text-lg uppercase font-bold">
              Số dư khả dụng
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                <FaWallet className="text-blue-500 mr-2" size={16} />
                <span className="text-gray-800 font-semibold">
                  {showBalance ? "100.000 VNĐ" : "******"}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  {showBalance ? (
                    <AiFillEyeInvisible size={18} />
                  ) : (
                    <AiFillEye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Các nút chức năng - Chỉ giữ lại nạp tiền và rút tiền */}
          <div className="flex space-x-4 mb-8">
            {" "}
            {/* Bỏ justify-center */}
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nạp tiền
            </button>
            {/* <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7l4-4m0 0l4 4m-4-4v18"
                />
              </svg>
              Rút tiền
            </button> */}
          </div>
          {/* Lịch sử giao dịch */}
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Lịch sử giao dịch
            </h3>
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-gray-500 text-sm">{txn.date}</p>
                  </div>
                  <p
                    className={`font-semibold ${txn.type === "in" ? "text-green-500" : "text-red-500"}`}
                  >
                    {txn.type === "in" ? "+" : "-"}
                    {txn.amount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                </div>
              ))}
            </div>
            {transactions.length > 3 && (
              <button className="w-full mt-4 text-center text-blue-500 py-2 hover:bg-blue-50 rounded-lg">
                Xem thêm
              </button>
            )}
          </div>
        </div>

        {/* Có thể thêm phần nội dung phụ ở bên phải nếu cần */}
      </div>
      <div>{/* <DefaultPagination></DefaultPagination> */}</div>
      <Footer />
    </div>
  );
}

export default WalletPage;
