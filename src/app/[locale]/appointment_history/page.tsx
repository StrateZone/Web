"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import React, { useState, useEffect } from "react";

interface GameType {
  typeId: number;
  typeName: string;
  gameExtensions: any[];
}

interface Table {
  tableId: number;
  roomId: number;
  fee: number | null;
  gameTypeId: number;
  status: number;
  gameType: GameType;
}

interface TablesAppointment {
  id: number;
  tableId: number;
  appointmentId: number;
  status: string;
  scheduleTime: string;
  endTime: string;
  price: number;
  createdAt: string;
  table: Table;
}

interface AppointmentRequest {
  // Define the structure if needed
}

interface Appointment {
  appointmentId: number;
  userId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
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

function Page() {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [orderBy, setOrderBy] = useState("createdAt_desc");
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // Hoặc số lượng bạn muốn hiển thị mỗi trang
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const authDataString = localStorage.getItem("authData");
  const authData = JSON.parse(authDataString);

  const userId = authData.userId; // User ID cố định từ API
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

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn đặt này không?")) {
      return;
    }

    try {
      setIsLoading(true);
      // Gọi API hủy đơn đặt - bạn cần thay thế bằng endpoint thực tế
      const response = await fetch(
        `https://backend-production-5bc5.up.railway.app/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Hủy đơn đặt không thành công");
      }

      // Làm mới dữ liệu sau khi hủy thành công
      const apiUrl = new URL(
        `https://backend-production-5bc5.up.railway.app/api/appointments/users/${userId}`
      );
      apiUrl.searchParams.append("page-number", currentPage.toString());
      apiUrl.searchParams.append("page-size", pageSize.toString());
      apiUrl.searchParams.append("order-by", orderBy);

      const newResponse = await fetch(apiUrl.toString());
      const newData: ApiResponse = await newResponse.json();
      setData(newData);

      if (selectedAppointment?.appointmentId === appointmentId) {
        setSelectedAppointment(null);
      }

      alert("Hủy đơn đặt thành công!");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Hủy đơn đặt không thành công"
      );
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

  // const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setPageSize(Number(e.target.value));
  //   setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi pageSize
  // };

  const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi sắp xếp
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
              {/* <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="font-medium">
                  Số lượng mỗi trang:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div> */}

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
                  <option value="createdAt_desc">Mới nhất</option>
                  <option value="createdAt_asc">Cũ nhất</option>
                  <option value="totalPrice_desc">Giá cao nhất</option>
                  <option value="totalPrice_asc">Giá thấp nhất</option>
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
                  {selectedAppointment.status === "pending" && (
                    <button
                      onClick={() =>
                        handleCancelAppointment(
                          selectedAppointment.appointmentId
                        )
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Hủy đơn đặt
                    </button>
                  )}
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

                  {/* <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">
                      Thông tin người dùng
                    </h3>
                    <p>
                      <span className="font-medium">User ID:</span>{" "}
                      {selectedAppointment.userId}
                    </p>
                  </div> */}
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
                        <th className="py-2 px-4 border">
                          Giờ Bắt Đầu Và Kết Thúc
                        </th>
                        <th className="py-2 px-4 border">Ngày</th>
                        <th className="py-2 px-4 border">Giá</th>
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
                              Phòng {tableAppointment.table.tableId}
                            </td>
                            <td className="py-2 px-4 border text-center">
                              {formatTime(tableAppointment.scheduleTime)} -{" "}
                              {formatTime(tableAppointment.endTime)}
                            </td>
                            {/* <td className="py-2 px-4 border text-center">
                              {formatTime(tableAppointment.endTime)}
                            </td> */}
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
                              {tableAppointment.status === "pending" && (
                                <button
                                  onClick={() =>
                                    handleCancelAppointment(
                                      selectedAppointment.appointmentId
                                    )
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
                              <td className="py-3 px-4 space-x-2">
                                <button
                                  onClick={() =>
                                    handleAppointmentClick(appointment)
                                  }
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                  Xem chi tiết
                                </button>
                                {appointment.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      handleCancelAppointment(
                                        appointment.appointmentId
                                      )
                                    }
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                  >
                                    Hủy
                                  </button>
                                )}
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
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Page;
