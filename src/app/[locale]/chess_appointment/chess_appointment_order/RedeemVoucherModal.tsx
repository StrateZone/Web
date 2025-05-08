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
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");
      // localStorage.removeItem("authData");
      // // Chỉ chuyển hướng nếu cần
      // document.cookie =
      //   "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      // document.cookie =
      //   "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      window.location.href = "/login";
    }
  };
  const fetchUserData = async () => {
    try {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        throw new Error("Không có dữ liệu xác thực trong localStorage");
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (pointsResponse.status === 401) {
        await handleTokenExpiration(() => fetchUserData());
        return;
      }
      if (!pointsResponse.ok) {
        throw new Error("Không thể lấy thông tin điểm");
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (userResponse.status === 401) {
        await handleTokenExpiration(() => fetchUserData());
        return;
      }
      if (!userResponse.ok) {
        throw new Error("Không thể lấy thông tin người dùng");
      }
      const userData = await userResponse.json();
      setUserLabel(userData.userLabel || null);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Lỗi khi lấy dữ liệu người dùng"
      );
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
        throw new Error("Vui lòng đăng nhập để đổi voucher");
      }
      const authData = JSON.parse(authDataString);

      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/vouchers/create-voucher",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            sampleVoucherId,
            userId: authData.userId,
          }),
        }
      );
      if (response.status === 401) {
        await handleTokenExpiration(() => fetchUserData());
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể đổi voucher");
      }

      const newVoucher = await response.json();
      onRedeemSuccess(newVoucher);
      toast.success("Đổi voucher thành công!");
      await fetchUserData();
    } catch (error) {
      console.error("Lỗi khi đổi voucher:", error);
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi đổi voucher"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canRedeemVoucher = (voucher: Voucher) => {
    if (userPoints === null) return false;
    const requiredPoints =
      userLabel === "top_contributor"
        ? voucher.contributionPointsCost
        : voucher.pointsCost;
    return userPoints >= requiredPoints;
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
                    className="mt-3 text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 relative"
                    disabled={isLoading || !canRedeemVoucher(voucher)}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                        Đang đổi...
                      </div>
                    ) : (
                      "Đổi Voucher"
                    )}
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
