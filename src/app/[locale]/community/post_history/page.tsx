"use client";

import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import {
  Button,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { InsufficientBalancePopup } from "../../chess_appointment/chess_appointment_order/InsufficientBalancePopup";
import DOMPurify from "dompurify";
import TermsDialog from "../../chess_appointment/chess_category/TermsDialog";
import { MembershipUpgradeDialog } from "../MembershipUpgradeDialog ";
import axios from "axios";

// Interface for user data from /api/users/${userId}
interface User {
  userId: number;
  username: string;
  avatarUrl: string;
  fullName?: string;
}

interface Thread {
  threadId: number;
  createdBy: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  rating: number;
  likesCount: number;
  commentsCount: number;
  isUserLiked: boolean;
  updateOfThread: null;
  status:
    | "pending"
    | "published"
    | "rejected"
    | "deleted"
    | "drafted"
    | "hidden"
    | "edit_pending";
  createdAt: string;
  updatedAt: string | null;
  comments: Comment[];
  createdByNavigation: null;
  images: any[];
  likes: Array<{
    id: number;
    userId: number | null;
    threadId: number | null;
  }>;
  threadsTags: {
    id: number;
    threadId: number;
    tagId: number;
    tag: {
      tagId: number;
      tagName: string;
      status: string;
      allowedRole: string;
      tagColor: string;
    };
  }[];
}

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
}

