"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import Banner from "@/components/banner/banner";

interface ChessBooking {
  durationInHours: number;
  endDate: string;
  gameType: {
    typeId: number;
    typeName: string;
  };
  gameTypeId: number;
  gameTypePrice: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomTypePrice: number;
  startDate: string;
  tableId: number;
  totalPrice: number;
  tableNumber: number;
  imageUrl?: string;
}

const TableDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [chessBooking, setChessBooking] = useState<ChessBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false); // Thêm state cho loading khi thêm vào giỏ
  const [error, setError] = useState("");
  const [localBookings, setLocalBookings] = useState<ChessBooking[]>([]);

  useEffect(() => {
    const storedBookings = localStorage.getItem("chessBookings");
    if (storedBookings && storedBookings !== "undefined") {
      try {
        const parsed = JSON.parse(storedBookings);
        if (Array.isArray(parsed)) {
          setLocalBookings(parsed);
        }
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu từ localStorage:", error);
        localStorage.removeItem("chessBookings");
      }
    }
  }, []);

  const isBooked = (tableId: number, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return localBookings.some((booking) => {
      if (booking.tableId !== tableId) return false;

      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  const getLocalBooking = (tableId: number, searchDate: Date) => {
    const bookings = JSON.parse(localStorage.getItem("chessBookings") || "[]");
    return bookings.find((booking: ChessBooking) => {
      const bookingDate = new Date(booking.startDate);
      return (
        booking.tableId === tableId &&
        bookingDate.toDateString() === searchDate.toDateString()
      );
    });
  };

  const formatShortTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`;
  };

  function formatDuration(hours: number): string {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);

    if (fullHours === 0) {
      return `${minutes} phút`;
    } else if (minutes === 0) {
      return `${fullHours} tiếng`;
    } else {
      return `${fullHours} tiếng ${minutes} phút`;
    }
  }

  useEffect(() => {
    if (!id) return;
    const fetchTableDetails = async () => {
      try {
        setLoading(true);
        const startTime = searchParams.get("startTime");
        const endTime = searchParams.get("endTime");
        const response = await axios.get(
          `https://backend-production-ac5e.up.railway.app/api/tables/${id}`,
          {
            params: {
              startTime: startTime ? decodeURIComponent(startTime) : undefined,
              endTime: endTime ? decodeURIComponent(endTime) : undefined,
            },
          },
        );

        const data = response.data;
        const bookingWithImage = {
          ...data,
          imageUrl: getImageByGameType(data.gameType.typeName),
        };
        setChessBooking(bookingWithImage);
      } catch (error) {
        console.error("Error fetching table details:", error);
        setError("Failed to load table details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTableDetails();
  }, [id, searchParams]);

  const getImageByGameType = (typeName: string) => {
    const type = typeName.toLowerCase();
    if (type.includes("chess") || type.includes("cờ vua")) {
      return "https://i.pinimg.com/736x/2e/7e/e5/2e7ee58125c4b42cc7387887eb350580.jpg";
    }
    if (type.includes("xiangqi") || type.includes("cờ tướng")) {
      return "https://i.pinimg.com/736x/82/82/02/828202dd07ec09743fd06f7e0659ae0c.jpg";
    }
    if (type.includes("go") || type.includes("cờ vây")) {
      return "https://i.pinimg.com/736x/06/31/18/063118e78b9950a9ef9c97aa4b46c1c2.jpg";
    }
    return "https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg";
  };

  const getPrivilegesByRoomType = (roomType: string) => {
    switch (roomType.toLowerCase()) {
      case "premium":
        return [
          "Miễn phí nước uống cao cấp",
          "Hỗ trợ tư vấn cờ từ kiện tướng",
          "Không gian VIP riêng tư",
          "Wifi tốc độ cao",
          "Bàn cờ cao cấp",
          "Đồ ăn nhẹ miễn phí",
        ];
      case "basic":
        return [
          "Miễn phí nước uống cơ bản",
          "Hỗ trợ tư vấn cờ cơ bản",
          "Không gian yên tĩnh",
          "Wifi miễn phí",
          "Bàn cờ tiêu chuẩn",
        ];
      case "openspace":
        return [
          "Không gian mở thoáng đãng",
          "Khu vực chung rộng rãi",
          "Wifi miễn phí",
          "Bàn cờ tiêu chuẩn",
          "Dễ dàng giao lưu",
        ];
      default:
        return [
          "Miễn phí nước uống",
          "Hỗ trợ tư vấn cờ",
          "Không gian yên tĩnh",
          "Wifi miễn phí",
        ];
    }
  };

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

  const handleAddToCart = async () => {
    if (!chessBooking) return;

    setAddingToCart(true);
    try {
      const newStart = new Date(chessBooking.startDate);
      const newEnd = new Date(chessBooking.endDate);

      // 1. Kiểm tra xem bàn đã được đặt chưa
      const isAlreadyBooked = localBookings.some((booking) => {
        if (booking.tableId !== chessBooking.tableId) return false;

        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        return (
          (newStart >= bookingStart && newStart < bookingEnd) ||
          (newEnd > bookingStart && newEnd <= bookingEnd) ||
          (newStart <= bookingStart && newEnd >= bookingEnd)
        );
      });

      if (isAlreadyBooked) {
        const existingBookings = localBookings.filter(
          (b) => b.tableId === chessBooking.tableId,
        );

        const bookingDetails = existingBookings
          .map((b) => {
            const start = new Date(b.startDate).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const end = new Date(b.endDate).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return `${start} - ${end}`;
          })
          .join(", ");

        toast.warning(
          `Bàn số ${chessBooking.tableId} đã được đặt trong khung giờ: ${bookingDetails}`,
        );
        return;
      }

      // 2. Kiểm tra các booking có thể gộp
      const mergeableBookings = localBookings.filter((item) => {
        if (item.tableId !== chessBooking.tableId) return false;
        if (new Date(item.startDate).toDateString() !== newStart.toDateString())
          return false;

        const itemStart = new Date(item.startDate);
        const itemEnd = new Date(item.endDate);

        return (
          (newStart <= itemEnd && newEnd >= itemStart) ||
          Math.abs(newStart.getTime() - itemEnd.getTime()) <= 3600000 ||
          Math.abs(newEnd.getTime() - itemStart.getTime()) <= 3600000
        );
      });

      let updatedBookings: ChessBooking[];
      let message = "";

      if (mergeableBookings.length > 0) {
        let minStartDate = newStart;
        let maxEndDate = newEnd;

        mergeableBookings.forEach((booking) => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          if (bookingStart < minStartDate) minStartDate = bookingStart;
          if (bookingEnd > maxEndDate) maxEndDate = bookingEnd;
        });

        const durationInHours =
          (maxEndDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60);

        const mergedBooking: ChessBooking = {
          ...chessBooking,
          startDate: minStartDate.toISOString(),
          endDate: maxEndDate.toISOString(),
          durationInHours,
          totalPrice:
            (chessBooking.gameTypePrice + chessBooking.roomTypePrice) *
            durationInHours,
        };

        updatedBookings = [
          ...localBookings.filter(
            (booking) =>
              !mergeableBookings.some(
                (m) =>
                  m.tableId === booking.tableId &&
                  m.startDate === booking.startDate &&
                  m.endDate === booking.endDate,
              ),
          ),
          mergedBooking,
        ];

        const startTimeStr = minStartDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const endTimeStr = maxEndDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        message = `Đã gộp bàn số ${chessBooking.tableId} từ ${startTimeStr} đến ${endTimeStr} (${formatDuration(durationInHours)})`;
      } else {
        updatedBookings = [...localBookings, chessBooking];
        const startTimeStr = newStart.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const endTimeStr = newEnd.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        message = `Đã thêm bàn số ${chessBooking.tableId} từ ${startTimeStr} đến ${endTimeStr} vào danh sách đặt!`;
      }

      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      setLocalBookings(updatedBookings);
      toast.success(message);
    } catch (error) {
      console.error("Lỗi khi xử lý đặt bàn:", error);
      toast.error("Có lỗi xảy ra khi đặt bàn!");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <CircularProgress />
            <p className="mt-4 text-lg">Đang tải thông tin bàn cờ...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-xl text-center">
            Bàn mà bạn chọn đã qua thời gian hợp lệ để đặt!!!
          </div>
          <button
            // onClick={() => router.push(`/${locale}/chess_appointment/`)} // Thay đổi đường dẫn tùy theo route của bạn
            className="text-blue-500 text-xl underline hover:text-blue-700 cursor-pointer"
          >
            Ấn vào đây để tiếp tục
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!chessBooking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl">Không tìm thấy thông tin bàn cờ</div>
        </div>
        <Footer />
      </div>
    );
  }

  const startDate = new Date(chessBooking.startDate);
  const endDate = new Date(chessBooking.endDate);
  const formattedDate = startDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const privileges = getPrivilegesByRoomType(chessBooking?.roomType || "");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Banner
        title="Chi tiết bàn cờ – Lựa chọn của bạn"
        subtitle="Không gian hoàn hảo cho những nước đi đỉnh cao"
      />
      <div className="bg-gray-50 py-10 px-5 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 text-center uppercase tracking-wider">
              Thông Tin Bàn Chi Tiết
            </h1>
            {isBooked(
              chessBooking.tableId,
              chessBooking.startDate,
              chessBooking.endDate,
            ) && (
              <div className="mt-2 text-center text-sm text-green-600">
                {(() => {
                  const localBooking = getLocalBooking(
                    chessBooking.tableId,
                    new Date(startDate),
                  );
                  if (localBooking) {
                    return (
                      <p>
                        Bạn đã đặt bàn này từ{" "}
                        {formatShortTime(localBooking.startDate)} đến{" "}
                        {formatShortTime(localBooking.endDate)}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
          <div className="w-10"></div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src={chessBooking.imageUrl}
                  alt="Bàn cờ"
                  className="w-full h-80 object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-4 text-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-black">
                      {GAME_TYPE_TRANSLATIONS[
                        chessBooking.gameType.typeName.toLowerCase()
                      ] || chessBooking.gameType.typeName}
                    </h2>
                    <span className="text-gray-700 text-base">
                      <span className="text-gray-700">Mã Bàn:</span>{" "}
                      <span className="text-black font-medium">
                        {chessBooking.tableId}
                      </span>{" "}
                      - <span className="text-gray-700">Phòng Số:</span>{" "}
                      <span className="text-black font-medium">
                        {chessBooking.roomId}
                      </span>
                    </span>
                    <p className="text-gray-700 text-base">
                      <span className="text-gray-700">Ngày:</span>{" "}
                      <span className="text-black font-medium">
                        {formattedDate}
                      </span>
                    </p>
                    <p className="text-gray-700 text-base">
                      <span className="text-gray-700">Giờ Bắt Đầu:</span>{" "}
                      <span className="text-black font-medium">
                        {startDate.getHours()}:
                        {startDate.getMinutes().toString().padStart(2, "0")}
                      </span>
                    </p>
                    <p className="text-gray-700 text-base">
                      <span className="text-gray-700">Giờ Kết Thúc:</span>{" "}
                      <span className="text-black font-medium">
                        {endDate.getHours()}:
                        {endDate.getMinutes().toString().padStart(2, "0")}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base text-gray-700">Thành Tiền</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {chessBooking.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
                <div className="border-t border-b border-gray-200 py-4 my-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-base text-gray-500">
                        Giá Thuê Theo Giờ
                      </p>
                      <p className="font-medium text-lg">
                        {(
                          chessBooking.roomTypePrice +
                          chessBooking.gameTypePrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500">
                        Tổng Thời Gian Thuê Bàn
                      </p>
                      <p className="font-medium text-lg">
                        {formatDuration(chessBooking.durationInHours)}
                      </p>
                    </div>

                    <div>
                      <div>
                        <p className="text-base text-gray-500">Loại Phòng</p>
                        <p className="font-medium text-lg">
                          {translateRoomType(chessBooking.roomType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Tiện ích phòng
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {privileges.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                          <svg
                            className="w-3 h-3 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-black text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="gradient"
                    color="amber"
                    className={`flex-1 py-2 text-sm ${
                      isBooked(
                        chessBooking.tableId,
                        chessBooking.startDate,
                        chessBooking.endDate,
                      ) || addingToCart
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:shadow-md transition-shadow"
                    }`}
                    disabled={
                      isBooked(
                        chessBooking.tableId,
                        chessBooking.startDate,
                        chessBooking.endDate,
                      ) || addingToCart
                    }
                    onClick={handleAddToCart}
                  >
                    {addingToCart ? (
                      <div className="flex items-center justify-center">
                        <CircularProgress
                          size={20}
                          color="inherit"
                          className="mr-2"
                        />
                        Đang xử lý...
                      </div>
                    ) : isBooked(
                        chessBooking.tableId,
                        chessBooking.startDate,
                        chessBooking.endDate,
                      ) ? (
                      "Đã thêm vào danh sách"
                    ) : (
                      "Thêm vào danh sách"
                    )}
                  </Button>
                  <Button
                    variant="text"
                    color="gray"
                    className="flex items-center gap-2 text-lg"
                    onClick={() => router.back()}
                  >
                    <FaShoppingCart size={16} />
                    Tiếp Tục Chọn Bàn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TableDetailsPage;
