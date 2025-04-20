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
  type: number; // 0-4
  status: number; // 1: unread, 0: read
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
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
          return; // Không throw error nếu không có userId
        }

        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/notifications/users/${userId}?page-number=1&page-size=8`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          return; // Không throw error nếu response không ok
        }

        const data = await response.json();
        const latestNotifications = data.pagedList.map((item: any) => ({
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

        setNotifications(latestNotifications);
        const unread = latestNotifications.filter(
          (n: Notification) => n.status === 1
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Không set error state để không hiển thị thông báo lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedNotifications([]);
    }
  };

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotifications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 1) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, status: 0 } : n))
      );
      setUnreadCount((prev) => prev - 1);
    }

    setIsOpen(false);

    switch (notification.type) {
      case 0:
        router.push(`/${locale}/appointment_history`);
        break;
      case 1:
      // router.push(`/${locale}/orders/${notification.orderId}`);
      // break;
      case 2:
        router.push(`/${locale}/appointment_history`);
        break;
      case 3:
        router.push(`/${locale}/chess_appointment/invitation_list`);
        break;
      case 4:
        router.push(`/${locale}/chess_appointment/send_invitation_list`);
        break;
      case 5:
        router.push(`/${locale}/chess_appointment/send_invitation_list`);
        break;
      case 6:
        router.push(`/${locale}/friend_list`);
        break;
      case 7:
        router.push(`/${locale}/friend_list`);
        break;
      default:
        router.push(`/${locale}/appointment_history`);
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
        }
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
        `https://backend-production-ac5e.up.railway.app/api/notifications/read-all/${userId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: 0 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const isLongContent = (content: string) => content.length > 50;
  const truncateContent = (content: string) =>
    content.length > 50 ? `${content.substring(0, 50)}...` : content;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none relative"
      >
        <BellIcon className="h-6 w-6 text-blue-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <Typography variant="h6" className="font-bold text-gray-800">
                Thông báo
              </Typography>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {loading ? (
              <div className="px-4 py-4 text-center">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-4 text-center text-gray-500">
                Không có thông báo mới
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${notification.status === 1 ? "bg-blue-50" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div>
                      <Typography
                        variant="small"
                        className={`font-semibold ${notification.status === 1 ? "text-blue-800" : "text-gray-800"}`}
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
                          onClick={(e) => toggleExpand(notification.id, e)}
                          className="text-blue-500 text-xs mt-1 hover:underline focus:outline-none"
                        >
                          {expandedNotifications.includes(notification.id)
                            ? "Thu gọn"
                            : "Xem thêm"}
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Typography
                        variant="small"
                        className="text-xs text-gray-400"
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                      {notification.status === 1 && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
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
