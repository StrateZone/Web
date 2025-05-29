"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import React, { useState, useEffect } from "react";
import { fetchWallet } from "@/app/[locale]/wallet/walletSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import CancelConfirmationModal from "../appointment_history/CancelConfirmationModal";
import { SuccessCancelPopup } from "../appointment_history/CancelSuccessPopup";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Banner from "@/components/banner/banner";
import OpponentDetailsPopup from "./OpponentDetailsPopup";
import { Button } from "@material-tailwind/react";
import TermsDialog from "../chess_appointment/chess_category/TermsDialog";
import { toast } from "react-toastify";

// Interfaces remain unchanged
interface GameType {
  typeId: number;
  typeName: string;
  gameExtensions: any[];
}

interface Table {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomDescription: string;
  gameTypeId: number;
  gameType: GameType;
  startDate: string | null;
  endDate: string | null;
  gameTypePrice: number | null;
  roomTypePrice: number | null;
  durationInHours: number | null;
  totalPrice: number | null;
}

interface TablesAppointment {
  id: number;
  tableId: number;
  appointmentId: number;
  status: string;
  scheduleTime: string;
  endTime: string;
  durationInHours: number;
  price: number;
  createdAt: string;
  table: Table;
  paidForOpponent: boolean;
  note: string;
}

interface User {
  userId: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  skillLevel: string;
  ranking: string;
  userRole?: number | string;
}

interface AppointmentRequest {
  id: number;
  fromUser: number;
  toUser: number[];
  status: string;
  tableId: number;
  appointmentId: number;
  startTime: string;
  endTime: string;
  expireAt: string;
  createdAt: string;
  totalPrice: number;
  toUserNavigation: User;
}

interface Appointment {
  appointmentId: number;
  userId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  tablesCount: number;
  isMonthlyAppointment: boolean;
  user: null | {
    userId: number;
    name: string;
    email: string;
  };
  tablesAppointments: TablesAppointment[];
  appointmentrequests: AppointmentRequest[];
}

interface ApiResponse {
  pagedList: Appointment[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface RefundInfo {
  message: string;
  refundAmount: number;
  cancellationTime: string;
  cancellation_Block_TimeGate: string;
  cancellation_PartialRefund_TimeGate: string;
  isExtended: boolean; // Added isExtended to the interface
}

function Page() {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [orderBy, setOrderBy] = useState("created-at-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse>({
    pagedList: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  });
  const router = useRouter();
  const localActive = useLocale();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
  const [currentCancellingId, setCurrentCancellingId] = useState<number | null>(
    null
  );
  const [showOpponentDetails, setShowOpponentDetails] = useState(false);
  const [currentOpponentRequests, setCurrentOpponentRequests] = useState<
    AppointmentRequest[]
  >([]);
  const [currentTableId, setCurrentTableId] = useState<number | null>(null);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  const authDataString = localStorage.getItem("authData");
  const authData = JSON.parse(authDataString || "{}");
  const userId = authData.userId;
  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading: walletLoading } = useSelector(
    (state: RootState) => state.wallet
  );
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";
  const [currentScheduleTime, setCurrentScheduleTime] = useState<string | null>(
    null
  );
  // Fetch paginated list of appointments
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = new URL(
        `${API_BASE_URL}/api/appointments/users/${userId}`
      );
      apiUrl.searchParams.append("page-number", currentPage.toString());
      apiUrl.searchParams.append("page-size", pageSize.toString());
      apiUrl.searchParams.append("order-by", orderBy);

      const response = await fetch(apiUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể tải dữ liệu đơn đặt");
      }

