"use client";
import React, { useEffect, useState } from "react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
// import { DefaultPagination } from "@/components/pagination";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet } from "./walletSlice";
import { RootState, AppDispatch } from "@/app/store";
import { FaWallet } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Button } from "@material-tailwind/react";
function WalletPage() {
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
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading, error } = useSelector(
    (state: RootState) => state.wallet
  );

  // 1. Khai báo biến userId với giá trị mặc định
  let userId = 11; // Giá trị fallback mặc định

  try {
    // 2. Lấy dữ liệu từ LocalStorage
    const storedAuthData = localStorage.getItem("authData");

    if (storedAuthData) {
      // 3. Parse dữ liệu an toàn với try-catch
      const parsedData = JSON.parse(storedAuthData);

      // 4. Ưu tiên lấy userId từ authData trước
      if (parsedData.userId) {
        userId = parsedData.userId;
      }
    } else {
      console.log("Không tìm thấy dữ liệu trong LocalStorage");
    }
  } catch (error) {
    console.error("Lỗi khi xử lý dữ liệu từ LocalStorage:", error);
    // Có thể thêm xử lý fallback ở đây
  }

  useEffect(() => {
    dispatch(fetchWallet(userId));
  }, [dispatch, userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (error) return <div>Error: {error}</div>;
  const handleZaloPayDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount <= 0) return;

    try {
      // Gọi API ZaloPay
      const response = await fetch(
        "https://backend-production-5bc5.up.railway.app/api/zalo-pay/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            amount: amount,
            description: `Nạp tiền vào ví ${amount} VND`,
            returnUrl: `${window.location.origin}/wallet?success=true`,
          }),
        }
      );

      const data = await response.json();

      if (data.order_url) {
        // Chuyển hướng đến trang thanh toán ZaloPay
        window.location.href = data.order_url;
      } else {
        throw new Error(data.message || "Không thể tạo giao dịch");
      }
    } catch (error) {
      console.error("Lỗi khi tạo giao dịch ZaloPay:", error);
      alert("Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.");
    } finally {
    }
  };
  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      handleZaloPayDeposit(); // Thay vì dispatch depositFunds
      setDepositAmount("");
    }
  };

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
        <div className="w-full max-w-2xl p-6 bg-white shadow-sm rounded-lg mt-6 mb-10 ml-6">
          <div className="text-left mb-8">
            <h3 className="text-black text-lg uppercase font-bold">
              Số dư khả dụng
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                <FaWallet className="text-blue-500 mr-2" size={16} />
                <span className="text-gray-800 font-semibold">
                  {showBalance ? formatCurrency(balance) : "******"}
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
              <div className="mb-8"></div>
            </div>
          </div>
          {/* Các nút chức năng - Chỉ giữ lại nạp tiền và rút tiền */}
          <div className="flex space-x-4 mb-8">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => {
                  // Chỉ cho phép nhập số và giá trị dương
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setDepositAmount(value);
                }}
                placeholder="Nhập số tiền (VNĐ)"
                className="border p-2 rounded w-40"
                min="10000"
                step="1000"
              />
              <Button
                onClick={handleDeposit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded"
                disabled={
                  loading || !depositAmount || parseFloat(depositAmount) < 10000
                }
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  "Nạp tiền qua ZaloPay"
                )}
              </Button>
            </div>

            {/* Thông báo lỗi */}
            {depositAmount && parseFloat(depositAmount) < 10000 && (
              <p className="text-red-500 text-sm mt-1">
                Số tiền tối thiểu là 10,000 VNĐ
              </p>
            )}
          </div>
          {/* Lịch sử giao dịch */}
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Biến Động Số Dư
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
