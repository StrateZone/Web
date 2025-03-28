"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import { TextField, Stack, Typography, Box } from "@mui/material";
import { Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
interface SearchParams {
  startDate: Date;
  startTime: string;
  endTime: string;
  roomType: string;
  gameType: string;
}

const saveSearchParams = (params: SearchParams) => {
  // Chuyển đổi ngày thành chuỗi định dạng YYYY-MM-DD theo local time
  const localDateStr = params.startDate.toLocaleDateString("en-CA"); // "en-CA" sẽ tạo ra định dạng YYYY-MM-DD

  sessionStorage.setItem(
    "chessSearchParams",
    JSON.stringify({
      ...params,
      startDate: localDateStr, // Lưu dạng YYYY-MM-DD
    }),
  );
};

const getSavedSearchParams = (): SearchParams | null => {
  const saved = sessionStorage.getItem("chessSearchParams");
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);

    // Tạo Date object mới từ chuỗi YYYY-MM-DD
    const dateParts = parsed.startDate.split("-");
    const localDate = new Date(
      parseInt(dateParts[0]), // năm
      parseInt(dateParts[1]) - 1, // tháng (0-based)
      parseInt(dateParts[2]), // ngày
    );

    // Đặt giờ về 12:00:00 trưa để tránh vấn đề múi giờ
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
  const [initialLoad, setInitialLoad] = useState(true);
  const [addedItems, setAddedItems] = useState<number[]>([]); // Lưu trữ các tableId đã được thêm
  function toLocalISOString(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    localDate.setMinutes(0, 0, 0);
    return localDate.toISOString().slice(0, -1);
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

      // Tự động chạy search nếu dữ liệu hợp lệ
      setHasSearched(true);
      fetchChessBookings(1);
    }
  }, []);
  const fetchChessBookings = async (pageNum: number) => {
    try {
      // Lấy dữ liệu từ sessionStorage nếu có
      const savedParams = getSavedSearchParams();
      console.log("Ngày chọn trên UI buoc 4:", startDate); // Kiểm tra giá trị Date object
      // Sử dụng dữ liệu từ session nếu tồn tại, ngược lại dùng state hiện tại
      const effectiveStartDate = savedParams?.startDate || startDate;
      console.log("Ngày chọn trên UI buoc 5:", effectiveStartDate); // Kiểm tra giá trị Date object
      const effectiveStartTime = savedParams?.startTime || startTime;
      const effectiveEndTime = savedParams?.endTime || endTime;
      const effectiveGameType = savedParams?.gameType || gameType;
      const effectiveRoomType = savedParams?.roomType || roomType;

      const selectedStartTime = new Date(effectiveStartDate);
      const selectedEndTime = new Date(effectiveStartDate);

      selectedStartTime.setHours(
        parseInt(effectiveStartTime.split(":")[0]),
        0,
        0,
        0,
      );
      selectedEndTime.setHours(
        parseInt(effectiveEndTime.split(":")[0]),
        0,
        0,
        0,
      );

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

      console.log("Request params:", params); // Log để kiểm tra

      const response = await axios.get(
        "https://backend-production-5bc5.up.railway.app/api/tables/available/filter",
        {
          params,
          paramsSerializer: {
            indexes: null,
            encode: (param) => param,
          },
        },
      );

      // Xử lý response...
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
            message = "Vui lòng chọn thời gian cách nhau 1 giờ!";
          } else if (message === "Can not select time in the past.") {
            // message = "Không thể chọn thời gian đã qua trong ngày!";
            message =
              "Giờ Bắt Đầu phải sớm hơn giờ kết thúc và Giờ Kết Thúc đã qua trong ngày hôm nay !";
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

    console.log("Ngày chọn trên UI buoc1:", startDate); // Kiểm tra giá trị Date object
    // Tạo Date object mới với giờ local
    const selectedStartTime = new Date(startDate);

    console.log("Ngày chọn trên UI buoc2:", selectedStartTime); // Kiểm tra giá trị Date object

    const [hours] = startTime.split(":").map(Number);
    selectedStartTime.setHours(hours, 0, 0, 0);

    console.log("Ngày chọn trên UI buoc3:", selectedStartTime); // Kiểm tra giá trị Date object

    const now = new Date();
    if (selectedStartTime < now) {
      toast.error("Giờ bắt đầu đã qua, vui lòng chọn thời gian hợp lệ!");
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
                {Array.from({ length: 15 }, (_, i) => {
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
                {Array.from({ length: 15 }, (_, i) => {
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
                        onClick={(e) => {
                          const accessToken =
                            localStorage.getItem("accessToken");
                          if (!accessToken) {
                            e.preventDefault(); // Prevent the default href navigation
                            router.push(`/${locale}/login`);
                          }
                          // If there is an accessToken, let the default href navigation proceed
                        }}
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
                            "vi-VN",
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
                            "vi-VN",
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
                          "vi-VN",
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
                            },
                          )}
                          {" giờ"}
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
                            },
                          )}
                          {" giờ"}
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium text-black">
                          Tổng Thời Gian Đặt Bàn:{" "}
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
                        <Button
                          variant="gradient"
                          color="amber"
                          className="flex-1 py-2 text-sm"
                          onClick={() => {
                            try {
                              // 1. Lấy danh sách hiện tại từ LocalStorage
                              const currentBookings: ChessBooking[] =
                                JSON.parse(
                                  localStorage.getItem("chessBookings") || "[]",
                                );

                              // 2. Kiểm tra trùng lặp theo id và khung thời gian
                              const isExisting = currentBookings.some(
                                (item) =>
                                  item.tableId === chessBooking.tableId &&
                                  item.startDate === chessBooking.startDate &&
                                  item.endDate === chessBooking.endDate,
                              );

                              if (isExisting) {
                                // 3a. Nếu đã tồn tại
                                toast.warning(
                                  "Bàn này đã có trong danh sách đặt của bạn!",
                                );
                                return;
                              }

                              // 3b. Nếu chưa tồn tại - thêm vào danh sách
                              const updatedBookings = [
                                ...currentBookings,
                                chessBooking,
                              ];
                              localStorage.setItem(
                                "chessBookings",
                                JSON.stringify(updatedBookings),
                              );

                              // 4. Thông báo thành công
                              toast.success("Đã thêm bàn vào danh sách đặt!");

                              // 5. Chuyển hướng sau 1 giây
                              // setTimeout(() => {
                              //   router.push(
                              //     `/${locale}/chess_appointment/chess_appointment_order`
                              //   );
                              // }, 1000);
                            } catch (error) {
                              console.error("Lỗi khi xử lý đặt bàn:", error);
                              toast.error("Có lỗi xảy ra khi đặt bàn!");
                            }
                          }}
                        >
                          Thêm Vào Danh Sách
                        </Button>
                        <Button
                          color="green"
                          onClick={() => {
                            const accessToken =
                              localStorage.getItem("accessToken");
                            if (!accessToken) {
                              router.push(`/${locale}/login`);
                            } else {
                              router.push(
                                `/${locale}/chess_appointment/${chessBooking.tableId}?startTime=${encodeURIComponent(
                                  chessBooking.startDate,
                                )}&endTime=${encodeURIComponent(chessBooking.endDate)}`,
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
