// components/notification_dropdown.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/solid";
import { useParams, useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tablesAppointmentId?: number | null;
  orderId?: number | null;
  tournamentId?: number | null;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>(
    []
  );
  const router = useRouter();
  const { locale } = useParams();

  const getUserId = () => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    return authData.userId;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = getUserId();
        if (!userId) {
          throw new Error("User ID not found");
        }

        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/notifications/users/${userId}?page-number=1&page-size=5`,
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
        console.log("Fetched notifications:", data);
        const latestNotifications = data.pagedList.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          createdAt: item.createdAt,
          tablesAppointmentId: item.tablesAppointmentId,
          orderId: item.orderId,
          tournamentId: item.tournamentId,
        }));

        setNotifications(latestNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedNotifications([]); // Reset expanded state khi mở dropdown mới
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedNotifications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    markAsRead(notification.id);

    if (notification.tablesAppointmentId) {
      router.push(
        `/${locale}/chess_appointment/${notification.tablesAppointmentId}`
      );
    } else if (notification.orderId) {
      router.push(`/${locale}/orders/${notification.orderId}`);
    } else if (notification.tournamentId) {
      router.push(`/${locale}/tournament/${notification.tournamentId}`);
    }
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

  // Hàm kiểm tra nội dung có dài không (quá 100 ký tự)
  const isLongContent = (content: string) => content.length > 100;

  // Hàm rút gọn nội dung
  const truncateContent = (content: string) => {
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none relative"
      >
        <BellIcon className="h-6 w-6 text-blue-700" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
              <Typography variant="h6" className="font-bold text-gray-800">
                Thông báo
              </Typography>
            </div>

            {loading ? (
              <div className="px-4 py-4 text-center">Đang tải...</div>
            ) : error ? (
              <div className="px-4 py-4 text-center text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-4 text-center text-gray-500">
                Không có thông báo mới
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 border-b border-gray-100"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Typography
                        variant="small"
                        className="font-semibold text-gray-800"
                      >
                        {notification.title}
                      </Typography>
                    </div>
                    <div className="mt-1">
                      <Typography variant="small" className="text-gray-600">
                        {expandedNotifications.includes(notification.id)
                          ? notification.content
                          : truncateContent(notification.content)}
                      </Typography>
                      {isLongContent(notification.content) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(notification.id);
                          }}
                          className="text-blue-500 text-xs mt-1 hover:underline focus:outline-none"
                        >
                          {expandedNotifications.includes(notification.id)
                            ? "Thu gọn"
                            : "Xem thêm"}
                        </button>
                      )}
                    </div>
                    <Typography
                      variant="small"
                      className="text-xs text-gray-400 mt-1"
                    >
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <Link href={`/${locale}/notification`} passHref>
                <Button
                  variant="text"
                  color="blue"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
