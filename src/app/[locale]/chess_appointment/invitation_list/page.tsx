"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@material-tailwind/react";
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
import { SuccessCancelPopup } from "../chess_appointment_order/CancelSuccessPopup";
import { DefaultPagination } from "@/components/pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import { fetchWallet } from "@/app/[locale]/wallet/walletSlice";
import { ConfirmPaymentPopup } from "./ConfirmPaymentPopup";
import { InsufficientBalancePopup } from "../chess_appointment_order/InsufficientBalancePopup";

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
  userRole: number;
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
  fromUserNavigation: UserNavigation;
  toUserNavigation: any | null;
  table: Table;
  appointment: any | null;
}

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const AppointmentRequestsPage = () => {
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

  const handleAcceptRequest = async (requestId: number) => {
    setIsAccepting(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/accept/${requestId}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to accept appointment request");

      const data = await response.json();
      console.log("Accept response:", data);
      await fetchAppointmentRequests(currentPage);
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsAccepting(false);
    }
  };
  const checkCancelCondition = async (requestId: number) => {
    setIsRejecting(true);
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
        throw new Error("Failed to check cancel condition");
      }

      const data = await response.json();
      console.log("Cancel condition response:", data);
      await fetchAppointmentRequests(currentPage);
    } catch (err) {
      console.error("Error checking cancel condition:", err);
    } finally {
      setIsRejecting(false);
    }
  };
  const handleProcessPayment = async (requestId: number) => {
    setIsProcessingPayment(true);

    try {
      const request = requests.find((req) => req.id === requestId);
      if (!request || !request.appointmentId) {
        throw new Error("Request not found or invalid appointment ID");
      }

      // Kiểm tra số dư trước khi thực hiện thanh toán
      if (balance < (request.totalPrice || 0)) {
        const isRedirect = await InsufficientBalancePopup({
          finalPrice: request.totalPrice || 0,
        });
        if (isRedirect) {
          router.push(`/${localActive}/wallet`);
        }
        return;
      }

      // ... (phần chuẩn bị thông tin và xác nhận thanh toán)
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
        opponentRank: getRankLevelText(request.fromUserNavigation.ranking),
      };

      // Hiển thị popup xác nhận thanh toán
      const isConfirmed = await ConfirmPaymentPopup({
        tableInfo,
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

      // Kiểm tra kết quả trả về từ server
      if (!response.ok || !result.success) {
        // Xử lý riêng trường hợp số dư không đủ
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

      // Cập nhật state và hiển thị thông báo thành công
      dispatch(fetchWallet(userId));
      await fetchAppointmentRequests(currentPage);

      await MySwal.fire({
        title: "Thành công!",
        text: `Thanh toán ${(request.totalPrice || 0).toLocaleString()}đ thành công.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Payment error:", error);

      // Chỉ hiển thị thông báo lỗi nếu không phải lỗi số dư
      if (
        !(
          error instanceof Error &&
          error.message.includes("Balance is not enough")
        )
      ) {
        await MySwal.fire({
          title: "Lỗi",
          text:
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi không xác định",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setIsProcessingPayment(false);
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
      hour12: false, // dùng định dạng 24 giờ
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
          display: "Hoàn Thành Thanh Toán",
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
          display: "Chờ Đối Phương Tạo Cuộc Hẹn",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
      case "cancelled":
      case "expired":
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
        `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/cancel/${currentCancellingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel request");
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

  return (
    <div>
      <div>
        <Navbar></Navbar>
        <div className="relative ">
          <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
          <img
            src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
            alt="Banner Image"
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
          <div className="min-h-[400px] relative z-30 h-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
            <h2 className="sm:text-5xl text-3xl font-bold mb-6">
              <strong>Chess Appointment Requests</strong>
            </h2>
            <p className="sm:text-xl text-lg text-center text-gray-200">
              <strong>Manage your chess game invitations</strong>
            </p>
          </div>
        </div>

        <div className="min-h-[calc(100vh-200px)] bg-gray-50 p-4 text-black">
          <div className="container mx-auto px-2 py-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Lời Mời Đánh Cờ</h1>
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
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                      <div>
                        <h4 className="font-bold">
                          {selectedRequest.fromUserNavigation.fullName ||
                            selectedRequest.fromUserNavigation.username}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          <strong>Trình Độ:</strong>{" "}
                          {getRankLevelText(
                            selectedRequest.fromUserNavigation.ranking
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">
                          <strong>Email:</strong>
                        </span>{" "}
                        {selectedRequest.fromUserNavigation.email}
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
                        {selectedRequest.fromUserNavigation.bio ||
                          "Không đề cập"}
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
                          <strong>Số Phòng:</strong>
                        </span>{" "}
                        {selectedRequest.table?.roomId}
                      </p>
                      <p>
                        <span className="font-medium">
                          <strong>Số Bàn:</strong>
                        </span>{" "}
                        {selectedRequest.tableId}
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
                          <span className="ml-2 text-red-500">
                            (Đã Hết Hạn)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {/* {selectedRequest.status === "pending" &&
                    !isExpired(selectedRequest.expireAt) && (
                      <>
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center justify-center min-w-[180px]"
                          onClick={() =>
                            handleAcceptRequest(selectedRequest.id)
                          }
                          disabled={isAccepting}
                        >
                          {isAccepting ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                              Processing...
                            </>
                          ) : (
                            <strong>Chấp Nhận</strong>
                          )}
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center justify-center min-w-[100px]"
                          onClick={() =>
                            checkCancelCondition(selectedRequest.id)
                          }
                          disabled={isRejecting}
                        >
                          {isRejecting ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                              Processing...
                            </>
                          ) : (
                            <strong>Từ Chối</strong>
                          )}
                        </Button>
                      </>
                    )} */}

                  {(selectedRequest.status === "payment_required" ||
                    selectedRequest.status === "await_appointment_creation") &&
                    selectedRequest.appointmentId &&
                    !isExpired(selectedRequest.expireAt) && (
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex items-center justify-center min-w-[150px]"
                        onClick={() => handleProcessPayment(selectedRequest.id)}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Processing...
                          </>
                        ) : (
                          <strong>Thanh Toán Ngay</strong>
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
                  <strong>No appointment requests</strong>
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  <strong>
                    You don't have any chess appointment requests yet
                  </strong>
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className={`bg-white rounded-md shadow-sm p-4 border-l-4 ${
                        request.status === "accepted" ||
                        request.status === "payment_required"
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
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                          <div>
                            <h3 className="font-bold text-base">
                              {request.fromUserNavigation.fullName ||
                                request.fromUserNavigation.username}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              <strong>Trình Độ:</strong>{" "}
                              {getRankLevelText(
                                request.fromUserNavigation.ranking
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-center md:text-right">
                          <p className="font-medium text-sm">
                            <strong>Số Bàn:</strong> {request.tableId}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {formatDateTime(request.startTime)}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {formatTimeRange(
                              request.startTime,
                              request.endTime
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex items-center">
                          {request.status === "accepted" ? (
                            <span className="text-blue-700 flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <strong>Hoàn Thành Thanh Toán</strong>
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
                          ) : request.status ===
                            "await_appointment_creation" ? (
                            <span className="text-yellow-600 flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              <strong>Chờ Đối Phương Tạo Cuộc Hẹn</strong>
                            </span>
                          ) : isExpired(request.expireAt) ||
                            request.status === "cancelled" ? (
                            <span className="text-gray-600 flex items-center text-sm">
                              <XCircle className="w-4 h-4 mr-1" />
                              <strong>Đã Hủy</strong>
                            </span>
                          ) : (
                            <span className="text-yellow-700 flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              <strong>Chờ Phản Hồi</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {request.status === "pending" &&
                            !isExpired(request.expireAt) && (
                              <>
                                <Button
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[100px]"
                                  onClick={() =>
                                    handleAcceptRequest(request.id)
                                  }
                                  disabled={isAccepting}
                                >
                                  {isAccepting ? (
                                    <>
                                      <Loader2 className="animate-spin mr-1 h-3 w-3" />
                                      Processing...
                                    </>
                                  ) : (
                                    "Chấp Nhận"
                                  )}
                                </Button>
                                <Button
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[80px]"
                                  onClick={() =>
                                    checkCancelCondition(request.id)
                                  }
                                  disabled={isRejecting}
                                >
                                  {isRejecting ? (
                                    <>
                                      <Loader2 className="animate-spin mr-1 h-3 w-3" />
                                      Processing...
                                    </>
                                  ) : (
                                    "Từ Chối"
                                  )}
                                </Button>
                              </>
                            )}

                          {(request.status === "await_appointment_creation" ||
                            request.status === "payment_required") &&
                            request.appointmentId &&
                            !isExpired(request.expireAt) && (
                              <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm flex items-center justify-center min-w-[100px]"
                                onClick={() => handleProcessPayment(request.id)}
                                disabled={isProcessingPayment}
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <Loader2 className="animate-spin mr-1 h-3 w-3" />
                                    Processing...
                                  </>
                                ) : (
                                  "Thanh Toán Ngay"
                                )}
                              </Button>
                            )}

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

        <Footer></Footer>

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
    </div>
  );
};

export default AppointmentRequestsPage;
