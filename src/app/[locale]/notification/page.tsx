// app/[locale]/notifications/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { DefaultPagination } from "@/components/pagination";

interface Notification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tablesAppointmentId?: number | null;
  orderId?: number | null;
  tournamentId?: number | null;
  type: number; // 0-4
  status: number; // 1: unread, 0: read
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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
          return;
        }

        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/notifications/users/${userId}?page-number=${currentPage}&page-size=10`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const formattedNotifications = data.pagedList.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          createdAt: item.createdAt,
          tablesAppointmentId: item.tablesAppointmentId,
          orderId: item.orderId,
          tournamentId: item.tournamentId,
          type: item.type,
          status: item.status,
        }));

        setNotifications(formattedNotifications);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/notifications/read/${notificationId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (!response.ok) {
        console.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/notifications/users/${userId}/mark-all-as-read`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: 0 })));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 1) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, status: 0 } : n)),
      );
    }

    switch (notification.type) {
      case 0:
        router.push(`/${locale}/appointment_history`);
        break;
      case 1:
        // router.push(`/${locale}/orders/${notification.orderId}`);
        break;
      case 2:
        router.push(`/${locale}/appointment_history`);
        break;
      case 3:
        router.push(`/${locale}chess_appointment/invitation_list`);
        break;
      case 4:
        router.push(`/${locale}/chess_appointment/send_invitation_list`);
        break;
      default:
        router.push(`/${locale}/chess_appointment/appointment_history`);
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
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h2">Thông báo</Typography>
            <Button
              color="blue"
              size="sm"
              onClick={markAllAsRead}
              disabled={!notifications.some((n) => n.status === 1)}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Typography variant="h5">Không có thông báo</Typography>
            </div>
          ) : (
            <div>
              <div className="space-y-4 mb-6">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                      notification.status === 1
                        ? "bg-blue-50 border-blue-200"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <Typography
                        variant="h5"
                        className={`font-semibold ${
                          notification.status === 1
                            ? "text-blue-800"
                            : "text-gray-800"
                        }`}
                      >
                        {notification.title}
                      </Typography>
                      {notification.status === 1 && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                      )}
                    </div>
                    <div className="mt-2">
                      <Typography className="text-gray-700 whitespace-pre-line">
                        {notification.content}
                      </Typography>
                    </div>
                    <Typography className="mt-2 text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
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
        <Footer></Footer>
      </div>
    </div>
  );
};

export default NotificationsPage;
