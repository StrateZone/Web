// app/[locale]/notifications/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface Notification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tablesAppointmentId?: number | null;
  orderId?: number | null;
  tournamentId?: number | null;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { locale } = useParams();
  const router = useRouter();

  const getUserId = () => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    return authData.userId;
  };

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = getUserId();
        if (!userId) {
          throw new Error("User ID not found");
        }

        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/notifications/users/${userId}?page-number=${page}&page-size=10`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setNotifications(data.pagedList);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.tablesAppointmentId) {
      router.push(
        `/${locale}/chess_appointment/${notification.tablesAppointmentId}`
      );
    } else if (notification.orderId) {
      router.push(`/${locale}/orders/${notification.orderId}`);
    } else if (notification.tournamentId) {
      router.push(`/${locale}/tournament/${notification.tournamentId}`);
    } else {
      router.push(`/${locale}/notification/${notification.id}`);
    }
  };

  return (
    <div>
      <div>
        <Navbar></Navbar>
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
              Cửa hàng cờ StrateZone
            </h2>
            <p className="sm:text-xl text-lg text-center text-gray-200">
              Nâng tầm chiến thuật - Trang bị như một kiện tướng!
            </p>
          </div>
        </div>
        <div className="container mx-auto py-8 text-black">
          <Typography variant="h2" className="mb-6">
            Thông báo
          </Typography>

          {loading ? (
            <div className="text-center py-8">Đang tải thông báo...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Typography variant="h5">Không có thông báo</Typography>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Typography variant="h5" className="font-semibold">
                    {notification.title}
                  </Typography>
                  <Typography className="mt-2 text-gray-700">
                    {notification.content}
                  </Typography>
                  <Typography className="mt-2 text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </div>
              ))}

              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  variant="outlined"
                >
                  Trước
                </Button>
                <Typography>
                  Trang {page} / {totalPages}
                </Typography>
                <Button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  variant="outlined"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default NotificationsPage;