      const result: ApiResponse = await response.json();
      setData(result);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setHasPrevious(result.hasPrevious);
      setHasNext(result.hasNext);
    } catch (err) {
      console.error("Lỗi tải dữ liệu đơn đặt:", err);
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch appointment details by ID
  const handleAppointmentClick = async (appointment: Appointment) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointment.appointmentId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể tải chi tiết đơn đặt");
      }

      const result: Appointment = await response.json();
      setSelectedAppointment(result);
    } catch (err) {
      console.error("Lỗi tải chi tiết đơn đặt:", err);
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải chi tiết"
      );
      setSelectedAppointment(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, orderBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
    );
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleBackToList = () => {
    setSelectedAppointment(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
        `${API_BASE_URL}/api/tables-appointment/cancel-check/${tablesAppointmentId}/users/${userId}?CancelTime=${currentTime}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
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
        isExtended: data.tablesAppointmentModel.isExtended,

        cancellation_PartialRefund_TimeGate:
          data.cancellation_PartialRefund_TimeGate,
      });
      setCurrentCancellingId(tablesAppointmentId);
      setShowCancelConfirm(true);
    } catch (err) {
      console.error("Lỗi kiểm tra điều kiện hủy:", err);
      setError(
        err instanceof Error ? err.message : "Lỗi khi kiểm tra điều kiện hủy"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancelAppointment = async () => {
    if (!currentCancellingId || !userId) {
      console.error("Thiếu currentCancellingId hoặc userId");
      setError("Thiếu thông tin để hủy đơn đặt");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/tables-appointment/cancel/${currentCancellingId}/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Hủy đơn đặt không thành công");
      }

      const responseData = await response.json();
      dispatch(fetchWallet(userId));

      await fetchData();
      setShowCancelConfirm(false);
      setCurrentCancellingId(null);
      if (selectedAppointment) setSelectedAppointment(null);

      const refundAmount = responseData.price;
      const isConfirmed = await SuccessCancelPopup(refundAmount);

      if (isConfirmed) {
        router.push(`/${localActive}/appointment_history`);
      } else {
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (err) {
      console.error("Lỗi hủy đơn đặt:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          display: "Đang chờ thanh toán",
        };
      case "confirmed":
        return {
          bg: "bg-cyan-100",
          text: "text-cyan-800",
          display: "Đã thanh toán",
        };
      case "incoming":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          display: "Sắp diễn ra",
        };
      case "expired":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          display: "Hết hạn",
        };
      case "completed":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          display: "Đã Hoàn thành",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          display: "Đã hủy",
        };
      case "refunded":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          display: "Đã hoàn tiền",
        };
      case "unfinished":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          display: "Không hoàn thành",
        };
      case "checked_in":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          display: "Đã điểm danh",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          display: status,
        };
    }
  };

  const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value);
    setCurrentPage(1);
  };

  const handleShowOpponentDetails = (
    requests: AppointmentRequest[],
    tableId: number,
    scheduleTime: string
  ) => {
    console.log("handleShowOpponentDetails input:", {
      tableId,
      scheduleTime,
      requests,
      tablesAppointments: selectedAppointment?.tablesAppointments,
    });

    const targetTableAppointment = selectedAppointment?.tablesAppointments.find(
      (ta) => ta.table.tableId === tableId && ta.scheduleTime === scheduleTime
    );

    if (!targetTableAppointment) {
      console.error("No table appointment found for:", {
        tableId,
        scheduleTime,
      });
      setCurrentOpponentRequests([]);
      setCurrentTableId(tableId);
      setCurrentScheduleTime(null);
      setShowOpponentDetails(true);
      return;
    }

    const filteredRequests = requests.filter(
      (req) =>
        req.tableId === tableId &&
        req.startTime === scheduleTime &&
        req.endTime === targetTableAppointment.endTime
    );

    console.log("Data passed to OpponentDetailsPopup:", {
      filteredRequests,
      tableId,
      tableAppointmentStatus: targetTableAppointment.status,
      appointmentId: selectedAppointment?.appointmentId,
      startTime: targetTableAppointment.scheduleTime,
      endTime: targetTableAppointment.endTime,
    });

    setCurrentOpponentRequests(filteredRequests);
    setCurrentTableId(tableId);
    setCurrentScheduleTime(scheduleTime);
    setShowOpponentDetails(true);
  };

  return (
    <div>
      <div>
        <Navbar />
        <div className="text-black">
          <Banner
            title="Những Cuộc Hẹn Đã Diễn Ra Của Bạn Tại StrateZone"
            subtitle="Xem lại các lần bạn đã tham gia thi đấu tại StrateZone"
          />

          <div className="container mx-auto px-12 py-8 max-w-full">
            {" "}
            <h1 className="text-3xl font-bold mb-8">Lịch Sử Đặt Hẹn</h1>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="orderBy" className="font-medium">
                  Sắp xếp theo:
                </label>
                <select
                  id="orderBy"
                  value={orderBy}
                  onChange={handleOrderByChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="created-at-desc">Mới nhất</option>
                  <option value="created-at">Cũ nhất</option>
                  <option value="total-price-desc">Giá cao nhất</option>
                  <option value="total-price">Giá thấp nhất</option>
                </select>
              </div>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
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
            ) : selectedAppointment ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between space-x-4 mb-4">
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    ← Quay lại danh sách
                  </button>
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => setOpenTermsDialog(true)}
                      variant="outlined"
                      className="px-4 py-2"
                      disabled={isLoading}
                    >
                      Xem Điều Khoản
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    Chi tiết đơn đặt #{selectedAppointment.appointmentId}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg mb-2 font-bold">Thông Tin Chung</h3>
                    <p className="mb-2">
                      <span className="font-medium">Trạng Thái:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded ${getStatusColor(selectedAppointment.status).bg} ${getStatusColor(selectedAppointment.status).text}`}
                      >
                        {getStatusColor(selectedAppointment.status).display}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Tổng Giá:</span>{" "}
                      {formatCurrency(selectedAppointment.totalPrice)}
                    </p>
                    <p>
                      <span className="font-medium">Ngày Tạo Đơn:</span>{" "}
                      {formatDate(selectedAppointment.createdAt)}
                    </p>
                  </div>
                </div>

                <h3 className="font-medium text-lg mb-2">
                  Danh sách bàn đã đặt
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">Mã đặt bàn</th>
                        <th className="py-2 px-4 border">Mã Bàn</th>{" "}
                        <th className="py-2 px-4 border">Loại Cờ</th>
                        <th className="py-2 px-4 border">Loại Phòng</th>
                        <th className="py-2 px-4 border">Tên Phòng</th>
                        <th className="py-2 px-4 border">
                          Giờ Bắt Đầu Và Kết Thúc
                        </th>
                        <th className="py-2 px-4 border">Ngày</th>
                        <th className="py-2 px-4 border">Tổng Giá</th>
                        <th className="py-2 px-4 border">Trạng Thái</th>
                        <th className="py-2 px-4 border">Đối Thủ</th>
                        <th className="py-2 px-4 border">
                          Thanh Toán Cho Đối Thủ
                        </th>
                        <th className="py-2 px-4 border">Hành động</th>
                        <th className="py-2 px-4 border">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAppointment.tablesAppointments.map(
                        (tableAppointment) => (
                          <tr key={tableAppointment.id} className="border-b">
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.id}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.table.tableId}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.table.gameType.typeName ===
                              "chess"
                                ? "Cờ vua"
                                : tableAppointment.table.gameType.typeName ===
                                    "xiangqi"
                                  ? "Cờ tướng"
                                  : tableAppointment.table.gameType.typeName ===
                                      "go"
                                    ? "Cờ vây"
                                    : tableAppointment.table.gameType.typeName}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.table.roomType === "basic"
                                ? "Phòng thường"
                                : tableAppointment.table.roomType === "premium"
                                  ? "Phòng cao cấp"
                                  : tableAppointment.table.roomType ===
                                      "openspaced"
                                    ? "Không gian mở"
                                    : tableAppointment.table.roomType}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.table.roomName}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {formatTime(tableAppointment.scheduleTime)} -{" "}
                              {formatTime(tableAppointment.endTime)}
                            </td>

                            <td className="py-2 px-4 border text-center">
                              {new Date(
                                tableAppointment.scheduleTime
                              ).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {formatCurrency(tableAppointment.price)}
                            </td>

                            <td className="py-2 px-4 border text-center">
                              <span
                                className={`px-2 py-1 rounded ${getStatusColor(tableAppointment.status).bg} ${getStatusColor(tableAppointment.status).text}`}
                              >
                                {
                                  getStatusColor(tableAppointment.status)
                                    .display
                                }
                              </span>
                            </td>

                            <td className="py-2 px-4 border text-center">
                              {selectedAppointment.appointmentrequests.some(
                                (req) =>
                                  req.tableId === tableAppointment.table.tableId
                              ) && (
                                <button
                                  onClick={() => {
                                    handleShowOpponentDetails(
                                      selectedAppointment.appointmentrequests,
                                      tableAppointment.table.tableId,
                                      tableAppointment.scheduleTime
                                    );
                                  }}
                                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                                >
                                  Xem đối thủ
                                </button>
                              )}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              <span
                                className={`px-2 py-1 rounded ${
                                  tableAppointment.paidForOpponent
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {tableAppointment.paidForOpponent
                                  ? "Có"
                                  : "Không"}
                              </span>
                            </td>
                            <td className="py-2 px-4 border text-center space-x-2">
                              {(tableAppointment.status === "confirmed" ||
                                tableAppointment.status === "pending") && (
                                <button
                                  onClick={() =>
                                    checkCancelCondition(tableAppointment.id)
                                  }
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                                >
                                  Hủy
                                </button>
                              )}
                              {/* {tableAppointment.status === "checked_in" && (
                                <button
                                  onClick={() =>
                                    handleExtendAppointment(tableAppointment.id)
                                  }
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                                >
                                  Gia hạn
                                </button>
                              )} */}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.note}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                {data.pagedList.filter(
                  (appointment) =>
                    appointment.status.toLowerCase() === "completed" ||
                    appointment.status.toLowerCase() === "unfinished"
                ).length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-lg">Bạn chưa có đơn đặt bàn nào.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-5 text-left">Mã Đơn</th>
                            <th className="py-3 px-5 text-left">
                              Ngày Tạo Đơn
                            </th>
                            <th className="py-3 px-5 text-left">
                              Phương thức đặt hẹn
                            </th>
                            <th className="py-3 px-4 text-left">Tổng Số Bàn</th>
                            <th className="py-3 px-4 text-left">Tổng Giá</th>
                            <th className="py-3 px-4 text-left">Trạng Thái</th>
                            <th className="py-3 px-12 text-left">Hành Động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.pagedList
                            .filter(
                              (appointment) =>
                                appointment.status.toLowerCase() ===
                                  "completed" ||
                                appointment.status.toLowerCase() ===
                                  "unfinished"
                            )
                            .map((appointment) => (
                              <tr
                                key={appointment.appointmentId}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-3 px-8">
                                  {appointment.appointmentId}
                                </td>
                                <td className="py-3 px-4">
                                  {formatDate(appointment.createdAt)}
                                </td>
                                <td className="py-3 px-4">
                                  {appointment.isMonthlyAppointment
                                    ? "Đặt hẹn Tháng"
                                    : "Đặt hẹn Thường"}
                                </td>
                                <td className="py-3 px-14">
                                  {appointment.tablesCount}
                                </td>
                                <td className="py-3 px-4">
                                  {formatCurrency(appointment.totalPrice)}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded ${getStatusColor(appointment.status).bg} ${getStatusColor(appointment.status).text}`}
                                  >
                                    {getStatusColor(appointment.status).display}
                                  </span>
                                </td>
                                <td className="py-3 px-10 space-x-2">
                                  <button
                                    onClick={() =>
                                      handleAppointmentClick(appointment)
                                    }
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                  >
                                    Xem chi tiết
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-4">
                      {totalPages >= 1 && (
                        <div className="flex justify-center mt-8 mb-8">
                          <DefaultPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            <CancelConfirmationModal
              show={showCancelConfirm}
              onClose={() => {
                setShowCancelConfirm(false);
                setCurrentCancellingId(null);
              }}
              onConfirm={confirmCancelAppointment}
              refundInfo={refundInfo}
              isLoading={isLoading}
            />
            <OpponentDetailsPopup
              show={showOpponentDetails}
              onClose={() => setShowOpponentDetails(false)}
              requests={currentOpponentRequests}
              tableId={currentTableId || 0}
              tableAppointmentStatus={
                selectedAppointment?.tablesAppointments.find(
                  (ta) => ta.table.tableId === currentTableId
                )?.status
              }
              appointmentId={selectedAppointment?.appointmentId}
              startTime={
                selectedAppointment?.tablesAppointments.find(
                  (ta) => ta.table.tableId === currentTableId
                )?.scheduleTime
              }
              endTime={
                selectedAppointment?.tablesAppointments.find(
                  (ta) => ta.table.tableId === currentTableId
                )?.endTime
              }
            />
            <TermsDialog
              open={openTermsDialog}
              onClose={() => setOpenTermsDialog(false)}
            />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Page;
