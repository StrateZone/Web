"use client";
import { Button } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Voucher {
  voucherId: number;
  voucherName: string;
  value: number;
  minPriceCondition: number;
  description: string;
  pointsCost: number;
  contributionPointsCost: number;
  isSample?: boolean;
  userId?: number;
  expireDate?: string | null;
  status?: number;
}

interface RedeemVoucherModalProps {
  open: boolean;
  onClose: () => void;
  availableVouchers: Voucher[];
  onRedeemSuccess: (newVoucher: Voucher) => void;
}

const RedeemVoucherModal = ({
  open,
  onClose,
  availableVouchers,
  onRedeemSuccess,
}: RedeemVoucherModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        console.error("No auth data found in localStorage");
        return;
      }
      const authData = JSON.parse(authDataString);
      const userId = authData.userId;

      // Fetch user points
      const pointsResponse = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/users/points/${userId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!pointsResponse.ok) {
        throw new Error("Failed to fetch user points");
      }

      const pointsData = await pointsResponse.json();
      setUserPoints(pointsData.points);

      // Fetch user label
      const userResponse = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/users/${userId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await userResponse.json();
      setUserLabel(userData.userLabel || null);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Không thể tải thông tin của bạn");
    }
  };

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const handleRedeemVoucher = async (sampleVoucherId: number) => {
    try {
      setIsLoading(true);
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        toast.error("Vui lòng đăng nhập để đổi voucher");
        return;
      }
      const authData = JSON.parse(authDataString);

      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/vouchers/create-voucher",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json-patch+json",
          },
          body: JSON.stringify({
            sampleVoucherId,
            userId: authData.userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.message || "Không thể đổi voucher";
        if (response.status === 500) {
          errorMessage = "Lỗi hệ thống, vui lòng thử lại sau";
        } else if (
          errorData.message ===
          "You don't have enough points to exchange this voucher."
        ) {
          errorMessage = "Bạn không đủ điểm để đổi voucher này";
        }
        throw new Error(errorMessage);
      }

      const newVoucher = await response.json();
      onRedeemSuccess(newVoucher);
      toast.success("Đổi voucher thành công!");
      await fetchUserData(); // Refresh points after redemption
    } catch (error) {
      console.error("Error redeeming voucher:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi đổi voucher, vui lòng thử lại";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const isContributor = userLabel === "top_contributor";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-indigo-700">
            Đổi Voucher
            {userPoints !== null && (
              <span className="text-sm text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full ml-2">
                Điểm: {userPoints.toLocaleString()}
              </span>
            )}
          </h2>
          {isContributor && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              Top Contributor
            </span>
          )}
        </div>
        {isContributor && (
          <p className="text-sm text-green-600 font-medium mb-4">
            Bạn là Top Contributor, được giảm điểm khi đổi voucher!
          </p>
        )}
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">
              Voucher có thể đổi
            </h3>
            {availableVouchers.length === 0 ? (
              <p className="text-gray-500 italic">
                Không có voucher nào để đổi
              </p>
            ) : (
              availableVouchers.map((voucher) => (
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
                    Cần{" "}
                    {isContributor ? (
                      <>
                        <span className="line-through text-gray-600">
                          {voucher.pointsCost}
                        </span>{" "}
                        <span className="text-green-600 font-medium">
                          {voucher.contributionPointsCost}
                        </span>
                        <span className="text-xs text-green-600 ml-1">
                          (Giảm cho Top Contributor)
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">{voucher.pointsCost}</span>
                    )}{" "}
                    điểm
                  </p>
                  <Button
                    onClick={() => handleRedeemVoucher(voucher.voucherId)}
                    className="mt-3 text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    Đổi voucher
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="text-sm bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
            disabled={isLoading}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RedeemVoucherModal;
