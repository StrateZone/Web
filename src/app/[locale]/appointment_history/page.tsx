"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import React, { useState, useEffect } from "react";
import { fetchWallet } from "@/app/[locale]/wallet/walletSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import CancelConfirmationModal from "./CancelConfirmationModal";
import { SuccessCancelPopup } from "./CancelSuccessPopup";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
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
}

interface Appointment {
  appointmentId: number;
  userId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: null | {
    userId: number;
    name: string;
    email: string;
  };
  tablesAppointments: TablesAppointment[];
  appointmentrequests: any[];
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

  const authDataString = localStorage.getItem("authData");
  const authData = JSON.parse(authDataString || "{}");
  const userId = authData.userId;
  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading: walletLoading } = useSelector(
    (state: RootState) => state.wallet
  );
  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = new URL(
        `https://backend-production-5bc5.up.railway.app/api/appointments/users/${userId}`
      );
      apiUrl.searchParams.append("page-number", currentPage.toString());
      apiUrl.searchParams.append("page-size", pageSize.toString());
      apiUrl.searchParams.append("order-by", orderBy);

      const response = await fetch(apiUrl.toString());

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu đơn đặt");
      }

      const result: ApiResponse = await response.json();
      console.log(result);

      setData(result);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setHasPrevious(result.hasPrevious);
      setHasNext(result.hasNext);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
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

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
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
      const currentTime = toLocalISOString(new Date()); // Sử dụng hàm này

      const response = await fetch(
        `https://backend-production-5bc5.up.railway.app/api/tables-appointment/cancel-check/${tablesAppointmentId}/users/${userId}?CancelTime=${currentTime}`
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
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://backend-production-5bc5.up.railway.app/api/tables-appointment/cancel/${currentCancellingId}/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      const responseData = await response.json();
      console.log("API Response:", responseData);
      if (!response.ok) throw new Error("Hủy đơn đặt không thành công");

      // ✅ Cập nhật lại số dư ví
      dispatch(fetchWallet(userId));

      // Cập nhật UI trước khi hiển thị popup
      await fetchData();
      setShowCancelConfirm(false);
      setCurrentCancellingId(null);
      if (selectedAppointment) setSelectedAppointment(null);

      // Hiển thị popup với số tiền hoàn lại
      const refundAmount = responseData.price;
      const isConfirmed = await SuccessCancelPopup(refundAmount);

      // Điều hướng dựa trên lựa chọn
      if (isConfirmed) {
        router.push(`/${localActive}/appointment_history`); // Điều chỉnh route theo nhu cầu
      } else {
        // Nếu người dùng chọn "Đặt bàn mới"
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      case "confirmed":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "completed":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div>
        <Navbar />
        <div className="text-black">
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

          <div className="container mx-auto px-4 py-8 flex-grow">
            <h1 className="text-3xl font-bold mb-8">Lịch Sử Đặt Bàn</h1>

            {/* Controls */}
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
                <button
                  onClick={handleBackToList}
                  className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  ← Quay lại danh sách
                </button>

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
                        {selectedAppointment.status}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Tổng Giá:</span>{" "}
                      {formatCurrency(selectedAppointment.totalPrice)}
                    </p>
                    <p>
                      <span className="font-medium">Ngày Tạo Đơn :</span>{" "}
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
                        <th className="py-2 px-4 border">ID Bàn</th>
                        <th className="py-2 px-4 border">Loại Cờ</th>
                        <th className="py-2 px-4 border">Loại Phòng</th>
                        <th className="py-2 px-4 border">Số Phòng</th>
                        <th className="py-2 px-4 border">
                          Giờ Bắt Đầu Và Kết Thúc
                        </th>
                        <th className="py-2 px-4 border">Ngày</th>
                        <th className="py-2 px-4 border">Tổng Giá</th>
                        <th className="py-2 px-4 border">Trạng thái</th>
                        <th className="py-2 px-4 border">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAppointment.tablesAppointments.map(
                        (tableAppointment) => (
                          <tr key={tableAppointment.id} className="border-b">
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
                              {" "}
                              {tableAppointment.table.roomType === "basic"
                                ? "Phòng thường"
                                : tableAppointment.table.roomType === "premium"
                                  ? "Phòng cao cấp"
                                  : tableAppointment.table.roomType ===
                                      "openspaced"
                                    ? "không gian mở"
                                    : tableAppointment.table.roomType}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {tableAppointment.table.roomId}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {formatTime(tableAppointment.scheduleTime)}
                              &nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;
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
                                {tableAppointment.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 border text-center">
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
                {data.pagedList.length === 0 ? (
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
                            <th className="py-3 px-4 text-left">Tổng Số Bàn</th>
                            <th className="py-3 px-4 text-left">Tổng Giá</th>
                            <th className="py-3 px-4 text-left">Trạng Thái</th>
                            <th className="py-3 px-12 text-left">Hành Động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.pagedList.map((appointment) => (
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
                              <td className="py-3 px-14">
                                {appointment.tablesAppointments.length}
                              </td>
                              <td className="py-3 px-4">
                                {formatCurrency(appointment.totalPrice)}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded ${getStatusColor(appointment.status).bg} ${getStatusColor(appointment.status).text}`}
                                >
                                  {appointment.status}
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

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-4">
                      {totalPages > 1 && (
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

            {/* Cancel Confirmation Modal */}
            {
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
            }
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Page;
