"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Badge } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Loader2,
  RefreshCw,
  Circle,
  UserCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import CancelConfirmationModal from "../../appointment_history/CancelConfirmationModal";
import { SuccessCancelPopup } from "../../appointment_history/CancelSuccessPopup";
import { DefaultPagination } from "@/components/pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Banner from "@/components/banner/banner";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import TermsDialog from "../chess_category/TermsDialog";

interface UserNavigation {
  userId: number;
  cartId: number | null;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string;
  address: string;
  gender: number;
  skillLevel: number;
  points: number;
  ranking: number;
  status: string;
  userRole: number | string;
  userLabel?: string | number;
  wallet: any | null;
  otp: string | null;
  otpExpiry: string | null;
  password: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  createdAt: string;
  updatedAt: string;
  friendlistUsers: any[];
}

interface GameType {
  typeId: number;
  typeName: string;
}

interface Table {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomDescription: string;
  gameTypeId: number;
  gameType: GameType | null;
  startDate: string | null;
  endDate: string | null;
  durationInHours: number | null;
  gameTypePrice: number | null;
  roomTypePrice: number | null;
  totalPrice: number | null;
}

interface AppointmentRequest {
  id: number;
  fromUser: number;
  toUser: number;
  tableId: number;
  appointmentId: number | null;
  tablesAppointmentId: number | null;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "expired"
    | "cancelled"
    | "accepted_by_others"
    | "table_cancelled";
  startTime: string;
  endTime: string;
  expireAt: string;
  createdAt: string;
  totalPrice: number | null;
  fromUserNavigation: UserNavigation | null;
  toUserNavigation: UserNavigation | null;
  table: Table;
  appointment: any | null;
}

const MySwal = withReactContent(Swal);

