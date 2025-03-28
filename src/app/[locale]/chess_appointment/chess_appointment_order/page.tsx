"use client";
import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
<<<<<<< HEAD
import { UserPlus, X } from "lucide-react"; // Import icons
<<<<<<< HEAD
<<<<<<< HEAD
import CouponsPage from "../coupon_modal/CouponsPage";
=======
import CouponsPage from "../coupon_modal/page";
>>>>>>> dc47781 (add appoinment flow)
=======
import CouponsPage from "../coupon_modal/CouponsPage";
>>>>>>> 33c7c96 (fix coupon eslint)
=======
import { Star, UserPlus, X } from "lucide-react";
import CouponsPage from "../coupon_modal/CouponsPage";
import { useParams, useRouter } from "next/navigation";
import OrderAttention from "@/components/OrderAttention/page";
>>>>>>> 65552bf (add appoinment booking)

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
    gameExtensions: any[];
  };
  gameTypeId: number;
  gameTypePrice: number;
  roomDescription: string;
  roomTypePrice: number;
  startDate: string;
  totalPrice: number;
}

const TableBookingPage = () => {
  const router = useRouter();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentTable, setCurrentTable] = useState<number | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [chessBookings, setChessBookings] = useState<ChessBooking[]>([]);
  const { locale } = useParams();

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
    // Chuyển hướng với query parameters
    router.push(
      `/${locale}/chess_appointment/${bookingInfo.id}?startTime=${encodeURIComponent(
        bookingInfo.startDate,
      )}&endTime=${encodeURIComponent(bookingInfo.endDate)}`,
    );
  };
  const removeTable = (tableId: number, startDate: string, endDate: string) => {
    const updatedBookings = chessBookings.filter(
      (booking) =>
        !(
          booking.tableId === tableId &&
          booking.startDate === startDate &&
          booking.endDate === endDate
        ),
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
    0,
  );
  const finalPrice = totalPrice - discount;

  const applyCoupon = () => {
    // Áp dụng giảm giá dựa trên coupon
  };

  const inviteFriend = (tableNumber: number) => {
    setCurrentTable(tableNumber);
    setShowInviteModal(true);
  };
  const GAME_TYPE_TRANSLATIONS: Record<string, string> = {
    chess: "Cờ Vua",
    xiangqi: "Cờ Tướng",
    go: "Cờ Vây",
    // Thêm các loại cờ khác nếu cần
  };
  const translateRoomType = (roomType: string): string => {
    const type = roomType.toLowerCase();

    if (type.includes("basic")) return "Phòng thường";
    if (type.includes("premium")) return "Phòng cao cấp";
    if (type.includes("openspace") || type.includes("open space"))
      return "Không gian mở";

    return roomType;
  };
  return (
    <div>
      <Navbar />
      {/* Background Banner */}
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            Cửa hàng cờ StrateZone
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            Nâng tầm chiến thuật - Trang bị như một kiện tướng!
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="mt-8">
        <OrderAttention></OrderAttention>
      </div>
      <div className="min-h-[calc(100vh-200px)] bg-gray-100 p-4 text-black">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold mb-4 text-center">
            Đơn đặt bàn của bạn
          </h1>

          <div className="bg-white rounded-lg shadow-md p-4">
            {/* Danh sách card bàn */}
            <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
              {chessBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 border rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-2"
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
                  <p className="text-lg font-medium">
                    Không có bàn nào được chọn
                  </p>
                  <p className="text-sm mt-1">Vui lòng chọn bàn để tiếp tục</p>
                </div>
              ) : (
                chessBookings.map((booking) => (
                  <div
                    key={`${booking.tableId}-${booking.startDate}-${booking.endDate}`}
                    className="border p-3 rounded-lg flex items-center relative "
                  >
                    {/* Nội dung bàn */}
                    <div className="flex-1 grid grid-cols-2 gap-2 text-sm text-black">
                      {/* Cột trái */}
                      <div>
                        <p
                          onClick={() => {
                            viewBookingDetail({
                              id: booking.tableId,
                              startDate: booking.startDate,
                              endDate: booking.endDate,
                            });
                          }}
                        >
                          <span className="font-bold cursor-pointer">
                            Loại Cờ:{" "}
                          </span>
                          {GAME_TYPE_TRANSLATIONS[
                            booking.gameType.typeName.toLowerCase()
                          ] || booking.gameType.typeName}{" "}
                        </p>
                        <p>
                          <span
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                            className="font-bold cursor-pointer"
                          >
                            Loại Phòng:{" "}
                          </span>
                          {translateRoomType(booking.roomType)}
                        </p>
                        <p>
                          <span
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                            className="font-bold cursor-pointer"
                          >
                            Mã Bàn:{" "}
                          </span>
                          {booking.tableId}
                        </p>
                        <p>
                          <span
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                            className="font-bold cursor-pointer"
                          >
                            Phòng Số:{" "}
                          </span>
                          {booking.roomId}
                        </p>
                        <p
                          onClick={() => {
                            viewBookingDetail({
                              id: booking.tableId,
                              startDate: booking.startDate,
                              endDate: booking.endDate,
                            });
                          }}
                        >
                          <span
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                            className="font-bold cursor-pointer"
                          >
                            Tổng Thời Gian Thuê Bàn:{" "}
                          </span>
                          {booking.durationInHours} giờ
                        </p>
                      </div>

                      {/* Cột phải */}
                      <div className="text-right">
                        <p>
                          <span
                            className="font-bold cursor-pointer"
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
                          <span
                            className="font-bold cursor-pointer"
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                          >
                            Giờ Bắt Đầu:{" "}
                          </span>
                          {formatTime(booking.startDate)}
                        </p>
                        <p>
                          {" "}
                          <span
                            className="font-bold cursor-pointer"
                            onClick={() => {
                              viewBookingDetail({
                                id: booking.tableId,
                                startDate: booking.startDate,
                                endDate: booking.endDate,
                              });
                            }}
                          >
                            Giờ Kết thúc:{" "}
                          </span>
                          {formatTime(booking.endDate)}
                        </p>
                        <div>
                          <p className="font-medium text-sm">
                            <span
                              className="font-bold cursor-pointer"
                              onClick={() => {
                                viewBookingDetail({
                                  id: booking.tableId,
                                  startDate: booking.startDate,
                                  endDate: booking.endDate,
                                });
                              }}
                            >
                              {" "}
                              Giá Thuê Theo Giờ:{" "}
                            </span>
                            {(
                              booking.roomTypePrice + booking.gameTypePrice
                            ).toLocaleString("vi-VN")}
                            đ
                          </p>
                        </div>
                        <p className="mt-2">
                          <span className="font-bold">Tổng: </span>
                          {booking.totalPrice.toLocaleString()}đ
                        </p>
                      </div>
                    </div>

                    {/* Nhóm nút bên phải */}
                    <div className="flex items-center ml-2 space-x-2">
                      <button
                        onClick={() => inviteFriend(booking.tableId)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Mời bạn vào bàn này"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button
                        onClick={() =>
                          removeTable(
                            booking.tableId,
                            booking.startDate,
                            booking.endDate,
                          )
                        }
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Xóa bàn này"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Các phần còn lại giữ nguyên */}
            {/* <div className="border-t border-gray-200 pt-3 mb-4">
              <h3 className="font-medium mb-2">Giá từng bàn:</h3>
              <ul className="space-y-1 text-sm">
                {chessBookings.map((booking) => (
                  <li key={booking.tableId} className="flex justify-between">
                    <span>Bàn {booking.tableId}:</span>
                    <span>{booking.totalPrice.toLocaleString()}đ</span>
                  </li>
                ))}
              </ul>
            </div> */}

            <div className="mb-4 flex justify-between items-center">
              <p className="font-bold text-lg">Nhập Mã Giảm Giá</p>
              <p className="font-bold text-lg">
                Thành tiền: {finalPrice.toLocaleString()}đ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                type="text"
                placeholder="Nhập coupon..."
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 text-sm"
                crossOrigin="anonymous"
              />
              <Button
                onClick={applyCoupon}
                color="amber"
                className="  py-2 px-3 text-sm"
              >
                Áp dụng
              </Button>
              <Button
                color="green"
                onClick={() => setShowCouponModal(true)}
                className="py-2 px-3 text-sm"
              >
                Mã giảm giá
              </Button>
            </div>

            <div className="flex justify-end">
              <Button className=" hover:bg-gray-900 text-white px-4 py-2 text-sm">
                Xác nhận đặt bàn
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
