"use client";
import React, { useState, useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { DefaultPagination } from "@/components/pagination";

interface PointHistory {
  id: number;
  ofUser: number;
  description: string | null;
  amount: number;
  content: string;
  pointType: string;
  createdAt: string;
}

const RewardHistoryPage = () => {
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { locale } = useParams();

  const getUserId = () => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    return authData.userId;
  };

  useEffect(() => {
    const fetchPointHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = getUserId();
        if (!userId) {
          setError("Vui lòng đăng nhập để xem lịch sử điểm thưởng");
          return;
        }

        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/points-history/of-user/${userId}?page-number=${currentPage}&page-size=10`,
          {
            headers: {
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể tải lịch sử điểm thưởng");
        }

        const data = await response.json();

        const formattedHistory = data.pagedList.map((item: any) => ({
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
        console.error("Error fetching point history:", error);
        setError("Đã xảy ra lỗi khi tải lịch sử điểm thưởng");
      } finally {
        setLoading(false);
      }
    };

    fetchPointHistory();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPointTypeLabel = (pointType: string) => {
    switch (pointType) {
      case "contribution_point":
        return "Điểm đóng góp";
      case "regular_point":
        return "Điểm thường";
      default:
        return pointType;
    }
  };

  return (
    <div>
      <Navbar />
      {/* Background Banner */}
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="min-h-[400px] relative z-30 h-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-5xl text-3xl font-bold mb-6">
            Lịch Sử Điểm Thưởng
          </h2>
          <p className="sm:text-xl text-lg text-center text-gray-200">
            Theo dõi điểm thưởng của bạn tại StrateZone
          </p>
        </div>
      </div>
      <div className="container mx-auto py-8 text-black">
        <Typography variant="h2" className="mb-6">
          Lịch Sử Điểm Thưởng
        </Typography>

        {loading ? (
          <div className="text-center py-8">
            Đang tải lịch sử điểm thưởng...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Typography variant="h5" className="text-red-600">
              {error}
            </Typography>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="h5">Không có lịch sử điểm thưởng</Typography>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <Typography
                      variant="h5"
                      className="font-semibold text-gray-800"
                    >
                      {entry.content}
                    </Typography>
                    <span
                      className={`text-sm font-semibold ${
                        entry.amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {entry.amount >= 0 ? "+" : ""}
                      {entry.amount} điểm
                    </span>
                  </div>
                  <Typography className="mt-2 text-sm text-gray-600">
                    Loại điểm: {getPointTypeLabel(entry.pointType)}
                  </Typography>
                  {entry.description && (
                    <Typography className="mt-1 text-sm text-gray-600">
                      Mô tả: {entry.description}
                    </Typography>
                  )}
                  <Typography className="mt-2 text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RewardHistoryPage;
