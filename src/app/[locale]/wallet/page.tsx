"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet } from "./walletSlice";
import { RootState, AppDispatch } from "@/app/store";
import { FaWallet } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Button } from "@material-tailwind/react";
import { DefaultPagination } from "@/components/pagination";
import Banner from "@/components/banner/banner";

interface Transaction {
  id: number;
  ofUser: number;
  referenceId: number | null;
  content: string;
  amount: number;
  transactionType: number;
  createdAt: string;
  ofUserNavigation: null;
}

function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(
    null,
  );

  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading, error } = useSelector(
    (state: RootState) => state.wallet,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Lấy userId từ localStorage
  let userId = 17; // Giá trị fallback mặc định
  try {
    const storedAuthData = localStorage.getItem("authData");
    if (storedAuthData) {
      const parsedData = JSON.parse(storedAuthData);
      if (parsedData.userId) {
        userId = parsedData.userId;
      }
    }
  } catch (error) {
    console.error("Lỗi khi xử lý dữ liệu từ LocalStorage:", error);
  }

  // Hàm fetch transactions từ API
  const fetchTransactions = async (
    userId: number,
    page: number,
    size: number,
  ) => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/transactions/users/${userId}?page-number=${page}&page-size=${size}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Thêm dòng này để debug

      setTransactions(data.pagedList);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setErrorTransactions(
        "Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.",
      );
    } finally {
      setLoadingTransactions(false);
    }
  };
  const formatTransactionContent = (content: string) => {
    // 1. Xử lý nạp tiền (Deposit)
    if (content.includes("Transaction for: Deposite")) {
      const match = content.match(/Deposite: ([\d,]+)/);
      if (match) {
        const amount = match[1];
        return `Nạp tiền vào ví qua Zalo Pay: ${amount} VND`;
      }
      return "Nạp tiền vào ví";
    }

    // 2. Xử lý hoàn tiền (Refund)
    if (content.includes("Refund on booking cancellation")) {
      const match = content.match(/id (\d+): ([\d,.]+)/);
      if (match) {
        const id = match[1];
        const amount = match[2];
        return `Hoàn tiền cho bàn có mã giao dịch số #${id}: ${amount} VND`;
      }
      return content.replace(
        "Refund on booking cancellation",
        "Hoàn tiền đặt bàn",
      );
    }

    // 3. Xử lý thanh toán booking
    if (content.includes("Paid booking")) {
      const match = content.match(/Paid booking (\d+): ([\d,]+)/);
      if (match) {
        const id = match[1];
        const amount = match[2];
        return `Thanh toán cho đơn đặt bàn #${id}: ${amount} VND`;
      }
      return content.replace("Paid booking", "Thanh toán đặt bàn");
    }

    // 4. Xử lý các transaction khác
    if (content.includes("Transaction for")) {
      const match = content.match(/: ([\d,]+)/);
      if (match) {
        const amount = match[1];
        return `Giao dịch ví: ${amount} VND`;
      }
      return "Giao dịch ví";
    }

    // Mặc định trả về content gốc nếu không khớp pattern nào
    return content;
  };
  useEffect(() => {
    dispatch(fetchWallet(userId));
    fetchTransactions(userId, currentPage, pageSize);
  }, [dispatch, userId, currentPage, pageSize]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getTransactionType = (type: number) => {
    // 1: Deposit, 2: Refund, 3: Payment
    return type === 0 || type === 1 || type === 2 ? "in" : "out";
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleZaloPayDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount <= 0) return;

    try {
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/zalo-pay/create-payment",
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
        },
      );

      const data = await response.json();

      if (data.order_url) {
        window.location.href = data.order_url;
      } else {
        throw new Error(data.message || "Không thể tạo giao dịch");
      }
    } catch (error) {
      console.error("Lỗi khi tạo giao dịch ZaloPay:", error);
      alert("Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.");
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      handleZaloPayDeposit();
      setDepositAmount("");
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Banner
        title="Ví Điện Tử StrateZone"
        subtitle="Nạp tiền - Thanh toán - Thi đấu không gián đoạn"
      />
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

          {/* Các nút chức năng */}
          <div className="space-x-4 mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => {
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
                    loading ||
                    !depositAmount ||
                    parseFloat(depositAmount) < 10000
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

              {/* Các nút tiền mẫu */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[50000, 100000, 200000, 500000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className={`px-3 py-1 rounded-full border ${
                      depositAmount === amount.toString()
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-blue-500 border-blue-300 hover:bg-blue-50"
                    } transition-colors`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {depositAmount && parseFloat(depositAmount) < 10000 && (
                <p className="text-red-500 text-sm mt-1">
                  Số tiền tối thiểu là 10,000 VNĐ
                </p>
              )}
            </div>
          </div>

          {/* Lịch sử giao dịch */}
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Biến Động Số Dư
            </h3>

            {loadingTransactions ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : errorTransactions ? (
              <div className="text-red-500 text-center py-4">
                {errorTransactions}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Không có giao dịch nào
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {formatTransactionContent(txn.content)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {formatDate(txn.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p
                        className={`font-semibold text-right ${
                          getTransactionType(txn.transactionType) === "in"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {getTransactionType(txn.transactionType) === "in"
                          ? "+"
                          : "-"}
                        {formatCurrency(txn.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phân trang */}
      {totalPages >= 1 && (
        <div className="flex justify-center mt-4 mb-8">
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default WalletPage;
