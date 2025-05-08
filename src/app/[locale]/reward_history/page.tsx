"use client";
import React, { useState, useEffect } from "react";
import { Typography, Spinner } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { DefaultPagination } from "@/components/pagination";
import Banner from "@/components/banner/banner";

interface PointHistory {
  id: number;
  ofUser: number;
  description: string | null;
  amount: number;
  content: string;
  pointType: string;
  createdAt: string;
}

interface PointsData {
  points: number;
  contributionPoints: number;
}

interface PointHistoryResponse {
  pagedList: PointHistory[];
  totalPages: number;
  totalCount: number;
}

const RewardHistoryPage = () => {
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [errorPoints, setErrorPoints] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState("created-at-desc");
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

  const getUserId = () => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    return authData.userId;
  };

  const getAccessToken = () => {
    const accessTokenString = localStorage.getItem("accessToken");
    if (!accessTokenString) return null;
    return accessTokenString;
  };

  let isRefreshing = false;
  let refreshPromise: Promise<void> | null = null;

  const handleTokenExpiration = async (retryCallback: () => Promise<void>) => {
    if (isRefreshing) {
      await refreshPromise;
      await retryCallback();
      return;
    }

    isRefreshing = true;
    refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Không có refresh token, vui lòng đăng nhập lại");
        }

        console.log("Sending refreshToken:", refreshToken);
        const response = await fetch(
          `${API_BASE_URL}/api/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Lỗi refresh token:", errorData);
          throw new Error(errorData || "Không thể làm mới token");
        }

        const data = await response.json();
        if (!data.data?.newToken) {
          throw new Error("Không có token mới trong phản hồi");
        }

        localStorage.setItem("accessToken", data.data.newToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }

        console.log("Refresh token thành công:", {
          newToken: data.data.newToken,
          newRefreshToken: data.data.refreshToken,
        });

        await retryCallback();
        resolve();
      } catch (error) {
        console.error("Refresh token thất bại:", error);
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("refreshToken");
        // localStorage.removeItem("authData");
        // document.cookie =
        //   "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        // document.cookie =
        //   "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        // window.location.href = "/login";
        reject(error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    });

    await refreshPromise;
  };

  const fetchPoints = async () => {
    try {
      setLoadingPoints(true);
      setErrorPoints(null);

      const userId = getUserId();
      if (!userId) {
        setErrorPoints("Vui lòng đăng nhập để xem điểm thưởng");
        return;
      }
      const accessToken = getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/api/users/points/${userId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(fetchPoints);
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể tải thông tin điểm");
      }

      const data = await response.json();
      setPointsData(data);
    } catch (error) {
      console.error("Lỗi tải điểm thưởng:", error);
      if (error instanceof Error) {
        setErrorPoints(`Không thể tải thông tin điểm: ${error.message}`);
      } else {
        setErrorPoints("Không thể tải thông tin điểm: Lỗi không xác định");
      }
    } finally {
      setLoadingPoints(false);
    }
  };

  const fetchPointHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();
      const accessToken = getAccessToken();
      if (!userId) {
        setError("Vui lòng đăng nhập để xem lịch sử điểm thưởng!");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/points-history/of-user/${userId}?page-number=${currentPage}&page-size=10&order-by=${orderBy}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(fetchPointHistory);
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể tải lịch sử điểm thưởng");
      }

      const data: PointHistoryResponse = await response.json();
      const formattedHistory = data.pagedList.map((item) => ({
        id: item.id,
        ofUser: item.ofUser,
        description: item.description,
        amount: item.amount,
        content: item.content,
        pointType: item.pointType,
        createdAt: item.createdAt,
      }));

      setHistory(formattedHistory);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Lỗi tải lịch sử điểm thưởng:", error);
      if (error instanceof Error) {
        setError(`Không thể tải lịch sử điểm thưởng: ${error.message}`);
      } else {
        setError("Không thể tải lịch sử điểm thưởng: Lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPoints();
      await fetchPointHistory();
    };
    fetchData();
  }, [currentPage, orderBy]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPointTypeLabel = (pointType: string) => {
    switch (pointType) {
      case "contribution_point":
        return "Điểm đóng góp";
      case "personal_point":
        return "Điểm cá nhân";
      default:
        return pointType;
    }
  };

  const formatPoints = (points: number) => {
    return new Intl.NumberFormat("vi-VN").format(points) + " điểm";
  };

  const formatHistoryEntry = (entry: PointHistory) => {
    return `${entry.content}`;
  };

  const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Banner
        title="Lịch Sử Điểm Thưởng"
        subtitle="Theo dõi và quản lý điểm thưởng của bạn tại StrateZone"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Points Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {loadingPoints ? (
            <div className="flex justify-center items-center h-20">
              <Spinner className="h-8 w-8 text-blue-500" />
            </div>
          ) : errorPoints ? (
            <Typography variant="h6" className="text-red-600 text-center">
              {errorPoints}
            </Typography>
          ) : pointsData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center sm:text-left">
                <Typography
                  variant="h6"
                  className="text-gray-700 font-semibold"
                >
                  Tổng điểm cá nhân
                </Typography>
                <Typography variant="h4" className="text-blue-600 font-bold">
                  {formatPoints(pointsData.points)}
                </Typography>
              </div>
              <div className="text-center sm:text-left">
                <Typography
                  variant="h6"
                  className="text-gray-700 font-semibold"
                >
                  Tổng điểm đóng góp
                </Typography>
                <Typography variant="h4" className="text-blue-600 font-bold">
                  {formatPoints(pointsData.contributionPoints || 0)}
                </Typography>
              </div>
            </div>
          ) : (
            <Typography variant="h6" className="text-gray-600 text-center">
              Không có dữ liệu điểm
            </Typography>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <Typography
            variant="h3"
            className="text-gray-800 font-bold mb-4 sm:mb-0"
          >
            Lịch Sử Điểm Thưởng
          </Typography>
          <div className="flex items-center gap-3">
            <label htmlFor="orderBy" className="text-gray-700 font-medium">
              Sắp xếp theo:
            </label>
            <select
              id="orderBy"
              value={orderBy}
              onChange={handleOrderByChange}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 transition duration-200 text-black"
            >
              <option value="created-at-desc">Mới nhất</option>
              <option value="created-at">Cũ nhất</option>
              <option value="amount">Điểm cao nhất</option>
              <option value="amount-desc">Điểm thấp nhất</option>
            </select>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner className="h-12 w-12 text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Typography variant="h6" className="text-red-600">
              {error}
            </Typography>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <Typography variant="h6" className="text-gray-600">
              Không có lịch sử điểm thưởng
            </Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <Typography
                      variant="h6"
                      className="text-gray-800 font-semibold"
                    >
                      {formatHistoryEntry(entry)}
                    </Typography>
                    <Typography className="text-sm text-gray-600 mt-1">
                      Loại điểm: {getPointTypeLabel(entry.pointType)}
                    </Typography>
                    {entry.description && (
                      <Typography className="text-sm text-gray-600 mt-1">
                        Mô tả: {entry.description}
                      </Typography>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-semibold ${
                        entry.amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {entry.amount >= 0 ? "+" : ""}
                      {entry.amount} điểm
                    </span>
                    <Typography className="text-sm text-gray-500 mt-1">
                      {new Date(entry.createdAt).toLocaleString("vi-VN", {
                        hour12: false,
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RewardHistoryPage;
