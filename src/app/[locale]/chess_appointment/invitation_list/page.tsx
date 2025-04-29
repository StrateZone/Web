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
import { fetchWallet } from "@/app/[locale]/wallet/walletSlice";
import { ConfirmPaymentPopup } from "./ConfirmPaymentPopup";
import { InsufficientBalancePopup } from "../chess_appointment_order/InsufficientBalancePopup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Banner from "@/components/banner/banner";
import { AlreadyRejectedPopup } from "./AcceptedByOtherPopup";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { SuccessPaymentPopup } from "./SuccessPaymentPopup";

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
  tablesAppointmentStatus: string;
  endTime: string;
  expireAt: string;
  createdAt: string;
  totalPrice: number | null;
  fromUserNavigation: UserNavigation;
  toUserNavigation: any | null;
  table: Table;
  appointment: any | null;
}

const MySwal = withReactContent(Swal);

const AppointmentRequestsPage = () => {
  const router = useRouter();
  const localActive = useLocale();
  const { locale } = useParams();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AppointmentRequest | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refundInfo, setRefundInfo] = useState<any>(null);
  const [currentCancellingId, setCurrentCancellingId] = useState<number | null>(
    null
  );
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(
    null
  );
  const [processingAcceptId, setProcessingAcceptId] = useState<number | null>(
    null
  );

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
        const userId = getUserId();
        if (!userId) {
          router.push(`/${locale}/login`);
          return;
        }

        const apiUrl = new URL(
          `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/to/${userId}`
        );
        apiUrl.searchParams.append("page-number", page.toString());
        apiUrl.searchParams.append("page-size", pageSize.toString());
        apiUrl.searchParams.append("order-by", "created-at-desc");

        const response = await fetch(apiUrl.toString(), {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointment requests");
        }

        const data = await response.json();
        setRequests(data.pagedList || []);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setHasPrevious(data.hasPrevious);
        setHasNext(data.hasNext);
      } catch (error) {
        console.error("Error fetching appointment requests:", error);
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

  const rejectAppointment = async (requestId: number) => {
    setProcessingRequestId(requestId);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/reject/${requestId}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject appointment");
      }

      await fetchAppointmentRequests(currentPage);
    } catch (err) {
      console.error("Error rejecting appointment:", err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleProcessPayment = async (requestId: number) => {
    setProcessingAcceptId(requestId);
    try {
      const request = requests.find((req) => req.id === requestId);
      if (!request || !request.appointmentId) {
        throw new Error("Request not found or invalid appointment ID");
      }

      if (balance < (request.totalPrice || 0)) {
        const isRedirect = await InsufficientBalancePopup({
          finalPrice:
            requests.find((req) => req.id === requestId)?.totalPrice || 0,
        });
        if (isRedirect) {
          router.push(`/${localActive}/wallet`);
        }
        return;
      }

      const tableInfo = {
        tableId: request.tableId,
        roomName: request.table.roomName,
        gameType:
          request.table.gameTypeId === 1
            ? "Cờ Vua"
            : request.table.gameTypeId === 2
              ? "Cờ Tướng"
              : "Cờ Vây",
        roomType: request.table.roomType,
        startTime: request.startTime,
        endTime: request.endTime,
        totalPrice: request.totalPrice || 0,
        opponentName:
          request.fromUserNavigation.fullName ||
          request.fromUserNavigation.username,
      };

      const isConfirmed = await ConfirmPaymentPopup({
        tableInfo: {
          ...tableInfo,
          opponentRank: request.fromUserNavigation.ranking?.toString() || "N/A",
        },
        currentBalance: balance,
      });

      if (!isConfirmed) {
        setIsProcessingPayment(false);
        return;
      }
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/payments/booking-request-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromUser: request.fromUser,
            toUser: request.toUser,
            tableId: request.tableId,
            appointmentId: request.appointmentId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.message === "Balance is not enough") {
          const isRedirect = await InsufficientBalancePopup({
            finalPrice: request.totalPrice || 0,
          });
          if (isRedirect) {
            router.push(`/${localActive}/wallet`);
          }
          return;
        }

        throw new Error(result.message || "Payment processing failed");
      }

      dispatch(fetchWallet(userId));
      await fetchAppointmentRequests(currentPage);

      // Call the SuccessPaymentPopup utility function
      await SuccessPaymentPopup(request.totalPrice || 0);
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || JSON.stringify(error);

      if (
        errorMessage.includes(
          "This appointment invitation is no longer available."
        ) ||
        errorMessage.includes("This appointment is already cancelled")
      ) {
        const request = requests.find((req) => req.id === requestId);
        if (request) {
          await AlreadyRejectedPopup({
            opponentName:
              request.fromUserNavigation.username ||
              request.fromUserNavigation.fullName,
            tableId: request.tableId,
            startTime: request.startTime,
            endTime: request.endTime,
            onConfirm: () => fetchAppointmentRequests(currentPage), // Truyền callback
          });
        }
      } else {
        console.error("Unexpected payment error:", error);
        await MySwal.fire({
          title: "Lỗi",
          text:
            typeof errorMessage === "string" ? errorMessage : "Có lỗi xảy ra",
          icon: "error",
          confirmButtonText: "OK",
        });
        await fetchAppointmentRequests(currentPage);
      }
    } finally {
      setProcessingAcceptId(null);
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

  function toLocalISOString(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    return localDate.toISOString().slice(0, -1);
  }

  const checkCancelCondition = async (tablesAppointmentId: number) => {
    try {
      setIsLoading(true);
      const currentTime = toLocalISOString(new Date());

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/tables-appointment/cancel-check/${tablesAppointmentId}/users/${userId}?CancelTime=${currentTime}`
      );

      if (!response.ok) {
        throw new Error("Không thể kiểm tra điều kiện hủy");
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
      setCurrentCancellingId(tablesAppointmentId);
      setShowCancelConfirm(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi kiểm tra điều kiện hủy"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancelAppointment = async () => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const userId = authData.userId;

    if (!currentCancellingId || !userId) {
      console.error("Missing currentCancellingId or userId");
      setShowCancelConfirm(false);
      return;
    }

    try {
      setIsCancelling(true); // Set isCancelling to true to show loading state in modal
      setIsLoading(true); // Maintain global loading state
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/tables-appointment/cancel/${currentCancellingId}/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        setShowCancelConfirm(false);
        throw new Error("Hủy đơn đặt không thành công");
      }

      await dispatch(fetchWallet(userId));
      await fetchAppointmentRequests(currentPage);

      setShowCancelConfirm(false);
      setCurrentCancellingId(null);
      if (selectedRequest) setSelectedRequest(null);

      const refundAmount = responseData.price;
      const isConfirmed = await SuccessCancelPopup(refundAmount);

      if (isConfirmed) {
        router.push(`/${localActive}/chess_appointment/invitation_list`);
      } else {
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (err) {
      setShowCancelConfirm(false);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsCancelling(false); // Reset isCancelling after operation
      setIsLoading(false); // Reset global loading state
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
        title="Lời Mời Đã Nhận"
        subtitle="Xem lại các lời mời đánh cờ bạn đã nhận"
      />

      <div className="min-h-[calc(100vh-200px)] bg-gray-50 p-4 text-black">
        <div className="container mx-auto px-2 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Những Lời Mời Bạn Đã Nhận Từ Người Khác
            </h1>
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

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedRequest ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleBackToList}
                className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                ← <strong>Quay Lại</strong>
              </button>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Thông Tin Chi Tiết Của Lời Mời Đánh Cờ
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
                    <strong>Thông Tin Người Gửi</strong>
                  </h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge
                      overlap="circular"
                      placement="bottom-end"
                      className={`border-2 border-white ${
                        isMember(selectedRequest.fromUserNavigation.userRole)
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse !h-5 !w-5"
                          : isTopContributor(
                                selectedRequest.fromUserNavigation.userLabel
                              )
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 !h-5 !w-5"
                            : "bg-blue-gray-100"
                      }`}
                      content={
                        isMember(selectedRequest.fromUserNavigation.userRole) ||
                        isTopContributor(
                          selectedRequest.fromUserNavigation.userLabel
                        ) ? (
                          <div className="relative group flex gap-1">
                            {isMember(
                              selectedRequest.fromUserNavigation.userRole
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
                          isMember(selectedRequest.fromUserNavigation.userRole)
                            ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                            : isTopContributor(
                                  selectedRequest.fromUserNavigation.userLabel
                                )
                              ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/20"
                              : ""
                        }`}
                      >
                        {selectedRequest.fromUserNavigation.avatarUrl ? (
                          <img
                            src={selectedRequest.fromUserNavigation.avatarUrl}
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
                            isMember(
                              selectedRequest.fromUserNavigation.userRole
                            )
                              ? "text-purple-600"
                              : isTopContributor(
                                    selectedRequest.fromUserNavigation.userLabel
                                  )
                                ? "text-yellow-600"
                                : ""
                          }`}
                        >
                          {selectedRequest.fromUserNavigation.username ||
                            selectedRequest.fromUserNavigation.fullName ||
                            "Người dùng ẩn danh"}
                        </h4>
                        {isMember(
                          selectedRequest.fromUserNavigation.userRole
                        ) && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            MEMBER
                          </span>
                        )}
                        {isTopContributor(
                          selectedRequest.fromUserNavigation.userLabel
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
                          : "Nữ"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">
                        <strong>Email:</strong>
                      </span>{" "}
                      {selectedRequest.fromUserNavigation.email ||
                        "Không có thông tin"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Số Điện Thoại:</strong>
                      </span>{" "}
                      {selectedRequest.fromUserNavigation.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">
                        <strong>Giới Thiệu:</strong>
                      </span>{" "}
                      {selectedRequest.fromUserNavigation.bio || "Không đề cập"}
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
                              "Unknown"}
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
                            : "Unknown"}
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
                <strong>Bạn chưa nhận được lời mời đánh cờ nào</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {requests.map((request) => {
                  const isProcessing =
                    processingAcceptId === request.id ||
                    processingRequestId === request.id ||
                    (isRejecting &&
                      request.tablesAppointmentId === currentCancellingId);

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
                              isMember(request.fromUserNavigation.userRole)
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 !h-5 !w-5 animate-pulse"
                                : isTopContributor(
                                      request.fromUserNavigation.userLabel
                                    )
                                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 !h-5 !w-5"
                                  : "bg-blue-gray-100"
                            }`}
                            content={
                              isMember(request.fromUserNavigation.userRole) ||
                              isTopContributor(
                                request.fromUserNavigation.userLabel
                              ) ? (
                                <div className="relative group flex gap-1">
                                  {isMember(
                                    request.fromUserNavigation.userRole
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
                                isMember(request.fromUserNavigation.userRole)
                                  ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                                  : isTopContributor(
                                        request.fromUserNavigation.userLabel
                                      )
                                    ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/20"
                                    : ""
                              }`}
                            >
                              {request.fromUserNavigation.avatarUrl ? (
                                <img
                                  src={request.fromUserNavigation.avatarUrl}
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
                                  isMember(request.fromUserNavigation.userRole)
                                    ? "text-purple-600"
                                    : isTopContributor(
                                          request.fromUserNavigation.userLabel
                                        )
                                      ? "text-yellow-600"
                                      : ""
                                }`}
                              >
                                Người Gửi: @
                                {request.fromUserNavigation.username ||
                                  request.fromUserNavigation.fullName ||
                                  "Người dùng ẩn danh"}
                              </h3>
                              {isMember(
                                request.fromUserNavigation.userRole
                              ) && (
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  MEMBER
                                </span>
                              )}
                              {isTopContributor(
                                request.fromUserNavigation.userLabel
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
                                : "Nữ"}
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
                            <strong>Giờ Bắt Đầu Và Kết Thúc</strong>{" "}
                            {formatTimeRange(
                              request.startTime,
                              request.endTime
                            )}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Số Tiền Cần Trả</strong>{" "}
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
                              <>
                                <Button
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[100px]"
                                  onClick={() =>
                                    handleProcessPayment(request.id)
                                  }
                                  disabled={
                                    isProcessing || isExpired(request.expireAt)
                                  }
                                >
                                  {processingAcceptId === request.id ? (
                                    <>
                                      <Loader2 className="animate-spin mr-1 h-3 w-3" />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "Chấp Nhận Và Thanh Toán"
                                  )}
                                </Button>
                                <Button
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[80px]"
                                  onClick={() => rejectAppointment(request.id)}
                                  disabled={isProcessing}
                                >
                                  {processingRequestId === request.id ? (
                                    <>
                                      <Loader2 className="animate-spin mr-1 h-3 w-3" />
                                      Đang Xử Lý
                                    </>
                                  ) : (
                                    "Từ Chối"
                                  )}
                                </Button>
                              </>
                            )}
                          {request.status === "accepted" &&
                            !isExpired(request.expireAt) &&
                            request.tablesAppointmentStatus !== "incoming" && (
                              <Button
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[80px]"
                                onClick={() =>
                                  checkCancelCondition(
                                    request.tablesAppointmentId!
                                  )
                                }
                                disabled={isProcessing}
                              >
                                {isRejecting &&
                                request.tablesAppointmentId ===
                                  currentCancellingId ? (
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

              {requests.length > 0 && (
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
        onConfirm={confirmCancelAppointment}
        refundInfo={refundInfo}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default AppointmentRequestsPage;
