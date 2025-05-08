"use client";
import { Button } from "@material-tailwind/react";
import { Voucher, ChessBooking } from "./page";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface VoucherModalProps {
  open: boolean;
  onClose: () => void;
  userVouchers: Voucher[];
  availableVouchers: Voucher[];
  selectedBooking: {
    tableId: number;
    startDate: string;
    endDate: string;
  } | null;
  chessBookings: ChessBooking[];
  handleApplyVoucher: (
    tableId: number,
    startDate: string,
    endDate: string,
    voucher: Voucher | null
  ) => void;
  handleRedeemVoucher: () => void;
}

const VoucherModal = ({
  open,
  onClose,
  userVouchers,
  availableVouchers,
  selectedBooking,
  chessBookings,
  handleApplyVoucher,
  handleRedeemVoucher,
}: VoucherModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";
  const handleTokenExpiration = async (retryCallback: () => Promise<void>) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Không có refresh token, vui lòng đăng nhập lại");
      }

      console.log("Sending refreshToken:", refreshToken); // Debug
      const response = await fetch(
        `${API_BASE_URL}/api/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            // Remove Content-Type since we're not sending a JSON body
            // Authorization header may still be needed if the API requires it
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Refresh token error:", errorData); // Debug
        throw new Error(errorData.message || "Không thể làm mới token");
      }

      // Since the API returns 204, there may be no response body
      // Check if the API sets the new token in headers or elsewhere
      const newToken = response.headers.get("x-access-token"); // Adjust based on API behavior
      if (newToken) {
        localStorage.setItem("accessToken", newToken);
      } else {
        // If the API returns a JSON body (based on your original code), parse it
        const data = await response.json();
        localStorage.setItem("accessToken", data.data.newToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
      }

      await retryCallback();
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authData");
      // Chỉ chuyển hướng nếu cần
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      document.cookie =
        "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      window.location.href = "/login";
    }
  };
  const fetchUserPoints = async () => {
    try {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        console.error("No auth data found in localStorage");
        return;
      }
      const authData = JSON.parse(authDataString);
      const userId = authData.userId;

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/users/points/${userId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        // Token expired, try to refresh it
        await handleTokenExpiration(fetchUserPoints);
        return; // Exit the function after refreshing the token
      }
      if (!response.ok) {
        throw new Error("Failed to fetch user points");
      }

      const data = await response.json();
      setUserPoints(data.points);
    } catch (error) {
      console.error("Error fetching user points:", error);
      toast.error("Không thể tải điểm của bạn");
    }
  };

  useEffect(() => {
    if (open && selectedBooking) {
      fetchUserPoints();
    }
  }, [open, selectedBooking]);

  if (!open || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center justify-between">
          Chọn Voucher
          {userPoints !== null && (
            <span className="text-sm text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full">
              Điểm: {userPoints.toLocaleString()}
            </span>
          )}
        </h2>
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">
              Voucher của bạn
            </h3>
            {userVouchers.length === 0 ? (
              <p className="text-gray-500 italic">Bạn chưa có voucher nào</p>
            ) : (
              userVouchers.map((voucher) => {
                const isUsed = chessBookings.some(
                  (booking) =>
                    booking.appliedVoucher?.voucherId === voucher.voucherId &&
                    (booking.tableId !== selectedBooking.tableId ||
                      booking.startDate !== selectedBooking.startDate ||
                      booking.endDate !== selectedBooking.endDate)
                );
                const isAppliedToCurrentBooking = chessBookings.some(
                  (booking) =>
                    booking.appliedVoucher?.voucherId === voucher.voucherId &&
                    booking.tableId === selectedBooking.tableId &&
                    booking.startDate === selectedBooking.startDate &&
                    booking.endDate === selectedBooking.endDate
                );
                const booking = chessBookings.find(
                  (b) =>
                    b.tableId === selectedBooking.tableId &&
                    b.startDate === selectedBooking.startDate &&
                    b.endDate === selectedBooking.endDate
                );
                const basePrice = booking
                  ? (booking.roomTypePrice + booking.gameTypePrice) *
                    booking.durationInHours
                  : 0;
                const isInvalid = basePrice < voucher.minPriceCondition;

                return (
                  <div
                    key={voucher.voucherId}
                    className="border border-gray-200 p-4 my-3 rounded-lg bg-white hover:shadow-md transition-shadow duration-200"
                  >
                    <p className="text-lg font-semibold text-gray-900">
                      {voucher.voucherName} -{" "}
                      <span className="text-green-600">
                        Giảm {voucher.value.toLocaleString()}đ
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {voucher.description}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Giá bàn hiện tại:{" "}
                      <span className="font-medium">
                        {basePrice.toLocaleString()}đ
                      </span>
                    </p>
                    {isUsed && (
                      <p className="text-sm text-red-600 font-medium mt-1">
                        Đã sử dụng cho bàn khác
                      </p>
                    )}
                    {isInvalid && (
                      <p className="text-sm text-red-600 font-medium mt-1">
                        Cần tối thiểu{" "}
                        {voucher.minPriceCondition.toLocaleString()}đ
                      </p>
                    )}
                    <Button
                      onClick={() =>
                        handleApplyVoucher(
                          selectedBooking.tableId,
                          selectedBooking.startDate,
                          selectedBooking.endDate,
                          voucher
                        )
                      }
                      className={`mt-3 text-sm ${
                        isAppliedToCurrentBooking
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } transition-colors duration-200`}
                      disabled={
                        isLoading ||
                        isUsed ||
                        isInvalid ||
                        isAppliedToCurrentBooking
                      }
                    >
                      {isAppliedToCurrentBooking ? "Đang áp dụng" : "Áp dụng"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex justify-between gap-3">
          <Button
            onClick={() =>
              handleApplyVoucher(
                selectedBooking.tableId,
                selectedBooking.startDate,
                selectedBooking.endDate,
                null
              )
            }
            variant="outlined"
            className="text-sm border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 flex-1"
            disabled={isLoading}
          >
            Bỏ Chọn Voucher
          </Button>
          <Button
            onClick={onClose}
            className="text-sm bg-gray-600 hover:bg-gray-700 transition-colors duration-200 flex-1"
            disabled={isLoading}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
