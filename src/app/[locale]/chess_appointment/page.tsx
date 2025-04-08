"use client";
import { Button, Tab, Tabs, TabsHeader } from "@material-tailwind/react";
import { Navigation, Pagination } from "swiper/modules";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
export default function ChessAppointment() {
  const [chessBookings, setChessBookings] = useState<ChessBooking[]>([]);
  const [chessChinese, setChessChinese] = useState<ChessBooking[]>([]);
  const [chessGos, setChessGos] = useState<ChessBooking[]>([]);

  const router = useRouter();
  const { locale } = useParams(); // Lấy locale từ URL

  function toLocalISOString(date: Date) {
    let tzOffset = date.getTimezoneOffset() * 60000; // Chuyển đổi offset thành milliseconds
    let localDate = new Date(date.getTime() - tzOffset);

    // Đặt phút và giây về 00
    localDate.setMinutes(0, 0, 0);

    let localISOTime = localDate.toISOString().slice(0, -1); // Loại bỏ 'Z'
    return localISOTime;
  }

  useEffect(() => {
    const now = new Date();
    let startTime = new Date(now);
    let endTime = new Date(now);

    const hour = now.getHours(); // Lấy giờ hiện tại

    if (hour >= 8 && hour < 22) {
      // Nếu giờ nằm trong khoảng 8AM - 9PM => lấy giờ hiện tại +1
      startTime.setHours(startTime.getHours() + 1);
    } else {
      // Nếu ngoài khoảng 8AM - 9PM => đặt startTime là 8:00 AM ngày hôm sau
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(8, 0, 0, 0);
    }

    // Luôn lấy endTime là +1 giờ sau startTime
    endTime = new Date(startTime.getTime() + 1 * 60 * 60 * 1000);

    const fetchChessBookings = async () => {
      try {
        console.log("Đang gọi API...");

        const response = await axios.get(
          "https://backend-production-ac5e.up.railway.app/api/tables/available/each",
          {
            params: {
              StartTime: toLocalISOString(startTime), // ✅ Giờ đã chỉnh sửa
              EndTime: toLocalISOString(endTime), // ✅ Giờ đã chỉnh sửa
              tableCount: 6,
            },
          }
        );

        console.log("Dữ liệu nhận được:", response.data);

        if (response.data) {
          setChessBookings(
            Array.isArray(response.data.chess) ? response.data.chess : []
          );
          setChessChinese(
            Array.isArray(response.data.xiangqi) ? response.data.xiangqi : []
          );
          setChessGos(Array.isArray(response.data.go) ? response.data.go : []);
        } else {
          console.error("Dữ liệu API không hợp lệ:", response.data);
          setChessBookings([]);
          setChessChinese([]);
          setChessGos([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bàn cờ:", error);
        if (axios.isAxiosError(error)) {
          console.error("Chi tiết lỗi Axios:", error.response?.data);
        }
      }
    };

    fetchChessBookings();
  }, []);

  interface ChessBooking {
    durationInHours: number;
    endDate: string;
    gameType: {
      typeId: number;
      typeName: string;
      gameExtensions: any[];
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
    imageUrl: string;
  }
  return (
    <>
      <Navbar />
      <div>
        <div className="relative font-sans">
          <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>

          <img
            src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
            alt="Banner Image"
            className="absolute inset-0 w-full h-full object-cover z-10"
          />

          <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
            <h2 className="sm:text-4xl text-2xl font-bold mb-6">
              Sẵn Sàng So Tài – Đặt Bàn Ngay Tại Strate Zone!
            </h2>
            <p className="sm:text-lg text-base text-center text-gray-200">
              Bàn Cờ Sẵn Sàng – Thách Thức Đẳng Cấp!
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-2">
          <div className="mt-8 ml-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Cờ Vua</h2>
            <Button
              onClick={() =>
                router.push("chess_appointment/chess_category?type=chess")
              }
              color="blue"
              className="mb-2"
              variant="text"
            >
              Xem tất cả bàn cờ Vua hiện có
            </Button>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={4}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            navigation
            className="relative pb-6 mb-10"
          >
            {chessBookings.slice(0, 10).map((chessBooking) => (
              <SwiperSlide key={chessBooking.tableId}>
                <div className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105">
                  <a
                    href={`/${locale}/chess_appointment/${chessBooking.tableId}`}
                    className="block"
                    onClick={() => {
                      localStorage.setItem(
                        "chessBooking",
                        JSON.stringify(chessBooking)
                      );
                    }}
                  >
                    <img
                      src={
                        chessBooking.imageUrl ||
                        "https://i.pinimg.com/736x/2e/7e/e5/2e7ee58125c4b42cc7387887eb350580.jpg"
                      }
                      alt={chessBooking.roomName}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </a>
                  <h3 className="text-base font-medium mt-2 text-black">
                    Loại cờ:{" "}
                    {chessBooking.gameType.typeName === "chess"
                      ? "Cờ vua"
                      : chessBooking.gameType.typeName}{" "}
                    <span className="font-medium text-black text-sm ml-1">
                      (
                      {Number(chessBooking.gameTypePrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫/giờ)
                    </span>
                  </h3>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Loại Phòng: </span>{" "}
                    {chessBooking.roomType === "basic"
                      ? "Phòng Thường"
                      : chessBooking.roomType === "premium"
                        ? "Phòng Cao Cấp"
                        : chessBooking.roomType === "openspaced"
                          ? "Không Gian Mở"
                          : chessBooking.roomType}{" "}
                    <span className="font-medium text-black text-sm ml-1">
                      (
                      {Number(chessBooking.roomTypePrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫/giờ)
                    </span>
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Số Bàn: </span>{" "}
                    {chessBooking.tableId}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Ngày: </span>{" "}
                    {new Date(chessBooking.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">
                      Thời Bắt Đầu:{" "}
                    </span>{" "}
                    {new Date(chessBooking.startDate).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}
                    {" giờ"}
                    <span className="font-medium text-black">
                      {" "}
                      Thời Gian Kết Thúc:{" "}
                    </span>{" "}
                    {new Date(chessBooking.endDate).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}{" "}
                    {" giờ"}
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">
                      Tổng Thời Gian:{" "}
                    </span>{" "}
                    {chessBooking.durationInHours} {" giờ"}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Tổng Giá: </span>{" "}
                    {chessBooking.totalPrice > 0
                      ? chessBooking.totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Không xác định"}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex items-center gap-2 text-xs px-2 py-1"
                      onClick={() => {
                        const accessToken = localStorage.getItem("accessToken");
                        if (!accessToken) {
                          router.push(`/${locale}/login`); // Chuyển đến trang đăng nhập nếu chưa đăng nhập
                        } else {
                          router.push(
                            `/${locale}/chess_appointment/chess_appointment_order`
                          ); // Nếu có token thì tiếp tục
                        }
                      }}
                    >
                      <FaShoppingCart size={14} /> Thêm Vào Danh Sách
                    </Button>
                    <Button
                      onClick={() => {
                        const accessToken = localStorage.getItem("accessToken");
                        if (!accessToken) {
                          router.push(`/${locale}/login`);
                        } else {
                          // Truyền tableId, startTime, endTime qua URL
                          router.push(
                            `/${locale}/chess_appointment/${chessBooking.tableId}?startTime=${encodeURIComponent(
                              chessBooking.startDate
                            )}&endTime=${encodeURIComponent(chessBooking.endDate)}`
                          );
                        }
                      }}
                      color="green"
                      className="text-xs px-2 py-1"
                    >
                      Xem Chi Tiết
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <hr className="mx-auto w-1/2 border-t-2 border-gray-400" />

        <div className="max-w-7xl mx-auto px-2">
          <div className="mt-8 ml-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Cờ Tướng</h2>
            <Button
              onClick={() =>
                router.push("chess_appointment/chess_category?type=xiangqi")
              }
              color="blue"
              className="mb-2"
              variant="text"
            >
              Xem tất cả bàn cờ Tướng hiện có
            </Button>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={4}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            navigation
            className="relative pb-6 mb-10"
          >
            {chessChinese.slice(0, 10).map((chessBooking) => (
              <SwiperSlide key={chessBooking.tableId}>
                <div className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105">
                  <a
                    href={`/${locale}/chess_appointment/${chessBooking.tableId}`}
                    className="block"
                  >
                    <img
                      src={
                        chessBooking.imageUrl ||
                        "https://i.pinimg.com/736x/82/82/02/828202dd07ec09743fd06f7e0659ae0c.jpg"
                      }
                      alt={chessBooking.roomName}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </a>
                  <h3 className="text-base font-medium mt-2 text-black">
                    Loại cờ:{" "}
                    {chessBooking.gameType.typeName === "xiangqi"
                      ? "Cờ Tướng"
                      : chessBooking.gameType.typeName}{" "}
                    <span className="font-medium text-black text-sm ml-1">
                      (
                      {Number(chessBooking.gameTypePrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫/giờ)
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Loại Phòng: </span>{" "}
                    {chessBooking.roomType === "basic"
                      ? "Phòng Thường"
                      : chessBooking.roomType === "premium"
                        ? "Phòng Cao Cấp"
                        : chessBooking.roomType === "openspaced"
                          ? "Không Gian Mở"
                          : chessBooking.roomType}{" "}
                    <span className="font-medium text-black text-sm ml-1">
                      (
                      {Number(chessBooking.roomTypePrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫/giờ)
                    </span>
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Số Bàn: </span>{" "}
                    {chessBooking.tableId}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Ngày: </span>{" "}
                    {new Date(chessBooking.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Từ: </span>{" "}
                    {new Date(chessBooking.startDate).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}
                    {" giờ"}
                    <span className="font-medium text-black"> Đến: </span>{" "}
                    {new Date(chessBooking.endDate).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}{" "}
                    {" giờ"}
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">
                      Tổng Thời Gian:{" "}
                    </span>{" "}
                    {chessBooking.durationInHours} {" giờ"}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Tổng Giá: </span>{" "}
                    {chessBooking.totalPrice > 0
                      ? chessBooking.totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Không xác định"}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex items-center gap-2 text-xs px-2 py-1"
                      onClick={() =>
                        router.push(
                          `/${locale}/chess_appointment/chess_appointment_order`
                        )
                      }
                    >
                      <FaShoppingCart size={14} /> Thêm Vào Danh Sách
                    </Button>
                    <Button
                      onClick={() => {
                        const accessToken = localStorage.getItem("accessToken");
                        if (!accessToken) {
                          router.push(`/${locale}/login`);
                        } else {
                          // Truyền tableId, startTime, endTime qua URL
                          router.push(
                            `/${locale}/chess_appointment/${chessBooking.tableId}?startTime=${encodeURIComponent(
                              chessBooking.startDate
                            )}&endTime=${encodeURIComponent(chessBooking.endDate)}`
                          );
                        }
                      }}
                      color="green"
                      className="text-xs px-2 py-1"
                    >
                      Xem Chi Tiết
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <hr className="mx-auto w-1/2 border-t-2 border-gray-400" />
        <div className="max-w-7xl mx-auto px-2">
          <div className="mt-8 ml-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Cờ Vây</h2>
            <Button
              onClick={() =>
                router.push("chess_appointment/chess_category?type=go")
              }
              color="blue"
              className="mb-2"
              variant="text"
            >
              Xem tất cả bàn cờ Vây hiện có
            </Button>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={4}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            navigation
            className="relative pb-6 mb-10"
          >
            {chessGos.slice(0, 10).map((chessBooking) => (
              <SwiperSlide key={chessBooking.tableId}>
                <div className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105">
                  <a
                    href={`/${locale}/chess_appointment/${chessBooking.tableId}`}
                    className="block"
                  >
                    <img
                      src={
                        chessBooking.imageUrl ||
                        "https://i.pinimg.com/736x/06/31/18/063118e78b9950a9ef9c97aa4b46c1c2.jpg"
                      }
                      alt={chessBooking.roomName}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </a>
                  <h3 className="text-base font-medium mt-2 text-black">
                    Loại cờ:{" "}
                    {chessBooking.gameType.typeName === "go"
                      ? "Cờ Vây"
                      : chessBooking.gameType.typeName}{" "}
                    <span className="font-medium text-black text-sm ml-1">
                      (
                      {Number(chessBooking.gameTypePrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫/giờ)
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Loại Phòng: </span>{" "}
                    {chessBooking.roomType === "basic"
                      ? "Phòng Thường"
                      : chessBooking.roomType === "premium"
                        ? "Phòng Cao Cấp"
                        : chessBooking.roomType === "openspaced"
                          ? "Không Gian Mở"
                          : chessBooking.roomType}{" "}
                    <span className="font-medium text-black text-sm ml-1">
                      (
                      {Number(chessBooking.roomTypePrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫/giờ)
                    </span>
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Số Bàn: </span>{" "}
                    {chessBooking.tableId}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Ngày: </span>{" "}
                    {new Date(chessBooking.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Từ: </span>{" "}
                    {new Date(chessBooking.startDate).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}
                    {" giờ"}
                    <span className="font-medium text-black"> Đến: </span>{" "}
                    {new Date(chessBooking.endDate).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}{" "}
                    {" giờ"}
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">
                      Tổng Thời Gian:{" "}
                    </span>{" "}
                    {chessBooking.durationInHours} {" giờ"}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <span className="font-medium text-black">Tổng Giá: </span>{" "}
                    {chessBooking.totalPrice > 0
                      ? chessBooking.totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Không xác định"}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex items-center gap-2 text-xs px-2 py-1"
                      onClick={() =>
                        router.push(
                          `/${locale}/chess_appointment/chess_appointment_order`
                        )
                      }
                    >
                      <FaShoppingCart size={14} /> Thêm Vào Danh Sách
                    </Button>
                    <Button
                      onClick={() => {
                        const accessToken = localStorage.getItem("accessToken");
                        if (!accessToken) {
                          router.push(`/${locale}/login`);
                        } else {
                          // Truyền tableId, startTime, endTime qua URL
                          router.push(
                            `/${locale}/chess_appointment/${chessBooking.tableId}?startTime=${encodeURIComponent(
                              chessBooking.startDate
                            )}&endTime=${encodeURIComponent(chessBooking.endDate)}`
                          );
                        }
                      }}
                      color="green"
                      className="text-xs px-2 py-1"
                    >
                      Xem Chi Tiết
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      <Footer />
    </>
  );
}
