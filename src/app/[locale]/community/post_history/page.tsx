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
import { MembershipUpgradeDialog } from "../MembershipUpgradeDialog ";

interface Thread {
  threadId: number;
  createdBy: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  rating: number;
  likesCount: number;
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
  createdByNavigation: {
    userId: number;
    username: string;
    avatarUrl: string;
  };
  threadsTags: {
    id: number;
    tagId: number;
    tag: {
      tagId: number;
      tagName: string;
    };
  }[];
  likes: Array<{
    id: number;
    userId: number | null;
    threadId: number | null;
  }>;
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
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });
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
  const [activeTab, setActiveTab] = useState("all"); // State mới để quản lý tab
  const router = useRouter();
  const pageSize = 10;
  const { locale } = useParams();

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

  useEffect(() => {
    const checkUserMembership = () => {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        toast.error("Vui lòng đăng nhập để xem lịch sử bài viết");
        router.push(`/${locale}/login`);
        return;
      }

      try {
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
          throw new Error("Invalid auth data");
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
        toast.error("Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.");
        router.push(`/${locale}/login`);
      } finally {
        setInitialLoading(false);
      }
    };

    checkUserMembership();
  }, [router, locale]);

  const fetchMembershipPrice = async () => {
    try {
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/prices/membership"
      );
      if (!response.ok) throw new Error("Failed to fetch membership price");
      const data: MembershipPrice = await response.json();
      setMembershipPrice(data);
    } catch (error) {
      console.error("Error fetching membership price:", error);
    }
  };

  const handleMembershipPayment = async () => {
    if (!userId) return;

    setPaymentProcessing(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/payments/membership-payment/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Payment failed");
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
    } catch (error: any) {
      console.error("Payment error:", error);

      if (error.message && error.message.includes("Balance is not enough")) {
        try {
          const shouldNavigate = await InsufficientBalancePopup({
            finalPrice: membershipPrice?.price1,
          });

          if (shouldNavigate) {
            router.push(`/${locale}/wallet`);
          }
        } catch (swalError) {
          console.error("Popup error:", swalError);
        }
      } else {
        Swal.fire({
          title: "Lỗi",
          text: error.message || "Đã xảy ra lỗi khi thanh toán",
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
    const fetchThreads = async () => {
      if (!userId || userRole !== "Member") return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch threads");
        }

        const data: ApiResponse = await response.json();
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching threads:", error);
        toast.error("Không thể tải danh sách bài viết.", {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
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
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/threads/${threadIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        try {
          const fetchResponse = await fetch(
            `https://backend-production-ac5e.up.railway.app/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!fetchResponse.ok) {
            throw new Error("Failed to fetch threads after deletion");
          }
          const data: ApiResponse = await fetchResponse.json();
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
          console.error("Error refetching threads:", error);
          toast.error(
            "Xóa bài viết thành công nhưng không thể làm mới danh sách.",
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
          setThreads((prevThreads) =>
            prevThreads.filter((thread) => thread.threadId !== threadIdToDelete)
          );
          setTotalCount((prev) => prev - 1);
          if (threads.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        }
      } else {
        toast.error("Không thể xóa bài viết.", {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast.error("Đã xảy ra lỗi khi xóa bài viết.", {
        style: {
          background: "#FFEBEE",
          color: "#D32F2F",
          fontWeight: "500",
          borderRadius: "8px",
          padding: "12px",
        },
      });
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
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/threads/hide/${threadIdToHide}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        try {
          const fetchResponse = await fetch(
            `https://backend-production-ac5e.up.railway.app/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!fetchResponse.ok) {
            throw new Error("Failed to fetch threads after hiding");
          }
          const data: ApiResponse = await fetchResponse.json();
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
          console.error("Error refetching threads:", error);
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
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Không thể ẩn bài viết.", {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      }
    } catch (error) {
      console.error("Error hiding thread:", error);
      toast.error("Đã xảy ra lỗi khi ẩn bài viết.", {
        style: {
          background: "#FFEBEE",
          color: "#D32F2F",
          fontWeight: "500",
          borderRadius: "8px",
          padding: "12px",
        },
      });
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
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/threads/show/${threadIdToShow}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        try {
          const fetchResponse = await fetch(
            `https://backend-production-ac5e.up.railway.app/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!fetchResponse.ok) {
            throw new Error("Failed to fetch threads after showing");
          }
          const data: ApiResponse = await fetchResponse.json();
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
          console.error("Error refetching threads:", error);
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
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Không thể hiển thị bài viết.", {
          style: {
            background: "#FFEBEE",
            color: "#D32F2F",
            fontWeight: "500",
            borderRadius: "8px",
            padding: "12px",
          },
        });
      }
    } catch (error) {
      console.error("Error showing thread:", error);
      toast.error("Đã xảy ra lỗi khi hiển thị bài viết.", {
        style: {
          background: "#FFEBEE",
          color: "#D32F2F",
          fontWeight: "500",
          borderRadius: "8px",
          padding: "12px",
        },
      });
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
      if (isLiked && likeId) {
        await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${likeId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/likes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: currentUser.userId,
              threadId: threadId,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
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
        } else {
          throw new Error("Failed to like thread");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Không thể thực hiện hành động thích bài viết.", {
        style: {
          background: "#FFEBEE",
          color: "#D32F2F",
          fontWeight: "500",
          borderRadius: "8px",
          padding: "12px",
        },
      });
    }
  };

  // Lọc danh sách thread cho tab "Bản nháp"
  const draftThreads = threads.filter((thread) => thread.status === "drafted");

  // Danh sách thread hiển thị dựa trên tab đang chọn
  const displayedThreads = activeTab === "all" ? threads : draftThreads;

  if (initialLoading) {
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Typography variant="h2" color="blue-gray" className="mb-2">
                  Những Bài Viết Của Bạn ({totalCount})
                </Typography>
                <Typography variant="paragraph" color="gray">
                  Trạng thái của tất cả bài viết bạn đã tạo
                </Typography>
              </div>

              {/* Tabs */}
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
                    Tất cả bài viết ({threads.length})
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
                                {thread.comments.length}
                              </Button>
                            </div>
                          </div>

                          <Typography
                            variant="paragraph"
                            color="gray"
                            className="mb-4 line-clamp-2"
                          >
                            {thread.content}
                          </Typography>

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
                                  src={
                                    thread.createdByNavigation.avatarUrl ||
                                    "/default-avatar.png"
                                  }
                                  alt={thread.createdByNavigation.username}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <Typography
                                variant="small"
                                color="gray"
                                className="font-medium"
                              >
                                {thread.createdByNavigation.username}
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

      <ToastContainer position="top-right" />
      <Footer />
    </div>
  );
}

export default BlogHistory;
