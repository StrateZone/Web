"use client";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import { TextField, Stack, Typography, Box } from "@mui/material";
import { Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
interface SearchParams {
  startDate: Date;
  startTime: string;
  endTime: string;
  roomType: string;
  gameType: string;
}

const saveSearchParams = (params: SearchParams) => {
  const localDateStr = params.startDate.toLocaleDateString("en-CA");
  sessionStorage.setItem(
    "chessSearchParams",
    JSON.stringify({
      ...params,
      startDate: localDateStr,
    })
  );
};

const getSavedSearchParams = (): SearchParams | null => {
  const saved = sessionStorage.getItem("chessSearchParams");
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    const dateParts = parsed.startDate.split("-");
    const localDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2])
    );
    localDate.setHours(12, 0, 0, 0);

    return {
      ...parsed,
      startDate: localDate,
    };
  } catch (e) {
    console.error("Lỗi khi parse search params:", e);
    return null;
  }
};
const isToday = (date: any) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default function ChessCategoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chessBookings, setChessBookings] = useState<ChessBooking[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState<string>(""); // Khởi tạo rỗng
  const [endTime, setEndTime] = useState<string>(""); // Khởi tạo rỗng
  const [roomType, setRoomType] = useState("");
  const [gameType, setGameType] = useState("chess");
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const [selectedGameType, setSelectedGameType] = useState("all");

  const generateTimeOptions = () => {
    const now = new Date();
    const isSelectedToday = isToday(startDate);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const options = [];

    for (let hour = 8; hour < 23; hour++) {
      for (const minute of [0, 30]) {
        // Skip times after 22:30
        if (hour === 22 && minute === 30) continue;

        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Disable if time is in the past for today
        const disabled =
          isSelectedToday &&
          (hour < currentHour ||
            (hour === currentHour && minute < currentMinute));

        options.push(
          <option
            key={timeString}
            value={timeString}
            disabled={disabled}
            style={{ color: disabled ? "#ccc" : "#000" }}
          >
            {timeString}
          </option>
        );
      }
    }

    return options;
  };

  function toLocalISOString(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    return localDate.toISOString().slice(0, -1);
  }
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
    const savedParams = getSavedSearchParams();
    if (savedParams) {
      setStartDate(savedParams.startDate);
      setStartTime(savedParams.startTime);
      setEndTime(savedParams.endTime);
      setRoomType(savedParams.roomType);
      setGameType(savedParams.gameType);
      setSelectedGameType(savedParams.gameType);
      setHasSearched(true);
      fetchChessBookings(1);
    }
  }, []);

  const fetchChessBookings = async (pageNum: number) => {
    try {
      const savedParams = getSavedSearchParams();
      const effectiveStartDate = savedParams?.startDate || startDate;
      const effectiveStartTime = savedParams?.startTime || startTime;
      const effectiveEndTime = savedParams?.endTime || endTime;
      const effectiveGameType = savedParams?.gameType || gameType;
      const effectiveRoomType = savedParams?.roomType || roomType;

      const [startHour, startMinute] = effectiveStartTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = effectiveEndTime.split(":").map(Number);

      const selectedStartTime = new Date(effectiveStartDate);
      selectedStartTime.setHours(startHour, startMinute, 0, 0);

      const selectedEndTime = new Date(effectiveStartDate);
      selectedEndTime.setHours(endHour, endMinute, 0, 0);

      const params = {
        StartTime: toLocalISOString(selectedStartTime),
        EndTime: toLocalISOString(selectedEndTime),
        gameTypes: [effectiveGameType],
        roomTypes:
          effectiveRoomType === ""
            ? ["basic", "premium", "openspaced"]
            : [effectiveRoomType],
        "page-number": pageNum,
        "page-size": 8,
      };

      const response = await axios.get(
        "https://backend-production-5bc5.up.railway.app/api/tables/available/filter",
        {
          params,
          paramsSerializer: {
            indexes: null,
            encode: (param) => param,
          },
        }
      );

      if (
        response.data ===
        "No available table was found for this gametype and roomtype."
      ) {
        toast.error("Không tìm thấy bàn chơi phù hợp!");
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
            message = "Vui lòng chọn thời gian cách nhau ít nhất 30 phút!";
          } else if (message === "Can not select time in the past.") {
            message = "Không thể chọn thời gian đã qua!";
          }
          toast.error(message);
        } else if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          toast.error(errorMessages.join("\n"));
        } else {
          toast.error("Lỗi khi lấy dữ liệu, vui lòng thử lại sau!");
        }
      } else {
        toast.error("Vui lòng chọn ngày và giờ phù hợp!");
      }
      setChessBookings([]);
    }
  };

  // const translateRoomType = (roomType: string): string => {
  //   const type = roomType.toLowerCase();
  //   if (type.includes("basic")) return "Phòng thường";
  //   if (type.includes("premium")) return "Phòng cao cấp";
  //   if (type.includes("openspace") || type.includes("open space"))
  //     return "Không gian mở";
  //   return roomType;
  // };

  const handleSearch = async () => {
    setSelectedGameType(gameType);

    // Validate time selection
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const selectedStartTime = new Date(startDate);
    selectedStartTime.setHours(startHour, startMinute, 0, 0);

    const selectedEndTime = new Date(startDate);
    selectedEndTime.setHours(endHour, endMinute, 0, 0);

    const now = new Date();
    if (selectedStartTime < now) {
      toast.error("Giờ bắt đầu đã qua, vui lòng chọn thời gian hợp lệ!");
      return;
    }

    if (selectedStartTime >= selectedEndTime) {
      toast.error("Giờ bắt đầu phải sớm hơn giờ kết thúc!");
      return;
    }

    saveSearchParams({
      startDate,
      startTime,
      endTime,
      roomType,
      gameType,
    });

    setSelectedGameType(gameType);
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
          {/* Game type dropdown */}
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

          {/* Room type dropdown */}
          <div className="w-44">
            <label
              htmlFor="roomType"
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
            {/* Start Time */}
            <Stack direction="column" spacing={0.5}>
              <Typography
                variant="body2"
                className="text-gray-500 text-xs font-medium leading-tight"
              >
                Giờ Bắt Đầu
              </Typography>
              <TextField
                className="w-24"
                size="small"
                select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ width: 100, bgcolor: "#e0e0e0", borderRadius: 1 }}
              >
                <option value="">--</option>
                {generateTimeOptions()}
              </TextField>
            </Stack>

            {/* End Time */}
            <Stack direction="column" spacing={0.5}>
              <Typography
                variant="body2"
                className="text-gray-500 text-xs font-medium leading-tight"
              >
                Giờ Kết Thúc
              </Typography>
              <TextField
                className="w-24"
                size="small"
                select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ width: 100, bgcolor: "#e0e0e0", borderRadius: 1 }}
              >
                <option value="">--</option>
                {generateTimeOptions()}
              </TextField>
            </Stack>

            {/* Date Picker */}
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
                    if (date) {
                      setStartDate(date);
                      // Reset time when date changes
                      setStartTime("");
                      setEndTime("");
                    }
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
                        readOnly: true,
                      }}
                    />
                  }
                />
              </Stack>
            </Box>

            {/* Search Button */}
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
                các bàn cờ có sẵn trong khung thời gian bạn mong muốn
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
                        href={`/${locale}/chess_appointment/${chessBooking.tableId}?startTime=${encodeURIComponent(chessBooking.startDate)}&endTime=${encodeURIComponent(chessBooking.endDate)}`}
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
                        <span className="font-medium text-black">Mã Bàn: </span>{" "}
                        {chessBooking.tableId}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium text-black">Ngày: </span>{" "}
                        {new Date(chessBooking.startDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                      <div className="text-gray-600 text-sm mt-2">
                        <p>
                          <span className="font-medium text-black">
                            Giờ Bắt Đầu:{" "}
                          </span>
                          {new Date(chessBooking.startDate).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                              timeZone: "Asia/Ho_Chi_Minh",
                            }
                          )}
                        </p>
                        <p className="mt-2">
                          <span className="font-medium text-black">
                            Giờ Kết Thúc:{" "}
                          </span>
                          {new Date(chessBooking.endDate).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                              timeZone: "Asia/Ho_Chi_Minh",
                            }
                          )}
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium text-black">
                          Giá Thuê Theo Giờ:{" "}
                        </span>{" "}
                        {(
                          chessBooking.roomTypePrice +
                          chessBooking.gameTypePrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium text-black">
                          Tổng Thời Gian Đặt Bàn:{" "}
                        </span>
                        {formatDuration(chessBooking.durationInHours)}
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
                        <Button
                          variant="gradient"
                          color="amber"
                          className="flex-1 py-2 text-sm"
                          onClick={() => {
                            try {
                              const currentBookings: ChessBooking[] =
                                JSON.parse(
                                  localStorage.getItem("chessBookings") || "[]"
                                );

                              const newStart = new Date(chessBooking.startDate);
                              const newEnd = new Date(chessBooking.endDate);

                              // 1. Check for existing bookings
                              const existingBookings = currentBookings.filter(
                                (item) => {
                                  const itemStart = new Date(item.startDate);
                                  const itemEnd = new Date(item.endDate);

                                  // Same table and same day
                                  return (
                                    item.tableId === chessBooking.tableId &&
                                    itemStart.toDateString() ===
                                      newStart.toDateString() &&
                                    // Exact match
                                    ((newStart.getTime() ===
                                      itemStart.getTime() &&
                                      newEnd.getTime() === itemEnd.getTime()) ||
                                      // New booking is within existing
                                      (newStart >= itemStart &&
                                        newEnd <= itemEnd) ||
                                      // New booking contains existing
                                      (newStart <= itemStart &&
                                        newEnd >= itemEnd) ||
                                      // Overlapping
                                      (newStart < itemEnd &&
                                        newEnd > itemStart))
                                  );
                                }
                              );

                              if (existingBookings.length > 0) {
                                // Format all existing time slots for this table
                                const bookingDetails = existingBookings
                                  .map((booking) => {
                                    const start = new Date(
                                      booking.startDate
                                    ).toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    });
                                    const end = new Date(
                                      booking.endDate
                                    ).toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    });
                                    return `${start} - ${end}`;
                                  })
                                  .join(", ");

                                toast.warning(
                                  `Bàn số ${chessBooking.tableId} đã được bạn đặt trong khung giờ: ${bookingDetails}`
                                );
                                return;
                              }

                              // 2. Check for mergeable bookings
                              const mergeableBookings = currentBookings.filter(
                                (item) => {
                                  if (item.tableId !== chessBooking.tableId)
                                    return false;
                                  if (
                                    new Date(item.startDate).toDateString() !==
                                    newStart.toDateString()
                                  )
                                    return false;

                                  const itemStart = new Date(item.startDate);
                                  const itemEnd = new Date(item.endDate);

                                  return (
                                    (newStart <= itemEnd &&
                                      newEnd >= itemStart) || // Overlapping
                                    Math.abs(
                                      newStart.getTime() - itemEnd.getTime()
                                    ) <= 3600000 || // Within 1 hour before
                                    Math.abs(
                                      newEnd.getTime() - itemStart.getTime()
                                    ) <= 3600000 // Within 1 hour after
                                  );
                                }
                              );

                              if (mergeableBookings.length > 0) {
                                // Calculate merged time range
                                let minStartDate = newStart;
                                let maxEndDate = newEnd;

                                mergeableBookings.forEach((booking) => {
                                  const bookingStart = new Date(
                                    booking.startDate
                                  );
                                  const bookingEnd = new Date(booking.endDate);

                                  if (bookingStart < minStartDate)
                                    minStartDate = bookingStart;
                                  if (bookingEnd > maxEndDate)
                                    maxEndDate = bookingEnd;
                                });

                                const durationInHours =
                                  (maxEndDate.getTime() -
                                    minStartDate.getTime()) /
                                  (1000 * 60 * 60);

                                // Create merged booking
                                const mergedBooking = {
                                  ...chessBooking,
                                  startDate: minStartDate.toISOString(),
                                  endDate: maxEndDate.toISOString(),
                                  durationInHours,
                                  totalPrice:
                                    (chessBooking.gameTypePrice +
                                      chessBooking.roomTypePrice) *
                                    durationInHours,
                                };

                                // Update bookings list
                                const updatedBookings = [
                                  ...currentBookings.filter(
                                    (booking) =>
                                      !mergeableBookings.some(
                                        (m) =>
                                          m.tableId === booking.tableId &&
                                          m.startDate === booking.startDate &&
                                          m.endDate === booking.endDate
                                      )
                                  ),
                                  mergedBooking,
                                ];

                                localStorage.setItem(
                                  "chessBookings",
                                  JSON.stringify(updatedBookings)
                                );

                                // Format time display
                                const startTimeStr =
                                  minStartDate.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  });
                                const endTimeStr =
                                  maxEndDate.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  });

                                toast.success(
                                  `Đã gộp bàn số ${chessBooking.tableId} từ ${startTimeStr} đến ${endTimeStr} (${formatDuration(durationInHours)})`
                                );
                              } else {
                                // Add new booking
                                const updatedBookings = [
                                  ...currentBookings,
                                  chessBooking,
                                ];
                                localStorage.setItem(
                                  "chessBookings",
                                  JSON.stringify(updatedBookings)
                                );

                                const startTimeStr =
                                  newStart.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  });
                                const endTimeStr = newEnd.toLocaleTimeString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                );

                                toast.success(
                                  `Đã thêm bàn số ${chessBooking.tableId} từ ${startTimeStr} đến ${endTimeStr} vào danh sách đặt!`
                                );
                              }
                            } catch (error) {
                              console.error("Lỗi khi xử lý đặt bàn:", error);
                              toast.error("Có lỗi xảy ra khi đặt bàn!");
                            }
                          }}
                        >
                          Thêm Vào Danh Sách
                        </Button>
                        <Button
                          onClick={() => {
                            router.push(
                              `/${locale}/chess_appointment/${chessBooking.tableId}?startTime=${encodeURIComponent(
                                chessBooking.startDate
                              )}&endTime=${encodeURIComponent(chessBooking.endDate)}`
                            );
                          }}
                          className="text-xs px-2 py-1 bg-green-600"
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
                <p className="text-gray-600">Đang tìm kiếm bàn cờ phù hợp</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
