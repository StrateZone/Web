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
          },
        }
      );

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">
          Chọn Voucher
          {userPoints !== null && (
            <span className="text-sm text-gray-600 ml-2">
              (Điểm hiện tại của bạn: {userPoints.toLocaleString()})
            </span>
          )}
        </h2>
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="mb-4">
            <h3 className="font-semibold">Voucher của bạn</h3>
            {userVouchers.length === 0 ? (
              <p className="text-gray-500">Bạn chưa có voucher nào</p>
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
                    className="border p-2 my-2 rounded"
                  >
                    <p>
                      <strong>{voucher.voucherName}</strong> - Giảm{" "}
                      {voucher.value.toLocaleString()}đ
                    </p>
                    <p className="text-sm">{voucher.description}</p>
                    <p className="text-sm">
                      Giá bàn hiện tại: {basePrice.toLocaleString()}đ
                    </p>
                    {isUsed && (
                      <p className="text-sm text-red-500">
                        Đã sử dụng cho bàn khác
                      </p>
                    )}
                    {isInvalid && (
                      <p className="text-sm text-red-500">
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
                      className="mt-2 text-sm"
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
        <div className="flex justify-between">
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
            className="text-sm"
            disabled={isLoading}
          >
            Bỏ Chọn Voucher
          </Button>
          <Button onClick={onClose} className="text-sm" disabled={isLoading}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
