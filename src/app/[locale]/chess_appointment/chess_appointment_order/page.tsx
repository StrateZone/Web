"use client";
import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { UserPlus, X } from "lucide-react";
import CouponsPage from "../coupon_modal/CouponsPage";
import { useParams, useRouter } from "next/navigation";
import OrderAttention from "@/components/OrderAttention/page";
import { ConfirmBookingPopup } from "./ConfirmBookingPopup";
import { InsufficientBalancePopup } from "./InsufficientBalancePopup";
import { useLocale } from "next-intl";
import { PastTimePopup } from "./SelectTimeInThePast";
import { UnavailableTablesPopup } from "./UnavailableTablesPopup";
import { SuccessBookingPopup } from "./BookingSuccess";

interface ChessBooking {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  durationInHours: number;
  endDate: string;
  gameType: {
    typeId: number;
    typeName: string;
    // gameExtensions: any[];
  };
  gameTypeId: number;
  gameTypePrice: number;
  roomDescription: string;
  roomTypePrice: number;
  startDate: string;
  totalPrice: number;
}
interface UnavailableTable {
  table_id: number;
  start_time: string;
  end_time: string;
}

interface TableNotAvailableError {
  error: {
    code: string;
    message: string;
    unavailable_tables: UnavailableTable[];
  };
}
const TableBookingPage = () => {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const localActive = useLocale();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [chessBookings, setChessBookings] = useState<ChessBooking[]>([]);
  const { locale } = useParams();

  function formatDuration(hours: number): string {
    const fullHours = Math.floor(hours); // Lấy phần nguyên (giờ)
    const minutes = Math.round((hours - fullHours) * 60); // Tính phần dư (phút)

    if (fullHours === 0) {
      return `${minutes} phút`; // Trường hợp dưới 1 giờ
    } else if (minutes === 0) {
      return `${fullHours} tiếng`; // Trường hợp chẵn giờ
    } else {
      return `${fullHours} tiếng ${minutes} phút`; // Trường hợp có giờ và phút
    }
  }
  useEffect(() => {
    const savedBookings = localStorage.getItem("chessBookings");
    if (savedBookings) {
      try {
        const parsedBookings: ChessBooking[] = JSON.parse(savedBookings);
        setChessBookings(parsedBookings);
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu từ localStorage:", error);
      }
    }
  }, []);

  const viewBookingDetail = (bookingInfo: {
    id: number;
    startDate: string;
    endDate: string;
  }) => {
    router.push(
      `/${locale}/chess_appointment/${bookingInfo.id}?startTime=${encodeURIComponent(
        bookingInfo.startDate
      )}&endTime=${encodeURIComponent(bookingInfo.endDate)}`
    );
  };

  const removeTable = (tableId: number, startDate: string, endDate: string) => {
    const updatedBookings = chessBookings.filter(
      (booking) =>
        !(
          booking.tableId === tableId &&
          booking.startDate === startDate &&
          booking.endDate === endDate
        )
    );
    setChessBookings(updatedBookings);
    localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const totalPrice = chessBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );
  const finalPrice = totalPrice - discount;

  const applyCoupon = () => {};

  const GAME_TYPE_TRANSLATIONS: Record<string, string> = {
    chess: "Cờ Vua",
    xiangqi: "Cờ Tướng",
    go: "Cờ Vây",
  };

  const translateRoomType = (roomType: string): string => {
    const type = roomType.toLowerCase();
    if (type.includes("basic")) return "Phòng thường";
    if (type.includes("premium")) return "Phòng cao cấp";
    if (type.includes("openspace") || type.includes("open space"))
      return "Không gian mở";
    return roomType;
  };

  const handleConfirmBooking = async () => {
    // Hàm cha sẽ đợi hàm con chạy xong mới tiếp tục
    const isConfirmed = await ConfirmBookingPopup({
      chessBookings,
      finalPrice,
    });
    if (!isConfirmed) return;

    // Bật loading khi bắt đầu gọi API
    try {
      setIsLoading(true);

      // 1. Kiểm tra đăng nhập
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        alert("Vui lòng đăng nhập để đặt bàn");
        router.push(`/${locale}/login`);
        setIsLoading(false);
        return;
      }

      // 2. Validate dữ liệu
      if (chessBookings.length === 0) {
        alert("Vui lòng chọn ít nhất một bàn để đặt");
        return;
      }

      // 3. Chuẩn bị dữ liệu (dùng userId thực từ authData)
      const authData = JSON.parse(authDataString);
      const requestData = {
        userId: authData.userId, // Sửa thành ID thực
        tablesAppointmentRequests: chessBookings.map((booking) => ({
          price:
            (booking.roomTypePrice + booking.gameTypePrice) *
            booking.durationInHours,
          tableId: booking.tableId,
          scheduleTime: booking.startDate,
          endTime: booking.endDate,
        })),
        totalPrice: finalPrice,
      };

      // 4. Gọi API trực tiếp
      const response = await fetch(
        "https://backend-production-5bc5.up.railway.app/api/payments/booking-payment",
        {
          method: "POST",
          headers: {
            accept: "text/plain",
            "Content-Type": "application/json-patch+json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log(response);
      // 5. Xử lý response
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || `HTTP ${response.status}`);
      }

      // 6. Xóa dữ liệu tạm
      localStorage.removeItem("chessBookings");
      setChessBookings([]);
      setDiscount(0);
      setCoupon("");

      const userChoice = await SuccessBookingPopup();
      if (userChoice) {
        // Người dùng chọn "Xem chi tiết đơn đặt"
        router.push(`/${localActive}/appointment_history`);
      } else {
        // Người dùng chọn "Đặt bàn mới"
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Balance is not enough")) {
          const isConfirmed = await InsufficientBalancePopup({
            finalPrice,
          });
          if (!isConfirmed) {
            return;
          } else {
            router.push(`/${localActive}/wallet`);
          }
        } else if (error.message.includes("Can not select time in the past")) {
          const now = new Date();

          // Lọc các bàn có thời gian trong quá khứ
          const pastBookings = chessBookings
            .filter((booking) => new Date(booking.startDate) <= now)
            .map((booking) => ({
              tableId: booking.tableId,
              startTime: formatTime(booking.startDate),
              endTime: formatTime(booking.endDate),
            }));

          // Hiển thị popup thông báo
          await PastTimePopup({
            pastBookings: pastBookings,
          });

          // Cập nhật state
          const validBookings = chessBookings.filter(
            (booking) => new Date(booking.startDate) > now
          );
          setChessBookings(validBookings);
          localStorage.setItem("chessBookings", JSON.stringify(validBookings));
        } else if (error.message.includes("TABLE_NOT_AVAILABLE")) {
          try {
            const errorData = JSON.parse(error.message);
            const unavailableTables = errorData.error.unavailable_tables.map(
              (t) => ({
                tableId: t.table_id,
                startTime: formatTime(t.start_time),
                endTime: formatTime(t.end_time),
              })
            );

            await UnavailableTablesPopup({ unavailableTables });

            // Lọc ra các bàn không khả dụng
            const updatedBookings = chessBookings.filter((booking) => {
              return !errorData.error.unavailable_tables.some(
                (unavailable) =>
                  booking.tableId === unavailable.table_id &&
                  booking.startDate === unavailable.start_time &&
                  booking.endDate === unavailable.end_time
              );
            });

            setChessBookings(updatedBookings);
            localStorage.setItem(
              "chessBookings",
              JSON.stringify(updatedBookings)
            );
          } catch (parseError) {
            console.error("Error parsing unavailable tables:", parseError);
          }
        }
      }
      // console.error("❌ Lỗi:", error);
      // alert(`Lỗi: ${error instanceof Error ? error.message : "Hệ thống"}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="text-base">
      <Navbar />

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

      <div className="mt-10">
        <OrderAttention></OrderAttention>
      </div>

      <div className="min-h-[calc(100vh-200px)] bg-gray-100 p-6 text-black">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Đơn đặt bàn của bạn
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Danh sách card bàn */}
            <div className="max-h-[800px] overflow-y-auto mb-6 space-y-4">
              {chessBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 border rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xl font-medium">
                    Không có bàn nào được chọn
                  </p>
                  <p className="text-base mt-2">
                    Vui lòng chọn bàn để tiếp tục
                  </p>
                </div>
              ) : (
                chessBookings.map((booking) => (
                  <div
                    key={`${booking.tableId}-${booking.startDate}-${booking.endDate}`}
                    className="border-2 p-4 rounded-lg flex items-center relative"
                  >
                    {/* Nội dung bàn */}
                    <div className="flex-1 grid grid-cols-2 gap-4 text-base">
                      {/* Cột trái */}
                      <div>
                        <div className="col-span-2 mb-2">
                          <p
                            className="text-blue-500 text-sm italic cursor-pointer hover:underline"
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                          >
                            🔍 Bấm vào để xem chi tiết bàn
                          </p>
                        </div>
                        <p>
                          <span className="font-bold text-lg ">Loại Cờ: </span>
                          {GAME_TYPE_TRANSLATIONS[
                            booking.gameType.typeName.toLowerCase()
                          ] || booking.gameType.typeName}{" "}
                        </p>
                        <p>
                          <span className="font-bold text-lg ">
                            Loại Phòng:{" "}
                          </span>
                          {translateRoomType(booking.roomType)}
                        </p>
                        <p>
                          <span className="font-bold text-lg ">Mã Bàn: </span>
                          {booking.tableId}
                        </p>
                        <p>
                          <span className="font-bold text-lg ">Phòng Số: </span>
                          {booking.roomId}
                        </p>
                        <p>
                          <span className="font-bold text-lg ">
                            Tổng Thời Gian Thuê Bàn:{" "}
                          </span>
                          {formatDuration(booking.durationInHours)}
                        </p>
                      </div>
                      {/* Cột phải */}
                      <div className="text-right">
                        <p>
                          <span
                            className="font-bold text-lg "
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                          >
                            Ngày Đặt:{" "}
                          </span>
                          {formatDate(booking.startDate)}
                        </p>
                        <p>
                          <span className="font-bold text-lg ">
                            Giờ Bắt Đầu:{" "}
                          </span>
                          {formatTime(booking.startDate)}
                        </p>
                        <p>
                          <span className="font-bold text-lg ">
                            Giờ Kết thúc:{" "}
                          </span>
                          {formatTime(booking.endDate)}
                        </p>
                        <div>
                          <p className="font-medium text-base">
                            <span className="font-bold text-lg ">
                              Giá Thuê Theo Giờ:{" "}
                            </span>
                            {(
                              booking.roomTypePrice + booking.gameTypePrice
                            ).toLocaleString("vi-VN")}
                            đ
                          </p>
                        </div>
                        <p className="mt-2">
                          <span className="font-bold text-lg">Tổng: </span>
                          {booking.totalPrice.toLocaleString()}đ
                        </p>
                      </div>
                    </div>

                    {/* Nhóm nút bên phải */}
                    <div className="flex items-center ml-4 space-x-3">
                      <button
                        // onClick={() => inviteFriend(booking.tableId)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Mời bạn vào bàn này"
                      >
                        <UserPlus size={24} />
                      </button>
                      <button
                        onClick={() =>
                          removeTable(
                            booking.tableId,
                            booking.startDate,
                            booking.endDate
                          )
                        }
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Xóa bàn này"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mb-6 flex justify-between items-center">
              <p className="font-bold text-xl">Nhập Mã Giảm Giá</p>
              <p className="font-bold text-xl">
                Thành tiền: {finalPrice.toLocaleString()}đ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                type="text"
                placeholder="Nhập coupon..."
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 text-base h-12"
                crossOrigin="anonymous"
              />
              <Button
                onClick={applyCoupon}
                color="amber"
                className="py-2 px-8 text-small
                "
              >
                Áp dụng
              </Button>
              <Button
                onClick={() => setShowCouponModal(true)}
                className="py-0 px-10 text-small bg-green-600"
              >
                Mã giảm giá
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleConfirmBooking}
                className="hover:bg-gray-900 text-white px-12 py-3 text-base"
                disabled={chessBookings.length === 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  "Xác nhận đặt bàn"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal hiển thị mã giảm giá */}
      {showCouponModal && (
        <CouponsPage
          onClose={() => setShowCouponModal(false)}
          setCoupon={setCoupon}
          setDiscount={setDiscount}
        />
      )}
      <Footer />
    </div>
  );
};

export default TableBookingPage;