interface ApiResponse {
  pagedList: Thread[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface MembershipPrice {
  id: number;
  price1: number;
  unit: string;
}

function BlogHistory() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });
  const [userCache, setUserCache] = useState<{ [key: number]: User }>({}); // Cache for user data
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openHideDialog, setOpenHideDialog] = useState(false);
  const [openShowDialog, setOpenShowDialog] = useState(false);
  const [threadIdToDelete, setThreadIdToDelete] = useState<number | null>(null);
  const [threadIdToHide, setThreadIdToHide] = useState<number | null>(null);
  const [threadIdToShow, setThreadIdToShow] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [membershipPrice, setMembershipPrice] =
    useState<MembershipPrice | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const pageSize = 10;
  const { locale } = useParams();
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

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
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token?refreshToken=${encodeURIComponent(
            refreshToken
          )}`,
          {},
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Không thể làm mới token");
        }

        const data = response.data;
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

        reject(error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    });

    await refreshPromise;
  };

  function getTagColor(tagName: string): string {
    const colorMap: Record<string, string> = {
      "cờ vua": "#000000",
      "cờ tướng": "#8B0000",
      "cờ vây": "#343434",
      "chiến thuật": "#6A0DAD",
      gambit: "#DC143C",
      mẹo: "#DAA520",
      "thảo luận": "#3CB371",
      "trò chuyện": "#87CEFA",
      "ngoài lề": "#A9A9A9",
      "thông báo": "#1E90FF",
      "quan trọng": "#ff2200",
    };
    return colorMap[tagName.toLowerCase()] || "#6B7280";
  }

  function getContrastColor(hexColor: string) {
    if (!hexColor || !hexColor.startsWith("#")) return "#FFFFFF";

    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch user data for a given userId
  const fetchUserData = async (userId: number): Promise<User | null> => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Không có access token, vui lòng đăng nhập lại");
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      if (response.status === 401) {
        await handleTokenExpiration(async () => {
          await fetchUserData(userId);
        });
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Lỗi lấy dữ liệu người dùng ${userId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const checkUserMembership = () => {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        setIsLoggedIn(false);
        setInitialLoading(false);
        return;
      }

      try {
        setIsLoggedIn(true);
        const authData = JSON.parse(authDataString);
        if (authData && authData.userId) {
          setUserId(authData.userId);
          setUserRole(authData.userRole);
          setCurrentUser({
            userId: authData.userId,
            fullName: authData.userInfo?.fullName || "",
            avatarUrl: authData.userInfo?.avatarUrl || "",
          });

          if (authData.userRole === "RegisteredUser") {
            fetchMembershipPrice();
            setShowMembershipDialog(true);
          }
        } else {
          throw new Error("Dữ liệu xác thực không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi phân tích dữ liệu xác thực:", error);
        setIsLoggedIn(false);
        setError("Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.");
        toast.error("Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.");
        router.push(`/${locale}/login`);
      } finally {
        setInitialLoading(false);
      }
    };

    checkUserMembership();
  }, [locale, router]);

  const fetchMembershipPrice = async () => {
    try {
      setError("");
      const response = await axios.get(
        `${API_BASE_URL}/api/prices/membership`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(fetchMembershipPrice);
        return;
      }

      setMembershipPrice(response.data);
    } catch (error) {
      console.error("Lỗi lấy giá thành viên:", error);
      setError(error.response?.data?.message || "Không thể tải giá thành viên");
      toast.error(
        error.response?.data?.message ||
          "Không thể tải giá thành viên. Vui lòng thử lại."
      );
    }
  };

  const handleMembershipPayment = async () => {
    if (!userId) return;

    setPaymentProcessing(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/membership-payment/${userId}`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(handleMembershipPayment);
        return;
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Thanh toán thất bại");
      }

      const userData = localStorage.getItem("authData");
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          userRole: "Member",
          ...(user.userInfo && {
            userInfo: {
              ...user.userInfo,
              userRole: "Member",
            },
          }),
        };

        localStorage.setItem("authData", JSON.stringify(updatedUser));
        setUserRole("Member");
        setShowMembershipDialog(false);

        toast.success(
          <div>
            <h3 className="font-bold">Nâng cấp thành công!</h3>
            <p>Bạn đã có thể xem và quản lý lịch sử bài viết</p>
          </div>,
          {
            autoClose: 3000,
            closeButton: true,
          }
        );
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      setError(error.response?.data?.message || "Thanh toán thất bại");
      if (error.message && error.message.includes("Balance is not enough")) {
        try {
          const shouldNavigate = await InsufficientBalancePopup({
            finalPrice: membershipPrice?.price1,
          });

          if (shouldNavigate) {
            router.push(`/${locale}/wallet`);
          }
        } catch (swalError) {
          console.error("Lỗi popup:", swalError);
        }
      } else {
        Swal.fire({
          title: "Lỗi",
          text: error.response?.data?.message || "Đã xảy ra lỗi khi thanh toán",
          icon: "error",
          confirmButtonText: "Đóng",
        });
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCloseDialog = () => {
    setShowMembershipDialog(false);
  };

  useEffect(() => {
    const fetchThreadsAndUsers = async () => {
      if (!userId || userRole !== "Member") return;

      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(
          `${API_BASE_URL}/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (response.status === 401) {
          await handleTokenExpiration(fetchThreadsAndUsers);
          return;
        }

        const data: ApiResponse = response.data;
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);

        // Fetch user data for unique createdBy IDs
        const uniqueUserIds = [
          ...new Set(data.pagedList.map((thread) => thread.createdBy)),
        ];
        const newUserCache: { [key: number]: User } = { ...userCache };
        for (const id of uniqueUserIds) {
          if (!newUserCache[id]) {
            const userData = await fetchUserData(id);
            if (userData) {
              newUserCache[id] = userData;
            }
          }
        }
        setUserCache(newUserCache);
      } catch (error) {
        console.error("Lỗi lấy danh sách bài viết:", error);
        setError(
          error.response?.data?.message || "Không thể tải danh sách bài viết"
        );
        toast.error(
          error.response?.data?.message ||
            "Không thể tải danh sách bài viết. Vui lòng thử lại.",
          {
            style: {
              background: "#FFEBEE",
              color: "#D32F2F",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "12px",
            },
          }
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadsAndUsers();
  }, [userId, currentPage, userRole]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Công Khai
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Chờ Xét Duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Đã Từ Chối
          </span>
        );
      case "deleted":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Đã Bị Xóa
          </span>
        );
      case "drafted":
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Bản Nháp
          </span>
        );
      case "hidden":
        return (
          <span className="bg-gray-600 text-white text-xs font-medium px-2.5 py-0.5 rounded">
            Đã Ẩn
          </span>
        );
      case "edit_pending":
        return (
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Chờ Chỉnh Sửa Duyệt
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Không Xác Định
          </span>
        );
    }
  };

  const handleDelete = (threadId: number) => {
    setThreadIdToDelete(threadId);
    setOpenDeleteDialog(true);
  };

  const handleHide = (threadId: number) => {
    setThreadIdToHide(threadId);
    setOpenHideDialog(true);
  };

  const handleShow = (threadId: number) => {
    setThreadIdToShow(threadId);
    setOpenShowDialog(true);
  };

  const confirmDelete = async () => {
    if (!threadIdToDelete || !userId) return;

    setIsDeleting(true);
    try {
      setError("");
      const response = await axios.delete(
        `${API_BASE_URL}/api/threads/${threadIdToDelete}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(confirmDelete);
        return;
      }

      try {
        const fetchResponse = await axios.get(
          `${API_BASE_URL}/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (fetchResponse.status === 401) {
          await handleTokenExpiration(confirmDelete);
          return;
        }

        const data: ApiResponse = fetchResponse.data;
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        if (data.pagedList.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        toast.success("Xóa bài viết thành công!", {
          style: {
            background: "#E6F4EA",
            color: "#2E7D32",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      } catch (error) {
        console.error("Lỗi làm mới danh sách bài viết:", error);
        toast.success(
          "Xóa bài viết thành công nhưng không thể làm mới danh sách.",
          {
            style: {
              background: "#E6F4EA",
              color: "#2E7D32",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "12px",
            },
          }
        );
        setThreads((prevThreads) =>
          prevThreads.filter((thread) => thread.threadId !== threadIdToDelete)
        );
        setTotalCount((prev) => prev - 1);
        if (threads.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error("Lỗi xóa bài viết:", error);
      setError(
        error.response?.data?.message || "Đã xảy ra lỗi khi xóa bài viết"
      );
      toast.error(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại.",
        {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        }
      );
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      setThreadIdToDelete(null);
    }
  };

  const confirmHide = async () => {
    if (!threadIdToHide || !userId) return;

    setIsHiding(true);
    try {
      setError("");
      const response = await axios.put(
        `${API_BASE_URL}/api/threads/hide/${threadIdToHide}`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(confirmHide);
        return;
      }

      try {
        const fetchResponse = await axios.get(
          `${API_BASE_URL}/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (fetchResponse.status === 401) {
          await handleTokenExpiration(confirmHide);
          return;
        }

        const data: ApiResponse = fetchResponse.data;
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        if (data.pagedList.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        toast.success("Ẩn bài viết thành công!", {
          style: {
            background: "#E6F4EA",
            color: "#2E7D32",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      } catch (error) {
        console.error("Lỗi làm mới danh sách bài viết:", error);
        toast.success(
          "Ẩn bài viết thành công nhưng không thể làm mới danh sách.",
          {
            style: {
              background: "#E6F4EA",
              color: "#2E7D32",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "12px",
            },
          }
        );
        setThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.threadId === threadIdToHide
              ? { ...thread, status: "hidden" }
              : thread
          )
        );
      }
    } catch (error) {
      console.error("Lỗi ẩn bài viết:", error);
      setError(
        error.response?.data?.message || "Đã xảy ra lỗi khi ẩn bài viết"
      );
      toast.error(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi ẩn bài viết. Vui lòng thử lại.",
        {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        }
      );
    } finally {
      setIsHiding(false);
      setOpenHideDialog(false);
      setThreadIdToHide(null);
    }
  };

  const confirmShow = async () => {
    if (!threadIdToShow || !userId) return;

    setIsShowing(true);
    try {
      setError("");
      const response = await axios.put(
        `${API_BASE_URL}/api/threads/show/${threadIdToShow}`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(confirmShow);
        return;
      }

      try {
        const fetchResponse = await axios.get(
          `${API_BASE_URL}/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (fetchResponse.status === 401) {
          await handleTokenExpiration(confirmShow);
          return;
        }

        const data: ApiResponse = fetchResponse.data;
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        if (data.pagedList.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        toast.success("Hiển thị bài viết thành công!", {
          style: {
            background: "#E6F4EA",
            color: "#2E7D32",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      } catch (error) {
        console.error("Lỗi làm mới danh sách bài viết:", error);
        toast.success(
          "Hiển thị bài viết thành công nhưng không thể làm mới danh sách.",
          {
            style: {
              background: "#E6F4EA",
              color: "#2E7D32",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "12px",
            },
          }
        );
        setThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.threadId === threadIdToShow
              ? { ...thread, status: "published" }
              : thread
          )
        );
      }
    } catch (error) {
      console.error("Lỗi hiển thị bài viết:", error);
      setError(
        error.response?.data?.message || "Đã xảy ra lỗi khi hiển thị bài viết"
      );
      toast.error(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi hiển thị bài viết. Vui lòng thử lại.",
        {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        }
      );
    } finally {
      setIsShowing(false);
      setOpenShowDialog(false);
      setThreadIdToShow(null);
    }
  };

  const handleLike = async (
    threadId: number,
    isLiked: boolean,
    likeId?: number
  ) => {
    if (!currentUser.userId) return;

    try {
      setError("");
      if (isLiked && likeId) {
        const response = await axios.delete(
          `${API_BASE_URL}/api/likes/${likeId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (response.status === 401) {
          await handleTokenExpiration(() =>
            handleLike(threadId, isLiked, likeId)
          );
          return;
        }

        setThreads((prevThreads) =>
          prevThreads.map((thread) => {
            if (thread.threadId === threadId) {
              return {
                ...thread,
                likesCount: thread.likesCount - 1,
                likes: thread.likes.filter((like) => like.id !== likeId),
              };
            }
            return thread;
          })
        );
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/likes`,
          {
            userId: currentUser.userId,
            threadId: threadId,
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (response.status === 401) {
          await handleTokenExpiration(() =>
            handleLike(threadId, isLiked, likeId)
          );
          return;
        }

        const data = response.data;
        setThreads((prevThreads) =>
          prevThreads.map((thread) => {
            if (thread.threadId === threadId) {
              return {
                ...thread,
                likesCount: thread.likesCount + 1,
                likes: [...thread.likes, data],
              };
            }
            return thread;
          })
        );
      }
    } catch (error) {
      console.error("Lỗi thực hiện hành động thích:", error);
      setError(
        error.response?.data?.message ||
          "Không thể thực hiện hành động thích bài viết"
      );
      toast.error(
        error.response?.data?.message ||
          "Không thể thực hiện hành động thích bài viết. Vui lòng thử lại.",
        {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        }
      );
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    const plainText = content.replace(/<[^>]+>/g, "");
    if (plainText.length <= maxLength) return content;
    const truncatedText = plainText.substring(0, maxLength);
    return truncatedText + "...";
  };

  const nonDraftThreads = threads.filter(
    (thread) => thread.status !== "drafted"
  );
  const draftThreads = threads.filter((thread) => thread.status === "drafted");
  const displayedThreads = activeTab === "all" ? nonDraftThreads : draftThreads;

  if (initialLoading || isLoggedIn === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <Typography variant="h4" className="mb-6 text-gray-800 font-bold">
              Vui lòng đăng nhập để xem lịch sử bài viết
            </Typography>
            <Typography variant="paragraph" className="mb-8 text-gray-600">
              Bạn cần đăng nhập để xem và quản lý các bài viết của bạn trên
              StrateZone.
            </Typography>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.push(`/${locale}/login`)}
                color="blue"
                size="lg"
                className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => router.push(`/${locale}/register`)}
                variant="outlined"
                color="blue"
                size="lg"
                className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      <Banner
        title="Lịch Sử Bài Viết"
        subtitle="Xem lại và quản lý các bài viết bạn đã đăng, đang chờ duyệt hoặc bị từ chối"
      />

      <MembershipUpgradeDialog
        open={showMembershipDialog}
        onClose={handleCloseDialog}
        onUpgrade={handleMembershipPayment}
        membershipPrice={membershipPrice || undefined}
        paymentProcessing={paymentProcessing}
      />

      {userRole === "Member" ? (
        <div className="container mx-auto px-4 py-8 flex-grow">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography variant="h2" color="blue-gray" className="mb-2">
                    Những Bài Viết Của Bạn ({totalCount})
                  </Typography>
                  <Typography variant="paragraph" color="gray">
                    Trạng thái của tất cả bài viết bạn đã tạo
                  </Typography>
                </div>
                <Button
                  onClick={() => setOpenTermsDialog(true)}
                  variant="outlined"
                  className="px-4 py-2"
                  disabled={isLoading}
                >
                  Xem Điều Khoản
                </Button>
              </div>

              <Tabs value={activeTab} className="mb-6">
                <TabsHeader
                  className="bg-gray-100 rounded-lg p-1"
                  indicatorProps={{
                    className: "bg-blue-500/10 rounded-lg shadow-sm",
                  }}
                >
                  <Tab
                    value="all"
                    onClick={() => setActiveTab("all")}
                    className={`py-3 px-4 font-medium text-gray-700 ${
                      activeTab === "all" ? "text-blue-600" : ""
                    }`}
                  >
                    Tất cả bài viết ({nonDraftThreads.length})
                  </Tab>
                  <Tab
                    value="drafts"
                    onClick={() => setActiveTab("drafts")}
                    className={`py-3 px-4 font-medium text-gray-700 ${
                      activeTab === "drafts" ? "text-blue-600" : ""
                    }`}
                  >
                    Bản nháp ({draftThreads.length})
                  </Tab>
                </TabsHeader>
              </Tabs>

              <div className="space-y-6">
                {displayedThreads.length === 0 ? (
                  <div className="text-center py-12">
                    <Typography variant="h6" color="gray" className="mb-4">
                      {activeTab === "all"
                        ? "Bạn chưa viết bài blog nào."
                        : "Bạn chưa có bản nháp nào."}
                    </Typography>
                    <Button
                      color="blue"
                      variant="gradient"
                      onClick={() =>
                        router.push(`/${locale}/community/create_post`)
                      }
                    >
                      {activeTab === "all"
                        ? "Viết bài blog đầu tiên"
                        : "Tạo bản nháp mới"}
                    </Button>
                  </div>
                ) : (
                  displayedThreads.map((thread) => {
                    const isLiked = thread.likes.some(
                      (like) => like.userId === currentUser.userId
                    );
                    const likeId = thread.likes.find(
                      (like) => like.userId === currentUser.userId
                    )?.id;

                    const user = userCache[thread.createdBy];
                    const truncatedContent = truncateContent(
                      thread.content,
                      400
                    );

                    return (
                      <div
                        key={thread.threadId}
                        className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-b-4 border-gray-200 hover:bg-gray-50 transition-all hover:shadow-sm"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <Typography
                                variant="h5"
                                color="blue-gray"
                                className="mb-2"
                              >
                                <Link
                                  href={`/${locale}/community/${thread.threadId}`}
                                  className="hover:text-blue-600"
                                >
                                  {thread.title}
                                </Link>
                              </Typography>
                              <div className="flex items-center space-x-4 mb-3">
                                {getStatusBadge(thread.status)}
                                <Typography
                                  variant="small"
                                  color="gray"
                                  className="font-normal"
                                >
                                  Tạo lúc: {formatDate(thread.createdAt)}
                                </Typography>
                                {thread.updatedAt && (
                                  <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal"
                                  >
                                    Lần Cuối Cập Nhật:{" "}
                                    {formatDate(thread.updatedAt)}
                                  </Typography>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={isLiked ? "filled" : "outlined"}
                                color="red"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(thread.threadId, isLiked, likeId);
                                }}
                                aria-label={
                                  isLiked ? "Unlike post" : "Like post"
                                }
                              >
                                {isLiked ? (
                                  <HeartIconSolid className="h-4 w-4" />
                                ) : (
                                  <HeartIcon className="h-4 w-4" />
                                )}
                                {thread.likesCount}
                              </Button>
                              <Button
                                variant="outlined"
                                color="blue-gray"
                                size="sm"
                                className="flex items-center gap-1"
                                aria-label="View comments"
                              >
                                <ChatBubbleOvalLeftIcon className="h-4 w-4" />
                                {thread.commentsCount}
                              </Button>
                            </div>
                          </div>

                          <div
                            className="prose text-gray-600 mb-4 white-space-nowrap overflow-x-auto max-w-[100cm] [p]:inline-block [p]:mr-2"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(truncatedContent, {
                                ADD_TAGS: ["img", "iframe", "br"],
                                ADD_ATTR: ["src", "alt", "style"],
                                FORBID_TAGS: ["br"],
                              }),
                            }}
                          />

                          {thread.threadsTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {thread.threadsTags.map((tag) => {
                                const tagColor = getTagColor(tag.tag.tagName);
                                const textColor = getContrastColor(tagColor);
                                const isImportantTag = [
                                  "thông báo",
                                  "quan trọng",
                                ].includes(tag.tag.tagName);

                                return (
                                  <span
                                    key={tag.id}
                                    className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-3 transition-all duration-200 ${
                                      isImportantTag
                                        ? "hover:scale-105"
                                        : "hover:opacity-90"
                                    }`}
                                    style={{
                                      backgroundColor: tagColor,
                                      color: textColor,
                                      transform: isImportantTag
                                        ? "scale(1.02)"
                                        : "none",
                                      border: isImportantTag
                                        ? "1px solid white"
                                        : "none",
                                      boxShadow: isImportantTag
                                        ? `0 0 5px ${tagColor}`
                                        : "none",
                                    }}
                                  >
                                    {isImportantTag && (
                                      <span className="mr-1">
                                        {tag.tag.tagName === "quan trọng"
                                          ? "⚠️"
                                          : "📢"}
                                      </span>
                                    )}
                                    {tag.tag.tagName}
                                    {isImportantTag &&
                                      tag.tag.tagName === "quan trọng" && (
                                        <span className="ml-1">⚠️</span>
                                      )}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="relative w-8 h-8 mr-2">
                                <Image
                                  src={user?.avatarUrl || "/default-avatar.png"}
                                  alt={user?.username || "Unknown User"}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <Typography
                                variant="small"
                                color="gray"
                                className="font-medium"
                              >
                                {user?.username || "Unknown User"}
                              </Typography>
                            </div>
                            <div className="flex space-x-2">
                              {thread.status !== "rejected" && (
                                <Button
                                  color="indigo"
                                  variant="gradient"
                                  size="sm"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                                  onClick={() =>
                                    router.push(
                                      `/${locale}/community/post_edit/${thread.threadId}`
                                    )
                                  }
                                  aria-label="Edit post"
                                >
                                  <PencilIcon className="h-5 w-5 text-white" />
                                  Chỉnh sửa
                                </Button>
                              )}
                              <Button
                                color="red"
                                variant="gradient"
                                size="sm"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                                onClick={() => handleDelete(thread.threadId)}
                                aria-label="Delete post"
                              >
                                <TrashIcon className="h-5 w-5 text-white" />
                                Xóa
                              </Button>
                              {thread.status !== "hidden" &&
                                thread.status !== "rejected" &&
                                thread.status !== "edit_pending" &&
                                thread.status !== "pending" &&
                                thread.status !== "drafted" && (
                                  <Button
                                    color="gray"
                                    variant="gradient"
                                    size="sm"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                                    onClick={() => handleHide(thread.threadId)}
                                    aria-label="Hide post"
                                  >
                                    <EyeSlashIcon className="h-5 w-5 text-white" />
                                    Ẩn
                                  </Button>
                                )}
                              {thread.status === "hidden" && (
                                <Button
                                  color="green"
                                  variant="gradient"
                                  size="sm"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                                  onClick={() => handleShow(thread.threadId)}
                                  aria-label="Show post"
                                >
                                  <EyeIcon className="h-5 w-5 text-white" />
                                  Hiển thị
                                </Button>
                              )}
                              <Button
                                color="teal"
                                variant="outlined"
                                size="sm"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                                onClick={() =>
                                  router.push(
                                    `/${locale}/community/${thread.threadId}`
                                  )
                                }
                                aria-label="View post details"
                              >
                                <EyeIcon className="h-5 w-5 text-teal-600 group-hover:text-teal-800" />
                                Xem chi tiết
                              </Button>
                              {thread.status === "drafted" && (
                                <Button
                                  color="blue"
                                  variant="gradient"
                                  size="sm"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                                  onClick={() =>
                                    router.push(
                                      `/${locale}/community/create_post?draftId=${thread.threadId}`
                                    )
                                  }
                                  aria-label="Create from draft"
                                >
                                  <PencilIcon className="h-5 w-5 text-white" />
                                  Tạo từ nháp
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-8">
                  <DefaultPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        !showMembershipDialog && (
          <div className="flex flex-col min-h-[calc(100vh-160px)]">
            <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 text-center">
              <div className="max-w-md mx-auto">
                <Typography
                  variant="h4"
                  className="mb-6 text-gray-800 font-bold"
                >
                  Bạn cần nâng cấp tài khoản để xem lịch sử bài viết
                </Typography>
                <Typography variant="paragraph" className="mb-8 text-gray-600">
                  Nâng cấp lên tài khoản Member để xem và quản lý các bài viết
                  của bạn
                </Typography>
                <Button
                  onClick={() => setShowMembershipDialog(true)}
                  color="blue"
                  size="lg"
                  className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Nâng cấp tài khoản
                </Button>
              </div>
            </div>
          </div>
        )
      )}

      <Dialog
        open={openDeleteDialog}
        handler={() => setOpenDeleteDialog(false)}
      >
        <DialogHeader>Xác Nhận Xóa Bài Viết</DialogHeader>
        <DialogBody divider>
          Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn
          tác.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-2"
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={confirmDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openHideDialog} handler={() => setOpenHideDialog(false)}>
        <DialogHeader>Xác Nhận Ẩn Bài Viết</DialogHeader>
        <DialogBody divider>
          Bạn có chắc chắn muốn ẩn bài viết này? Bài viết sẽ không hiển thị công
          khai nữa.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenHideDialog(false)}
            className="mr-2"
            disabled={isHiding}
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            color="gray"
            onClick={confirmHide}
            disabled={isHiding}
            className="flex items-center gap-2"
          >
            {isHiding ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Đang ẩn...
              </>
            ) : (
              "Ẩn"
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openShowDialog} handler={() => setOpenShowDialog(false)}>
        <DialogHeader>Xác Nhận Hiển Thị Bài Viết</DialogHeader>
        <DialogBody divider>
          Bạn có chắc chắn muốn hiển thị lại bài viết này? Bài viết sẽ được công
          khai trở lại.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenShowDialog(false)}
            className="mr-2"
            disabled={isShowing}
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={confirmShow}
            disabled={isShowing}
            className="flex items-center gap-2"
          >
            {isShowing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Đang hiển thị...
              </>
            ) : (
              "Hiển thị"
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      <TermsDialog
        open={openTermsDialog}
        onClose={() => setOpenTermsDialog(false)}
      />

      <ToastContainer position="top-right" />
      <Footer />
    </div>
  );
}

export default BlogHistory;