const AppointmentSendRequestsPage = () => {
  const router = useRouter();
  const localActive = useLocale();
  const { locale } = useParams();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AppointmentRequest | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refundInfo, setRefundInfo] = useState<any>(null);
  const [currentCancellingId, setCurrentCancellingId] = useState<number | null>(
    null
  );
  const [processingCancelId, setProcessingCancelId] = useState<number | null>(
    null
  );
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading: walletLoading } = useSelector(
    (state: RootState) => state.wallet
  );
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
        const response = await fetch(
          `${API_BASE_URL}/api/auth/refresh-token?refreshToken=${encodeURIComponent(
            refreshToken
          )}`,
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
        // window.location.href = `/${localActive}/login`;
        reject(error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    });

    await refreshPromise;
  };

  const getUserId = () => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    return authData.userId;
  };
  const authDataString = localStorage.getItem("authData");
  const authData = JSON.parse(authDataString || "{}");
  const userId = authData.userId;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchAppointmentRequests(newPage);
    }
  };

  const fetchAppointmentRequests = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);
        setError(null);
        const userId = getUserId();
        if (!userId) {
          router.push(`/${locale}/login`);
          return;
        }

        const apiUrl = new URL(
          `${API_BASE_URL}/api/appointmentrequests/from/${userId}`
        );
        apiUrl.searchParams.append("page-number", page.toString());
        apiUrl.searchParams.append("page-size", pageSize.toString());
        apiUrl.searchParams.append("order-by", "created-at-desc");

        const response = await fetch(apiUrl.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.status === 401) {
          await handleTokenExpiration(() => fetchAppointmentRequests(page));
          return;
        }

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Không thể tải danh sách lời mời");
        }

        const data = await response.json();
        setRequests(data.pagedList || []);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setHasPrevious(data.hasPrevious);
        setHasNext(data.hasNext);
      } catch (error) {
        console.error("Lỗi khi tải danh sách lời mời:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi tải danh sách lời mời"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [locale, pageSize, router]
  );

  const handleRefresh = () => {
    fetchAppointmentRequests(currentPage);
  };

  useEffect(() => {
    fetchAppointmentRequests(currentPage);
  }, [fetchAppointmentRequests]);

  const checkCancelCondition = async (requestId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const currentTime = new Date().toISOString().slice(0, -1);

      const response = await fetch(
        `${API_BASE_URL}/api/appointmentrequests/cancel-check/${requestId}/users/${userId}?CancelTime=${currentTime}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(() => checkCancelCondition(requestId));
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể kiểm tra điều kiện hủy");
      }

      const data = await response.json();
      setRefundInfo({
        message: data.message,
        refundAmount: data.refundAmount,
        cancellationTime: data.cancellationTime,
        cancellation_Block_TimeGate: data.cancellation_Block_TimeGate,
        numerOfTablesCancelledThisWeek: data.numerOfTablesCancelledThisWeek,
        cancellation_PartialRefund_TimeGate:
          data.cancellation_PartialRefund_TimeGate,
      });
      setCurrentCancellingId(requestId);
      setShowCancelConfirm(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi kiểm tra điều kiện hủy"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancelRequest = async () => {
    if (!currentCancellingId) return;

    setIsCancelling(true);
    setProcessingCancelId(currentCancellingId);
    const previousRequests = [...requests];
    const previousSelectedRequest = selectedRequest
      ? { ...selectedRequest }
      : null;

    setRequests((prev) =>
      prev.map((req) =>
        req.id === currentCancellingId ? { ...req, status: "cancelled" } : req
      )
    );

    if (selectedRequest?.id === currentCancellingId) {
      setSelectedRequest((prev) =>
        prev ? { ...prev, status: "cancelled" } : null
      );
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointmentrequests/cancel/${currentCancellingId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(confirmCancelRequest);
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Hủy lời mời không thành công");
      }

      setShowCancelConfirm(false);
      setCurrentCancellingId(null);
      setSelectedRequest(null);

      const isConfirmed = await SuccessCancelPopup(
        refundInfo?.refundAmount || 0
      );

      if (isConfirmed) {
        router.push(`/${localActive}/appointment_history`);
      } else {
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (err) {
      setRequests(previousRequests);
      if (previousSelectedRequest) {
        setSelectedRequest(previousSelectedRequest);
      }
      console.error("Lỗi khi hủy lời mời:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi hủy lời mời");
    } finally {
      setIsCancelling(false);
      setProcessingCancelId(null);
    }
  };

  const calculateTimeRemaining = (expireAt: string) => {
    const now = new Date();
    const expireDate = new Date(expireAt);
    const diffInMs = expireDate.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return "Đã hết hạn";
    }

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const hours = diffInHours % 24;
    const minutes = diffInMinutes % 60;
    const seconds = diffInSeconds % 60;

    if (diffInDays > 0) {
      return `Hết hạn sau ${diffInDays} ngày ${hours} giờ`;
    } else if (diffInHours > 0) {
      return `Hết hạn sau ${diffInHours} giờ ${minutes} phút`;
    } else if (diffInMinutes > 0) {
      return `Hết hạn sau ${minutes} phút ${seconds} giây`;
    } else {
      return `Hết hạn sau ${seconds} giây`;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDateTimeWithoutHour = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(end).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  };

  const isExpired = (expireAt: string) => {
    return new Date(expireAt) < new Date();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-500",
          display: "Chờ Phản Hồi",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
      case "accepted":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-500",
          display: "Đã Chấp Nhận Lời Mời",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-500",
          display: "Đã Từ Chối Lời Mời",
          icon: <XCircle className="w-4 h-4 mr-1" />,
        };
      case "expired":
        return {
          bg: "bg-orange-100",
          text: "text-orange-600",
          border: "border-orange-500",
          display: "Lời Mời Đã Hết Hạn",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
      case "cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-400",
          display: "Lời Mời Đã Bị Hủy",
          icon: <XCircle className="w-4 h-4 mr-1" />,
        };
      case "accepted_by_others":
        return {
          bg: "bg-pink-100",
          text: "text-pink-700",
          border: "border-pink-500",
          display: "Lời Mời Đã Được Người Khác Chấp Nhận",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      case "table_cancelled":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-500",
          display: "Bàn đã bị hủy",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-400",
          display: status,
          icon: <Circle className="w-4 h-4 mr-1" />,
        };
    }
  };

  const handleViewDetails = (request: AppointmentRequest) => {
    setSelectedRequest(request);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
  };

  const getRankLevelText = (level: number): string => {
    switch (level) {
      case 0:
        return "Mới Bắt Đầu";
      case 1:
        return "Cấp Độ Bạc";
      case 2:
        return "Cấp Độ Vàng";
      case 3:
        return "Cấp Độ Bạch Kim";
      case 4:
        return "Expert";
      default:
        return "Không xác định";
    }
  };

  const isMember = (userRole: number | string) =>
    userRole === 1 || userRole === "Member";

  const isTopContributor = (userLabel: string | number | undefined) =>
    userLabel === "top_contributor" || userLabel === 1;

  return (
    <div>
      <Navbar />
      <Banner
        title="Lời Mời Đã Gửi"
        subtitle="Xem lại các lời mời đánh cờ bạn đã gửi đi"
      />

      <div className="min-h-[calc(100vh-200px)] bg-gray-50 p-4 text-black">
        <div className="container mx-auto px-2 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Những Lời Mời Bạn Đã Gửi Cho Người Khác
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setOpenTermsDialog(true)}
                variant="outlined"
                className="px-4 py-2"
                disabled={isLoading}
              >
                Xem Điều Khoản
              </Button>
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <strong>Làm Mới</strong>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : selectedRequest ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between space-x-4 mb-4">
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  ← <strong>Quay Lại</strong>
                </button>
                <Button
                  onClick={() => setOpenTermsDialog(true)}
                  variant="outlined"
                  className="px-4 py-2"
                  disabled={isLoading}
                >
                  Xem Điều Khoản
                </Button>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Thông Tin Chi Tiết Lời Mời
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status).bg} ${getStatusColor(selectedRequest.status).text}`}
                >
                  {getStatusColor(selectedRequest.status).display}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg mb-2 font-bold">
                    <strong>Thông Tin Người Nhận</strong>
                  </h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge
                      overlap="circular"
                      placement="bottom-end"
                      className={`border-2 border-white ${
                        selectedRequest.toUserNavigation &&
                        isMember(selectedRequest.toUserNavigation.userRole)
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse !h-5 !w-5"
                          : selectedRequest.toUserNavigation &&
                              isTopContributor(
                                selectedRequest.toUserNavigation.userLabel
                              )
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 !h-5 !w-5"
                            : "bg-blue-gray-100"
                      }`}
                      content={
                        selectedRequest.toUserNavigation &&
                        (isMember(selectedRequest.toUserNavigation.userRole) ||
                          isTopContributor(
                            selectedRequest.toUserNavigation.userLabel
                          )) ? (
                          <div className="relative group flex gap-1">
                            {isMember(
                              selectedRequest.toUserNavigation.userRole
                            ) && (
                              <div className="relative">
                                <CheckBadgeIcon className="h-4 w-4 text-white" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-black text-sm p-2 rounded shadow-lg">
                                  Thành viên câu lạc bộ
                                </span>
                              </div>
                            )}
                          </div>
                        ) : null
                      }
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${
                          selectedRequest.toUserNavigation &&
                          isMember(selectedRequest.toUserNavigation.userRole)
                            ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                            : selectedRequest.toUserNavigation &&
                                isTopContributor(
                                  selectedRequest.toUserNavigation.userLabel
                                )
                              ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/20"
                              : ""
                        }`}
                      >
                        {selectedRequest.toUserNavigation?.avatarUrl ? (
                          <img
                            src={selectedRequest.toUserNavigation.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                    </Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-bold ${
                            selectedRequest.toUserNavigation &&
                            isMember(selectedRequest.toUserNavigation.userRole)
                              ? "text-purple-600"
                              : selectedRequest.toUserNavigation &&
                                  isTopContributor(
                                    selectedRequest.toUserNavigation.userLabel
                                  )
                                ? "text-yellow-600"
                                : ""
                          }`}
                        >
                          {selectedRequest.toUserNavigation?.username ||
                            selectedRequest.toUserNavigation?.fullName ||
                            "Người dùng ẩn danh"}
                        </h4>
                        {selectedRequest.toUserNavigation &&
                          isMember(
                            selectedRequest.toUserNavigation.userRole
                          ) && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              MEMBER
                            </span>
                          )}
                        {selectedRequest.toUserNavigation &&
                          isTopContributor(
                            selectedRequest.toUserNavigation.userLabel
                          ) && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              TOP CONTRIBUTOR
                            </span>
                          )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        <strong>Giới Tính:</strong>{" "}
                        {selectedRequest.toUserNavigation?.gender === 0
                          ? "Nam"
                          : selectedRequest.toUserNavigation?.gender === 1
                            ? "Nữ"
                            : "Không xác định"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">
                        <strong>Email:</strong>
                      </span>{" "}
                      {selectedRequest.toUserNavigation?.email ||
                        "Không có thông tin"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Số Điện Thoại:</strong>
                      </span>{" "}
                      {selectedRequest.toUserNavigation?.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Giới Thiệu:</strong>
                      </span>{" "}
                      {selectedRequest.toUserNavigation?.bio || "Không đề cập"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Xếp Hạng:</strong>
                      </span>{" "}
                      {selectedRequest.toUserNavigation?.ranking
                        ? `#${selectedRequest.toUserNavigation.ranking}`
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Cấp Độ:</strong>
                      </span>{" "}
                      {selectedRequest.toUserNavigation?.skillLevel != null
                        ? getRankLevelText(
                            selectedRequest.toUserNavigation.skillLevel
                          )
                        : "Không xác định"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg mb-2 font-bold">
                    <strong>Thông Tin Bàn</strong>
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">
                        <strong>Loại Cờ:</strong>
                      </span>{" "}
                      {selectedRequest.table?.gameTypeId === 1
                        ? "Cờ Vua"
                        : selectedRequest.table?.gameTypeId === 2
                          ? "Cờ Tướng"
                          : selectedRequest.table?.gameTypeId === 3
                            ? "Cờ Vây"
                            : selectedRequest.table?.gameType?.typeName ||
                              "Không xác định"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Loại Phòng:</strong>
                      </span>{" "}
                      {selectedRequest.table?.roomType === "basic"
                        ? "Phòng Thường"
                        : selectedRequest.table?.roomType === "premium"
                          ? "Phòng Cao Cấp"
                          : selectedRequest.table?.roomType === "openspaced"
                            ? "Không Gian Mở"
                            : selectedRequest.table?.roomType ||
                              "Không xác định"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Tên Phòng:</strong>
                      </span>{" "}
                      {selectedRequest.table?.roomName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Mã Bàn:</strong>
                      </span>{" "}
                      {selectedRequest.tableId || "N/A"}
                    </p>
                    {selectedRequest.totalPrice && (
                      <p>
                        <span className="font-medium">
                          <strong>Số Tiền Cần Trả:</strong>
                        </span>{" "}
                        {selectedRequest.totalPrice.toLocaleString()} VND
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg mb-2 font-bold">
                  <strong>Thông Tin Thời Gian</strong>
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">
                      <strong>Ngày Chơi:</strong>
                    </span>{" "}
                    {new Date(selectedRequest.startTime).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p>
                    <span className="font-medium">
                      <strong>Thời Gian Bắt Đầu Và Kết Thúc:</strong>
                    </span>{" "}
                    {formatTimeRange(
                      selectedRequest.startTime,
                      selectedRequest.endTime
                    )}
                  </p>
                  <p>
                    <span className="font-medium">
                      <strong>Gửi Lời Mời Lúc:</strong>
                    </span>{" "}
                    {formatDateTime(selectedRequest.createdAt)}
                  </p>
                  {selectedRequest.expireAt && (
                    <p>
                      <span className="font-medium">
                        <strong>Lời Mời Hết Hạn Vào Lúc:</strong>
                      </span>{" "}
                      {formatDateTime(selectedRequest.expireAt)}
                      {isExpired(selectedRequest.expireAt) && (
                        <span className="ml-2 text-red-500">(Đã Hết Hạn)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {selectedRequest.status === "pending" &&
                  !isExpired(selectedRequest.expireAt) && (
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[80px]"
                      onClick={() => checkCancelCondition(selectedRequest.id)}
                      disabled={
                        isCancelling || isExpired(selectedRequest.expireAt)
                      }
                    >
                      {processingCancelId === selectedRequest.id ? (
                        <>
                          <Loader2 className="animate-spin mr-1 h-3 w-3" />
                          Đang Xử Lý
                        </>
                      ) : (
                        "Hủy"
                      )}
                    </Button>
                  )}
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-600">
                <strong>Không có lời mời nào</strong>
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                <strong>Bạn chưa gửi lời mời đánh cờ nào</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {requests.map((request) => {
                  const isProcessing = processingCancelId === request.id;
                  return (
                    <div
                      key={request.id}
                      className="bg-gray-200 rounded-md shadow-sm p-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <Badge
                            overlap="circular"
                            placement="bottom-end"
                            className={`border-2 border-white ${
                              request.toUserNavigation &&
                              isMember(request.toUserNavigation.userRole)
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 !h-5 !w-5 animate-pulse"
                                : request.toUserNavigation &&
                                    isTopContributor(
                                      request.toUserNavigation.userLabel
                                    )
                                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 !h-5 !w-5"
                                  : "bg-blue-gray-100"
                            }`}
                            content={
                              request.toUserNavigation &&
                              (isMember(request.toUserNavigation.userRole) ||
                                isTopContributor(
                                  request.toUserNavigation.userLabel
                                )) ? (
                                <div className="relative group flex gap-1">
                                  {isMember(
                                    request.toUserNavigation.userRole
                                  ) && (
                                    <div className="relative">
                                      <CheckBadgeIcon className="h-4 w-4 text-white" />
                                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-black text-sm p-2 rounded shadow-lg">
                                        Thành viên câu lạc bộ
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : null
                            }
                          >
                            <div
                              className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${
                                request.toUserNavigation &&
                                isMember(request.toUserNavigation.userRole)
                                  ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                                  : request.toUserNavigation &&
                                      isTopContributor(
                                        request.toUserNavigation.userLabel
                                      )
                                    ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/20"
                                    : ""
                              }`}
                            >
                              {request.toUserNavigation?.avatarUrl ? (
                                <img
                                  src={request.toUserNavigation.avatarUrl}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          </Badge>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-bold text-base ${
                                  request.toUserNavigation &&
                                  isMember(request.toUserNavigation.userRole)
                                    ? "text-purple-600"
                                    : request.toUserNavigation &&
                                        isTopContributor(
                                          request.toUserNavigation.userLabel
                                        )
                                      ? "text-yellow-600"
                                      : ""
                                }`}
                              >
                                Người Nhận: @
                                {request.toUserNavigation?.username ||
                                  request.toUserNavigation?.fullName ||
                                  "Người dùng ẩn danh"}
                              </h3>
                              {request.toUserNavigation &&
                                isMember(request.toUserNavigation.userRole) && (
                                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    MEMBER
                                  </span>
                                )}
                              {request.toUserNavigation &&
                                isTopContributor(
                                  request.toUserNavigation.userLabel
                                ) && (
                                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                    TOP CONTRIBUTOR
                                  </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              <strong>Giới Tính:</strong>{" "}
                              {request.toUserNavigation?.gender === 0
                                ? "Nam"
                                : request.toUserNavigation?.gender === 1
                                  ? "Nữ"
                                  : "Không xác định"}
                            </p>
                          </div>
                        </div>

                        <div className="text-center md:text-right">
                          <p className="font-medium text-sm">
                            <strong>Mã Bàn:</strong> {request.tableId}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Ngày Chơi Cờ:</strong>{" "}
                            {formatDateTimeWithoutHour(request.startTime)}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Giờ Bắt Đầu Và Kết Thúc:</strong>{" "}
                            {formatTimeRange(
                              request.startTime,
                              request.endTime
                            )}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Số Tiền Cần Trả:</strong>{" "}
                            {request.totalPrice?.toLocaleString()} VND
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Lời mời hết hạn sau:</strong>{" "}
                            {calculateTimeRemaining(request.expireAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex items-center">
                          {request.status === "pending" ? (
                            <span className="text-yellow-700 flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              <strong>Chờ Phản Hồi</strong>
                            </span>
                          ) : request.status === "accepted" ? (
                            <span className="text-green-700 flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <strong>Đã Chấp Nhận Lời Mời</strong>
                            </span>
                          ) : request.status === "accepted_by_others" ? (
                            <span className="text-pink-700 flex items-center text-sm">
                              <UserCheck className="w-4 h-4 mr-1" />
                              <strong>
                                Lời Mời Đã Được Người Khác Chấp Nhận
                              </strong>
                            </span>
                          ) : request.status === "rejected" ? (
                            <span className="text-red-700 flex items-center text-sm">
                              <XCircle className="w-4 h-4 mr-1" />
                              <strong>Đã Từ Chối Lời Mời</strong>
                            </span>
                          ) : request.status === "expired" ? (
                            <span className="text-orange-600 flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              <strong>Lời Mời Đã Hết Hạn</strong>
                            </span>
                          ) : request.status === "cancelled" ? (
                            <span className="text-gray-600 flex items-center text-sm">
                              <XCircle className="w-4 h-4 mr-1" />
                              <strong>Lời Mời Đã Bị Hủy</strong>
                            </span>
                          ) : request.status === "table_cancelled" ? (
                            <span className="text-orange-500 flex items-center text-sm">
                              <XCircle className="w-4 h-4 mr-1" />
                              <strong>Bàn Đã Bị Hủy</strong>
                            </span>
                          ) : null}
                        </div>

                        <div className="flex space-x-2">
                          {request.status === "pending" &&
                            !isExpired(request.expireAt) && (
                              <Button
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[80px]"
                                onClick={() => checkCancelCondition(request.id)}
                                disabled={
                                  isProcessing || isExpired(request.expireAt)
                                }
                              >
                                {processingCancelId === request.id ? (
                                  <>
                                    <Loader2 className="animate-spin mr-1 h-3 w-3" />
                                    Đang Xử Lý
                                  </>
                                ) : (
                                  "Hủy"
                                )}
                              </Button>
                            )}
                          <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                            onClick={() => handleViewDetails(request)}
                            disabled={isProcessing}
                          >
                            Xem Chi Tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      </div>

      <Footer />

      <CancelConfirmationModal
        show={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setCurrentCancellingId(null);
        }}
        onConfirm={confirmCancelRequest}
        refundInfo={refundInfo}
        isLoading={isCancelling}
      />

      <TermsDialog
        open={openTermsDialog}
        onClose={() => setOpenTermsDialog(false)}
      />
    </div>
  );
};

export default AppointmentSendRequestsPage;
