"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import { TextField, Stack, Typography, Box } from "@mui/material";
import { Button } from "@material-tailwind/react";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { InputAdornment } from "@mui/material";
import { Calendar } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import BusinessHoursNotice from "@/components/BusinessHoursNotice/page";

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
}

export default function ChessCategoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chessBookings, setChessBookings] = useState<ChessBooking[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState("8:00");
  const [endTime, setEndTime] = useState("9:00");
  const [roomType, setRoomType] = useState("");
  const [gameType, setGameType] = useState("chess"); // Khởi tạo với giá trị mặc định
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const [selectedGameType, setSelectedGameType] = useState("all"); // Mặc định là "Tất cả loại cờ"

  function toLocalISOString(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    localDate.setMinutes(0, 0, 0);
    return localDate.toISOString().slice(0, -1);
  }

  const fetchChessBookings = async (pageNum: number) => {
    try {
      const selectedStartTime = new Date(startDate);
      const selectedEndTime = new Date(startDate);

      selectedStartTime.setHours(parseInt(startTime.split(":")[0]), 0, 0, 0);
      selectedEndTime.setHours(parseInt(endTime.split(":")[0]), 0, 0, 0);

      const params = {
        StartTime: toLocalISOString(selectedStartTime),
        EndTime: toLocalISOString(selectedEndTime),
        gameTypes: [gameType], // Luôn là mảng
        roomTypes:
          roomType === ""
            ? ["basic", "premium", "openspaced"] // Khi chọn "Tất cả"
            : [roomType], // Khi chọn 1 loại phòng
        "page-number": pageNum,
        "page-size": 8,
      };

      const baseUrl =
        "https://backend-production-5bc5.up.railway.app/api/tables/available/filter";
      const queryString = new URLSearchParams();

      // Object.entries(params).forEach(([key, value]) => {
      //   if (Array.isArray(value)) {
      //     value.forEach((v) => queryString.append(key, v));
      //   } else {
      //     queryString.append(key, value);
      //   }
      // });

      // console.log("Full request URL:", `${baseUrl}?${queryString.toString()}`);
      const response = await axios.get(
        "https://backend-production-5bc5.up.railway.app/api/tables/available/filter",
        {
          params,
          paramsSerializer: {
            indexes: null, // Ngăn Axios thêm [] vào key
            encode: (param) => param, // Tắt auto-encode
          },
        }
      );
      console.log("API Response:", response.data);

      if (
        response.data ===
        "No available table was found for this gametype and roomtype."
      ) {
        toast.error("Không tìm thấy bàn chơi phù hợp!");
        console.log(response.data);

        setChessBookings([]);
        return;
      }

      setChessBookings(response.data.pagedList || []);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách bàn cờ:", error);

      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;

        if (errorData?.message) {
          let message = errorData.message;
          if (message === "Start time must be earlier than End time.") {
            message = "Giờ bắt đầu phải sớm hơn giờ kết thúc!";
          } else if (
            message === "Room type is required." ||
            message === "The value is invalid"
          ) {
            message = "Vui lòng chọn loại phòng hợp lệ!";
          } else if (
            message ===
            "The minimum duration between start and end time is 30 minutes."
          ) {
            message = "Vui lòng chọn thời gian cách nhau 1 giờ!";
          }
          toast.error(message);
        } else if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          toast.error(errorMessages.join("\n"));
        } else {
          toast.error("Lỗi khi lấy dữ liệu, vui lòng thử lại sau!");
        }
      } else {
        toast.error("Đã có lỗi không xác định xảy ra!");
      }
      setChessBookings([]);
    }
  };

  const handleSearch = async () => {
    setSelectedGameType(gameType);

    const selectedStartTime = new Date(startDate);
    selectedStartTime.setHours(parseInt(startTime.split(":")[0]), 0, 0, 0);

    const now = new Date();
    if (selectedStartTime < now) {
      toast.error("Giờ bắt đầu phải lớn hơn thời gian hiện tại!");
      return;
    }

    setHasSearched(true);
    setCurrentPage(1);
    await fetchChessBookings(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchChessBookings(newPage);
  };

  return (
    <div>
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
        <div className="mt-10">
          <BusinessHoursNotice openHour={8} closeHour={22} />
        </div>
        <div className="flex flex-row items-center space-x-2 mt-8 mb-1 justify-center">
          {/* Dropdown chọn loại cờ */}
          <div className="w-44">
            <label
              htmlFor="gameType"
              className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
            >
              Chọn Loại Cờ
            </label>
            <select
              id="gameType"
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:border-blue-500 bg-white text-gray-700"
              required
            >
              <option value="chess">Cờ Vua</option>
              <option value="xiangqi">Cờ Tướng</option>
              <option value="go">Cờ Vây</option>
            </select>
          </div>

          {/* Dropdown chọn loại phòng */}
          <div className="w-44">
            <label
              htmlFor="gameType"
              className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
            >
              Chọn Loại Phòng
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
     focus:outline-none focus:ring-2 focus:ring-blue-500 
     focus:border-blue-500 bg-white text-gray-700"
            >
              <option value="">Tất cả loại phòng</option>
              <option value="basic">Phòng Thường</option>
              <option value="premium">Phòng Cao Cấp</option>
              <option value="openspaced">Không Gian Mở</option>
            </select>
          </div>

          <Stack direction="row" alignItems="flex-end" spacing={2}>
            {/* Giờ Bắt Đầu */}
            <Stack direction="column" spacing={0.5}>
              <label className="text-gray-500 text-xs font-medium leading-tight">
                Giờ Bắt Đầu
              </label>
              <TextField
                className="w-24"
                size="small"
                select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ width: 80, bgcolor: "#e0e0e0", borderRadius: 1 }}
              >
                {Array.from({ length: 14 }, (_, i) => {
                  const hour = i + 8;
                  return (
                    <option key={hour} value={`${hour}:00`}>
                      {hour.toString().padStart(2, "0")}:00
                    </option>
                  );
                })}
              </TextField>
            </Stack>

            {/* Giờ Kết Thúc */}
            <Stack direction="column" spacing={0.5}>
              <label className="text-gray-500 text-xs font-medium leading-tight">
                Giờ Kết Thúc
              </label>
              <TextField
                className="w-24"
                size="small"
                select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ width: 80, bgcolor: "#e0e0e0", borderRadius: 1 }}
              >
                {Array.from({ length: 14 }, (_, i) => {
                  const hour = i + 8;
                  return (
                    <option key={hour} value={`${hour}:00`}>
                      {hour.toString().padStart(2, "0")}:00
                    </option>
                  );
                })}
              </TextField>
            </Stack>

            {/* Chọn Ngày */}
            <Box sx={{ overflow: "hidden", minHeight: "60px" }}>
              <Stack direction="column" spacing={0.5}>
                <Typography
                  variant="body2"
                  className="text-gray-500 text-xs font-medium leading-tight"
                >
                  Chọn Ngày
                </Typography>
                <DatePicker
                  minDate={new Date()}
                  selected={startDate}
                  onChange={(date) => {
                    if (date) setStartDate(date);
                  }}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-start"
                  portalId="root"
                  className="w-36 cursor-pointer"
                  customInput={
                    <TextField
                      size="small"
                      sx={{
                        minHeight: "40px",
                        bgcolor: "#e0e0e0",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      InputProps={{
                        readOnly: true, // Không cho nhập thủ công
                      }}
                    />
                  }
                />
              </Stack>
            </Box>

            {/* Nút tìm kiếm */}
            <Box marginTop="auto">
              <Button onClick={handleSearch}>Tìm kiếm</Button>
            </Box>
          </Stack>
        </div>

        {!hasSearched ? (
          <div className="max-w-7xl mx-auto px-2 mt-12 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">
                Vui lòng nhập thông tin tìm kiếm
              </h3>
              <p className="text-gray-600 mt-2">
                Chọn loại cờ, loại phòng, thời gian và nhấn "Tìm kiếm" để xem
                các bàn cờ có sẵn
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-2">
            <div className="mt-8 ml-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">
                {selectedGameType === "chess"
                  ? "Cờ Vua"
                  : selectedGameType === "xiangqi"
                    ? "Cờ Tướng"
                    : selectedGameType === "go"
                      ? "Cờ Vây"
                      : "Tất cả loại cờ"}
              </h2>
            </div>

            {chessBookings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 mb-6">
                  {chessBookings.map((chessBooking) => (
                    <div
                      key={chessBooking.tableId}
                      className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105"
                    >
                      <a
                        href={`/${locale}/chess_appointment/${chessBooking.tableId}`}
                        className="block"
                      >
                        <img
                          src={
                            chessBooking.gameType.typeName === "chess"
                              ? "https://i.pinimg.com/736x/2e/7e/e5/2e7ee58125c4b42cc7387887eb350580.jpg"
                              : chessBooking.gameType.typeName === "xiangqi"
                                ? "https://i.pinimg.com/736x/82/82/02/828202dd07ec09743fd06f7e0659ae0c.jpg"
                                : "https://i.pinimg.com/736x/06/31/18/063118e78b9950a9ef9c97aa4b46c1c2.jpg"
                          }
                          alt={chessBooking.roomName}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </a>

                      <h3 className="text-base font-medium mt-2 text-black">
                        Loại cờ:{" "}
                        {chessBooking.gameType.typeName === "go"
                          ? "Cờ Vây"
                          : chessBooking.gameType.typeName === "chess"
                            ? "Cờ Vua"
                            : chessBooking.gameType.typeName === "xiangqi"
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
                        <span className="font-medium text-black">
                          Loại Phòng:{" "}
                        </span>{" "}
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
                        <span className="font-medium text-black">
                          {" "}
                          Đến:{" "}
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
                        <span className="font-medium text-black">
                          Tổng Giá:{" "}
                        </span>{" "}
                        {chessBooking.totalPrice > 0
                          ? chessBooking.totalPrice.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                          : "Không xác định"}
                      </p>

                      <div className="flex gap-2 mt-3">
                        <Button className="flex items-center gap-2 text-xs px-2 py-1">
                          <FaShoppingCart size={14} /> Thêm Vào Danh Sách
                        </Button>
                        <Button
                          onClick={() => {
                            const accessToken =
                              localStorage.getItem("accessToken");
                            if (!accessToken) {
                              router.push(`/${locale}/login`);
                            } else {
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
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 mb-8">
                    <DefaultPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                {/* <p className="text-gray-600">Không tìm thấy bàn cờ phù hợp</p> */}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
