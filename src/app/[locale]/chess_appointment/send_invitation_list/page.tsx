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
  userRole: number | string; // Support both number (1) and string ("Member") for flexibility
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
    | "payment_required"
    | "await_appointment_creation";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AppointmentRequest | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refundInfo, setRefundInfo] = useState<any>(null);
  const [currentCancellingId, setCurrentCancellingId] = useState<number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading: walletLoading } = useSelector(
    (state: RootState) => state.wallet,
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
          `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/from/${userId}`,
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
    [locale, pageSize, router],
  );

  const handleRefresh = () => {
    fetchAppointmentRequests(currentPage);
  };

  useEffect(() => {
    fetchAppointmentRequests(currentPage);
  }, [fetchAppointmentRequests]);

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
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-500",
          display: "Đã Chấp Nhận",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      case "payment_required":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-700",
          border: "border-indigo-500",
          display: "Yêu Cầu Thanh Toán",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-500",
          display: "Đã Từ Chối",
          icon: <XCircle className="w-4 h-4 mr-1" />,
        };
      case "await_appointment_creation":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600",
          border: "border-yellow-500",
          display: "Chờ Tạo Cuộc Hẹn",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
      case "expired":
        return {
          bg: "bg-orange-100",
          text: "text-orange-600",
          border: "border-orange-500",
          display: "Đã Hết Hạn",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
      case "cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-400",
          display: "Đã Hủy",
          icon: <XCircle className="w-4 h-4 mr-1" />,
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

  const confirmCancelRequest = async () => {
    if (!currentCancellingId) return;

    setIsCancelling(true);
    const previousRequests = [...requests];
    const previousSelectedRequest = selectedRequest
      ? { ...selectedRequest }
      : null;

    setRequests((prev) =>
      prev.map((req) =>
        req.id === currentCancellingId ? { ...req, status: "cancelled" } : req,
      ),
    );

    if (selectedRequest?.id === currentCancellingId) {
      setSelectedRequest((prev) =>
        prev ? { ...prev, status: "cancelled" } : null,
      );
    }

    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/cancel/${currentCancellingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel request");
      }

      setShowCancelConfirm(false);
      setCurrentCancellingId(null);
      setSelectedRequest(null);

      const isConfirmed = await SuccessCancelPopup(
        refundInfo?.refundAmount || 0,
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
      console.error("Error canceling request:", err);
    } finally {
      setIsCancelling(false);
    }
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
        return "Unknown";
    }
  };

  const isMember = (userRole: number | string) =>
    userRole === 1 || userRole === "Member";

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
              Những Lời Mời Của Bạn Đã Gửi Đi Cho Người Khác
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
                          : "bg-blue-gray-100"
                      }`}
                      content={
                        selectedRequest.toUserNavigation &&
                        isMember(selectedRequest.toUserNavigation.userRole) ? (
                          <div className="relative group">
                            <CheckBadgeIcon className="h-4 w-4 text-white" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-black text-sm p-2 rounded shadow-lg">
                              Thành viên câu lạc bộ
                            </span>
                          </div>
                        ) : null
                      }
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${
                          selectedRequest.toUserNavigation &&
                          isMember(selectedRequest.toUserNavigation.userRole)
                            ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
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
                              : ""
                          }`}
                        >
                          {selectedRequest.toUserNavigation?.username ||
                            "Người dùng ẩn danh"}
                        </h4>
                        {selectedRequest.toUserNavigation &&
                          isMember(
                            selectedRequest.toUserNavigation.userRole,
                          ) && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              MEMBER
                            </span>
                          )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        <strong>Trình Độ:</strong>{" "}
                        {getRankLevelText(
                          selectedRequest.toUserNavigation?.ranking || 0,
                        )}
                      </p>
                      {selectedRequest.toUserNavigation &&
                        isMember(selectedRequest.toUserNavigation.userRole) && (
                          <p className="text-purple-500 text-sm mt-1">
                            Thành viên câu lạc bộ
                          </p>
                        )}
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
                      "vi-VN",
                    )}
                  </p>
                  <p>
                    <span className="font-medium">
                      <strong>Thời Gian Bắt Đầu Và Kết Thúc:</strong>
                    </span>{" "}
                    {formatTimeRange(
                      selectedRequest.startTime,
                      selectedRequest.endTime,
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

              <div className="flex justify-end space-x-3"></div>
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
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`bg-white rounded-md shadow-sm p-4 border-l-4 ${
                      request.status === "accepted"
                        ? "border-green-500"
                        : request.status === "rejected"
                          ? "border-red-500"
                          : isExpired(request.expireAt) ||
                              request.status === "cancelled"
                            ? "border-gray-400"
                            : "border-blue-500"
                    }`}
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
                              : "bg-blue-gray-100"
                          }`}
                          content={
                            request.toUserNavigation &&
                            isMember(request.toUserNavigation.userRole) ? (
                              <div className="relative group">
                                <CheckBadgeIcon className="h-4 w-4 text-white" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-black text-sm p-2 rounded shadow-lg">
                                  Thành viên câu lạc bộ
                                </span>
                              </div>
                            ) : null
                          }
                        >
                          <div
                            className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${
                              request.toUserNavigation &&
                              isMember(request.toUserNavigation.userRole)
                                ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
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
                                  : ""
                              }`}
                            >
                              Người Nhận: @
                              {request.toUserNavigation?.username ||
                                "Người dùng ẩn danh"}
                            </h3>
                            {request.toUserNavigation &&
                              isMember(request.toUserNavigation.userRole) && (
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  MEMBER
                                </span>
                              )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            <strong>Trình Độ:</strong>{" "}
                            {getRankLevelText(
                              request.toUserNavigation?.ranking || 0,
                            )}
                          </p>
                          {request.toUserNavigation &&
                            isMember(request.toUserNavigation.userRole) && (
                              <p className="text-purple-500 text-sm mt-1">
                                Thành viên câu lạc bộ
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="text-center md:text-right">
                        <p className="font-medium text-sm">
                          <strong>Số Bàn:</strong> {request.tableId}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Ngày Chơi Cờ:</strong>{" "}
                          {formatDateTimeWithoutHour(request.startTime)}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Giờ Bắt Đầu Và Kết Thúc</strong>{" "}
                          {formatTimeRange(request.startTime, request.endTime)}
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
                        {request.status === "accepted" ? (
                          <span className="text-blue-700 flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <strong>Đã Chấp Nhận</strong>
                          </span>
                        ) : request.status === "payment_required" ? (
                          <span className="text-indigo-700 flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <strong>Yêu Cầu Thanh Toán</strong>
                          </span>
                        ) : request.status === "rejected" ? (
                          <span className="text-red-700 flex items-center text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            <strong>Đã Từ Chối</strong>
                          </span>
                        ) : request.status === "expired" ? (
                          <span className="text-orange-600 flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <strong>Đã Hết Hạn</strong>
                          </span>
                        ) : request.status === "cancelled" ? (
                          <span className="text-gray-600 flex items-center text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            <strong>Đã Hủy</strong>
                          </span>
                        ) : request.status === "await_appointment_creation" ? (
                          <span className="text-yellow-600 flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <strong>Chờ Tạo Cuộc Hẹn</strong>
                          </span>
                        ) : (
                          <span className="text-yellow-700 flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <strong>Chờ Phản Hồi</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          Xem Chi Tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
        onConfirm={confirmCancelRequest}
        refundInfo={refundInfo}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default AppointmentSendRequestsPage;
