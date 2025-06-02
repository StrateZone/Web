"use client";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import {
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "react-toastify";
import BusinessHoursNotice from "@/components/BusinessHoursNotice/page";
import Banner from "@/components/banner/banner";
import TermsDialog from "./TermsDialog";
import { FormControl, Select, MenuItem, ListItemText } from "@mui/material";
interface Room {
  id: number;
  roomId: number;
  roomName: string;
  type: string;
  description: string;
  capacity: number;
  status: string;
  price: number;
  unit: string;
  tables: { tableId: number; tableName: string; status: string }[];
}

interface ChessBooking {
  durationInHours: number;
  endDate: string;
  gameType: {
    typeId: number;
    typeName: string;
    status?: string;
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
  roomDescription?: string;
  date?: string;
  bookingMode: "regular" | "monthly";
  dayOfWeek?: number;
  isAvailable: boolean; // Added to track availability
}

interface SearchParams {
  startDate: Date;
  startTime: string;
  endTime: string;
  roomType: string;
  gameType: string;
}

interface MonthlySearchParams {
  fromDate: Date;
  toDate: Date;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  roomType: string;
  gameType: string;
}

interface BusinessHours {
  openHour: string;
  closeHour: string;
}

interface GameType {
  typeId: number;
  typeName: string;
}

const saveSearchParams = (params: SearchParams | MonthlySearchParams) => {
  if ("startDate" in params) {
    const localDateStr = params.startDate.toLocaleDateString("en-CA");
    sessionStorage.setItem(
      "chessSearchParams",
      JSON.stringify({
        ...params,
        startDate: localDateStr,
      })
    );
  } else {
    sessionStorage.setItem(
      "chessSearchParams",
      JSON.stringify({
        ...params,
        fromDate: params.fromDate.toLocaleDateString("en-CA"),
        toDate: params.toDate.toLocaleDateString("en-CA"),
      })
    );
  }
};

const getSavedSearchParams = (): SearchParams | MonthlySearchParams | null => {
  const saved = sessionStorage.getItem("chessSearchParams");
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if ("startDate" in parsed) {
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
    } else {
      const fromDateParts = parsed.fromDate.split("-");
      const toDateParts = parsed.toDate.split("-");
      const fromDate = new Date(
        parseInt(fromDateParts[0]),
        parseInt(fromDateParts[1]) - 1,
        parseInt(fromDateParts[2])
      );
      const toDate = new Date(
        parseInt(toDateParts[0]),
        parseInt(toDateParts[1]) - 1,
        parseInt(toDateParts[2])
      );
      fromDate.setHours(12, 0, 0, 0);
      toDate.setHours(12, 0, 0, 0);
      return {
        ...parsed,
        fromDate,
        toDate,
      };
    }
  } catch (e) {
    console.error("Lỗi khi parse search params:", e);
    return null;
  }
};

const isToday = (date: Date) => {
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
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [roomType, setRoomType] = useState("");
  const [gameType, setGameType] = useState("Cờ Vua");
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isLoadingGameTypes, setIsLoadingGameTypes] = useState(false);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const [selectedGameType, setSelectedGameType] = useState("all");
  const [localBookings, setLocalBookings] = useState<ChessBooking[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    openHour: "08:00",
    closeHour: "22:00",
  });
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const systemId = 1;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [bookingMode, setBookingMode] = useState<"regular" | "monthly">(
    "regular"
  );
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const hasMonthlyBookings = localBookings.some(
    (booking) => booking.bookingMode === "monthly"
  );
  const daysOfWeekOptions = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const translateDayToVietnamese = (day: string): string => {
    switch (day) {
      case "Monday":
        return "Thứ Hai";
      case "Tuesday":
        return "Thứ Ba";
      case "Wednesday":
        return "Thứ Tư";
      case "Thursday":
        return "Thứ Năm";
      case "Friday":
        return "Thứ Sáu";
      case "Saturday":
        return "Thứ Bảy";
      case "Sunday":
        return "Chủ Nhật";
      default:
        return day;
    }
  };
  const handleDeselectTable = (chessBooking: ChessBooking) => {
    try {
      const updatedBookings = localBookings.filter(
        (booking) =>
          !(
            booking.tableId === chessBooking.tableId &&
            booking.startDate === chessBooking.startDate &&
            booking.endDate === chessBooking.endDate &&
            booking.bookingMode === "monthly"
          )
      );

      if (updatedBookings.length === localBookings.length) {
        toast.info("Bàn này chưa được chọn!");
        return;
      }

      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      setLocalBookings(updatedBookings);
      toast.success(
        `Đã bỏ chọn bàn số ${chessBooking.tableId} từ ${formatShortTime(
          chessBooking.startDate
        )} đến ${formatShortTime(chessBooking.endDate)}!`
      );
    } catch (error) {
      console.error("Lỗi khi bỏ chọn bàn:", error);
      toast.error("Có lỗi xảy ra khi bỏ chọn bàn!");
    }
  };
  useEffect(() => {
    const fetchGameTypes = async () => {
      setIsLoadingGameTypes(true);
      try {
        const response = await axios.get(
          "https://backend-production-ac5e.up.railway.app/api/game_types/all"
        );
        setGameTypes(response.data || []);
        if (response.data.length > 0 && !gameType) {
          setGameType(response.data[0].typeName);
        }
      } catch (error) {
        console.error("Error fetching game types:", error);
        toast.error("Không thể tải danh sách loại cờ!");
        setGameTypes([]);
      } finally {
        setIsLoadingGameTypes(false);
      }
    };

    fetchGameTypes();
  }, []);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      setIsLoadingRoomTypes(true);
      try {
        const apiUrl =
          bookingMode === "monthly"
            ? "https://backend-production-ac5e.up.railway.app/api/rooms/roomtypes/for-monthly-booking"
            : "https://backend-production-ac5e.up.railway.app/api/rooms/roomtypes";
        const response = await axios.get(apiUrl);
        const fetchedRoomTypes = response.data || [];
        setRoomTypes(fetchedRoomTypes);
        if (bookingMode === "monthly" && fetchedRoomTypes.length > 0) {
          setRoomType(fetchedRoomTypes[0]);
        } else {
          setRoomType("");
        }
      } catch (error) {
        console.error("Error fetching room types:", error);
        toast.error("Không thể tải danh sách loại phòng!");
        setRoomTypes([]);
        setRoomType("");
      } finally {
        setIsLoadingRoomTypes(false);
      }
    };

    fetchRoomTypes();
  }, [bookingMode]);

  useEffect(() => {
    const storedBookings = localStorage.getItem("chessBookings");
    if (storedBookings && storedBookings !== "undefined") {
      try {
        const parsed = JSON.parse(storedBookings);
        if (Array.isArray(parsed)) {
          setLocalBookings(
            parsed.map((booking: any) => ({
              ...booking,
              bookingMode: booking.bookingMode || "regular",
            }))
          );
        }
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu từ localStorage:", error);
        localStorage.removeItem("chessBookings");
      }
    }
  }, []);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        setIsLoadingHours(true);
        const dateStr = startDate.toISOString().split("T")[0];

        const [openHourRes, closeHourRes] = await Promise.all([
          axios.get(
            `https://backend-production-ac5e.up.railway.app/api/system/${systemId}/open-hour/date?date=${dateStr}`
          ),
          axios.get(
            `https://backend-production-ac5e.up.railway.app/api/system/${systemId}/close-hour/date?date=${dateStr}`
          ),
        ]);

        const openTime = openHourRes.data;
        const closeTime = closeHourRes.data;

        setBusinessHours({
          openHour: openTime.substring(0, 5),
          closeHour: closeTime.substring(0, 5),
        });
      } catch (error) {
        console.error("Error fetching business hours:", error);
        setBusinessHours({
          openHour: "08:00",
          closeHour: "22:00",
        });
      } finally {
        setIsLoadingHours(false);
      }
    };

    fetchBusinessHours();
  }, [startDate]);

  useEffect(() => {
    sessionStorage.removeItem("chessSearchParams");
    setHasSearched(false);
    setChessBookings([]);
    setCurrentPage(1);
    setTotalPages(1);
    if (bookingMode === "regular") {
      setDaysOfWeek([]);
      setFromDate(new Date());
      setToDate(new Date());
    } else {
      setStartDate(new Date());
      setStartTime("");
      setEndTime("");
    }
  }, [bookingMode]);

  useEffect(() => {
    const savedParams = getSavedSearchParams();
    if (savedParams && roomTypes.length > 0 && hasSearched) {
      console.log("Restoring saved params:", savedParams);
      if ("startDate" in savedParams) {
        setBookingMode("regular");
        setStartDate(savedParams.startDate);
        setStartTime(savedParams.startTime);
        setEndTime(savedParams.endTime);
        setRoomType(savedParams.roomType);
        setGameType(savedParams.gameType);
        setSelectedGameType(savedParams.gameType);
        fetchChessBookings(1);
      } else {
        setBookingMode("monthly");
        setFromDate(savedParams.fromDate);
        setToDate(savedParams.toDate);
        setDaysOfWeek(savedParams.daysOfWeek);
        setStartTime(savedParams.startTime);
        setEndTime(savedParams.endTime);
        setRoomType(savedParams.roomType);
        setGameType(savedParams.gameType);
        setSelectedGameType(savedParams.gameType);
        fetchChessBookings(1);
      }
    }
  }, [roomTypes, hasSearched]);

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

  const generateTimeOptions = () => {
    const now = new Date();
    const isSelectedToday = isToday(startDate);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [openHour] = businessHours.openHour.split(":").map(Number);
    const [closeHour, closeMinute] = businessHours.closeHour
      .split(":")
      .map(Number);

    const options = [];
    for (let hour = openHour; hour <= closeHour; hour++) {
      for (const minute of [0, 30]) {
        if (hour === closeHour && minute > closeMinute) continue;

        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        const disabled =
          bookingMode === "regular" &&
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

  const fetchChessBookings = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const savedParams = getSavedSearchParams();
      let effectiveParams: SearchParams | MonthlySearchParams = {
        startDate,
        startTime,
        endTime,
        roomType,
        gameType,
      };

      if (savedParams) {
        effectiveParams = savedParams;
      }

      console.log(
        "Fetching with bookingMode:",
        bookingMode,
        "Params:",
        effectiveParams
      );

      let url =
        "https://backend-production-ac5e.up.railway.app/api/tables/available/filter";
      let params: any;

      if (bookingMode === "monthly") {
        url =
          "https://backend-production-ac5e.up.railway.app/api/tables/available/monthly";
        params = {
          FromDate: (effectiveParams as MonthlySearchParams).fromDate
            .toISOString()
            .split("T")[0],
          ToDate: (effectiveParams as MonthlySearchParams).toDate
            .toISOString()
            .split("T")[0],
          DaysOfWeek:
            (effectiveParams as MonthlySearchParams).daysOfWeek || daysOfWeek,
          StartTime:
            (effectiveParams as MonthlySearchParams).startTime || startTime,
          EndTime: (effectiveParams as MonthlySearchParams).endTime || endTime,
          RoomType:
            (effectiveParams as MonthlySearchParams).roomType || roomType,
          GameType:
            (effectiveParams as MonthlySearchParams).gameType || gameType,
        };
      } else {
        const [startHour, startMinute] = (
          effectiveParams as SearchParams
        ).startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = (effectiveParams as SearchParams).endTime
          .split(":")
          .map(Number);

        const selectedStartTime = new Date(
          (effectiveParams as SearchParams).startDate
        );
        selectedStartTime.setHours(startHour, startMinute, 0, 0);

        const selectedEndTime = new Date(
          (effectiveParams as SearchParams).startDate
        );
        selectedEndTime.setHours(endHour, endMinute, 0, 0);

        params = {
          StartTime: toLocalISOString(selectedStartTime),
          EndTime: toLocalISOString(selectedEndTime),
          gameTypes: [(effectiveParams as SearchParams).gameType],
          roomTypes:
            (effectiveParams as SearchParams).roomType === ""
              ? roomTypes
              : [(effectiveParams as SearchParams).roomType],
          RoomName: selectedRoomId
            ? [
                rooms.find((room) => room.roomId === selectedRoomId)
                  ?.roomName || "",
              ]
            : [],
          "page-number": pageNum,
          "page-size": 8,
        };
      }

      const response = await axios.get(url, {
        params,
        paramsSerializer: {
          indexes: null,
          encode: (param) => param,
        },
      });

      if (
        response.data ===
        "No available table was found for this gametype and roomtype."
      ) {
        toast.error("Không tìm thấy bàn chơi phù hợp!");
        setChessBookings([]);
        setTotalPages(1);
        setCurrentPage(1);
        return;
      }

      if (bookingMode === "monthly") {
        const { datesAndTables } = response.data as {
          datesAndTables: Record<
            string,
            {
              tableResponse: ChessBooking | null;
              onDate: string;
              dayOfWeek: number;
            }[]
          >;
        };
        const bookings: ChessBooking[] = Object.entries(datesAndTables).flatMap(
          ([, entries]: [
            string,
            {
              tableResponse: ChessBooking | null;
              onDate: string;
              dayOfWeek: number;
            }[],
          ]) =>
            entries.map((entry) => ({
              // If tableResponse is null, create a placeholder booking with an isAvailable flag
              ...(entry.tableResponse || {
                tableId: -1, // Placeholder for unavailable
                roomId: -1,
                roomName: "Không có sẵn",
                roomType: roomType,
                roomDescription: "Không có bàn nào khả dụng cho ngày này",
                gameTypeId:
                  gameTypes.find((gt) => gt.typeName === gameType)?.typeId ||
                  -1,
                gameType: { typeId: -1, typeName: gameType },
                startDate: entry.onDate + "T" + startTime,
                endDate: entry.onDate + "T" + endTime,
                gameTypePrice: 0,
                roomTypePrice: 0,
                durationInHours: 1.0,
                totalPrice: 0,
              }),
              date: entry.onDate,
              dayOfWeek: entry.dayOfWeek,
              bookingMode: "monthly" as const,
              isAvailable: !!entry.tableResponse, // Add flag to indicate availability
            }))
        );
        setChessBookings(bookings || []);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setChessBookings(
          (response.data.pagedList || []).map((booking: any) => ({
            ...booking,
            bookingMode: "regular",
            isAvailable: true, // Regular bookings are always available in response
          }))
        );
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
      }
    } catch (error: unknown) {
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
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!startTime || !endTime) {
      toast.error("Vui lòng chọn cả giờ bắt đầu và giờ kết thúc");
      return;
    }

    if (bookingMode === "monthly" && daysOfWeek.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ngày trong tuần");
      return;
    }

    if (bookingMode === "monthly" && !roomType) {
      toast.error("Vui lòng chọn loại phòng cho lịch tháng!");
      return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const selectedStartTime = new Date(
      bookingMode === "regular" ? startDate : fromDate
    );
    selectedStartTime.setHours(startHour, startMinute, 0, 0);

    const selectedEndTime = new Date(
      bookingMode === "regular" ? startDate : fromDate
    );
    selectedEndTime.setHours(endHour, endMinute, 0, 0);

    const now = new Date();
    if (bookingMode !== "monthly" && selectedStartTime < now) {
      toast.error("Giờ bắt đầu đã qua, vui lòng chọn thời gian hợp lệ!");
      return;
    }

    if (selectedStartTime >= selectedEndTime) {
      toast.error("Giờ bắt đầu phải sớm hơn giờ kết thúc!");
      return;
    }

    const timeDiffInMinutes =
      (selectedEndTime.getTime() - selectedStartTime.getTime()) / (1000 * 60);

    if (timeDiffInMinutes < 60) {
      toast.error("Khoảng thời gian đặt bàn phải cách nhau ít nhất 1 tiếng!");
      return;
    }

    if (timeDiffInMinutes % 60 !== 0) {
      toast.error(
        "Vui lòng chọn khung giờ chẵn (1 tiếng, 2 tiếng...) không chấp nhận khung giờ lẻ như 1 tiếng rưỡi!"
      );
      return;
    }

    if (bookingMode === "monthly") {
      if (fromDate > toDate) {
        toast.error("Ngày bắt đầu phải sớm hơn hoặc bằng ngày kết thúc!");
        return;
      }

      saveSearchParams({
        fromDate,
        toDate,
        daysOfWeek,
        startTime,
        endTime,
        roomType,
        gameType,
      });
    } else {
      saveSearchParams({
        startDate,
        startTime,
        endTime,
        roomType,
        gameType,
      });
    }

    setSelectedGameType(gameType);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      await fetchChessBookings(1);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchChessBookings(newPage);
  };

  const formatShortTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const fetchRoomsByType = async (type: string) => {
    setIsLoadingRooms(true);
    try {
      const response = await axios.get(
        `https://backend-production-ac5e.up.railway.app/api/rooms/by-type?roomType=${type}`
      );
      setRooms(response.data.pagedList || []);
      setSelectedRoomId(null);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (roomType) {
      fetchRoomsByType(roomType);
    } else {
      setRooms([]);
      setSelectedRoomId(null);
    }
  }, [roomType]);

  const handleSelectAll = () => {
    try {
      const updatedBookings = [...localBookings];
      let addedCount = 0;

      chessBookings.forEach((chessBooking) => {
        const newStart = new Date(chessBooking.startDate);
        const newEnd = new Date(chessBooking.endDate);

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

        if (!isAlreadyBooked) {
          const updatedBooking = { ...chessBooking, bookingMode };
          updatedBookings.push(updatedBooking);
          addedCount++;
        }
      });

      if (addedCount === 0) {
        toast.info("Tất cả các bàn đã được thêm vào danh sách rồi!");
        return;
      }

      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      setLocalBookings(updatedBookings);
      toast.success(`Đã thêm ${addedCount} bàn vào danh sách đặt!`);
    } catch (error) {
      console.error("Lỗi khi chọn tất cả:", error);
      toast.error("Có lỗi xảy ra khi chọn tất cả bàn!");
    }
  };
  const handleDeselectAll = () => {
    try {
      if (localBookings.length === 0) {
        toast.info("Không có bàn nào trong danh sách để bỏ chọn!");
        return;
      }

      // Lọc chỉ giữ lại các booking có bookingMode là "regular"
      const updatedBookings = localBookings.filter(
        (booking) => booking.bookingMode !== "monthly"
      );

      if (updatedBookings.length === localBookings.length) {
        toast.info("Không có bàn đặt lịch tháng nào để bỏ chọn!");
        return;
      }

      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      setLocalBookings(updatedBookings);
      toast.success("Đã bỏ chọn tất cả các bàn đặt lịch tháng!");
    } catch (error) {
      console.error("Lỗi khi bỏ chọn tất cả:", error);
      toast.error("Có lỗi xảy ra khi bỏ chọn tất cả bàn!");
    }
  };
  // Group bookings by day of week for monthly mode
  const groupedBookings = chessBookings.reduce(
    (acc, booking) => {
      if (bookingMode === "monthly" && booking.dayOfWeek !== undefined) {
        const dayName = daysOfWeekOptions[booking.dayOfWeek] || "Unknown";
        if (!acc[dayName]) {
          acc[dayName] = [];
        }
        acc[dayName].push(booking);
      }
      return acc;
    },
    {} as Record<string, ChessBooking[]>
  );

  return (
    <div>
      <Navbar />
      <Banner
        title="Sẵn Sàng So Tài – Đặt Hẹn Ngay Tại Strate Zone!"
        subtitle="Bàn Cờ Sẵn Sàng – Thách Thức Đẳng Cấp!"
      />
      <div className="flex-1" style={{ paddingBottom: "27vh" }}>
        <div className="mt-10">
          <BusinessHoursNotice
            openHour={parseInt(businessHours.openHour.split(":")[0])}
            closeHour={parseInt(businessHours.closeHour.split(":")[0])}
            date={startDate}
            openTimeString={businessHours.openHour}
            closeTimeString={businessHours.closeHour}
          />
        </div>
        <div className="flex flex-col items-center space-y-4 mt-8 mb-1 justify-center">
          <div className="flex space-x-4">
            <Button
              onClick={() => setBookingMode("regular")}
              variant={bookingMode === "regular" ? "filled" : "outlined"}
            >
              Đặt Lịch Thường
            </Button>
            <Button
              onClick={() => setBookingMode("monthly")}
              variant={bookingMode === "monthly" ? "filled" : "outlined"}
            >
              Đặt Lịch Tháng
            </Button>
            <Button onClick={() => setOpenTermsDialog(true)} variant="outlined">
              Xem Điều Khoản
            </Button>
          </div>

          <div className="flex flex-row items-center space-x-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                required
                disabled={isLoadingGameTypes}
              >
                {isLoadingGameTypes ? (
                  <option value="" disabled>
                    Đang tải danh sách loại cờ...
                  </option>
                ) : gameTypes.length === 0 ? (
                  <option value="" disabled>
                    Không có loại cờ nào
                  </option>
                ) : (
                  gameTypes.map((type) => (
                    <option key={type.typeId} value={type.typeName}>
                      {type.typeName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="w-44">
              <label
                htmlFor="roomType"
                className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
              >
                Chọn Loại Phòng
              </label>
              <select
                id="roomType"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                disabled={isLoadingRoomTypes}
              >
                {bookingMode === "regular" && (
                  <option value="">Tất cả loại phòng</option>
                )}
                {isLoadingRoomTypes ? (
                  <option value="" disabled>
                    Đang tải danh sách loại phòng...
                  </option>
                ) : roomTypes.length === 0 ? (
                  <option value="" disabled>
                    Không có loại phòng nào
                  </option>
                ) : (
                  roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                )}
              </select>
            </div>

            {bookingMode === "regular" && roomType && (
              <div className="w-44">
                <label
                  htmlFor="roomNumber"
                  className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
                >
                  Chọn Tên Phòng
                </label>
                <select
                  id="roomNumber"
                  value={selectedRoomId || ""}
                  onChange={(e) =>
                    setSelectedRoomId(Number(e.target.value) || null)
                  }
                  disabled={!roomType || isLoadingRooms}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                >
                  {isLoadingRooms ? (
                    <option value="" disabled>
                      Đang tải danh sách phòng...
                    </option>
                  ) : (
                    rooms.map((room) => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {bookingMode === "monthly" ? (
              <>
                <div className="w-44">
                  <label
                    htmlFor="fromDate"
                    className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
                  >
                    Từ Ngày
                  </label>
                  <DatePicker
                    minDate={new Date()}
                    selected={fromDate}
                    onChange={(date) => {
                      if (date) {
                        setFromDate(date);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom-start"
                    portalId="root"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                    customInput={
                      <TextField
                        id="fromDate"
                        size="small"
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            height: "40px",
                            bgcolor: "white",
                            borderRadius: "0.375rem",
                          },
                          "& .MuiInputBase-input": {
                            padding: "8px 12px",
                            fontSize: "0.875rem",
                            color: "#374151",
                            cursor: "pointer",
                          },
                        }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    }
                  />
                </div>
                <div className="w-44">
                  <label
                    htmlFor="toDate"
                    className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
                  >
                    Đến Ngày
                  </label>
                  <DatePicker
                    minDate={fromDate}
                    selected={toDate}
                    onChange={(date) => {
                      if (date) {
                        setToDate(date);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom-start"
                    portalId="root"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                    customInput={
                      <TextField
                        id="toDate"
                        size="small"
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            height: "40px",
                            bgcolor: "white",
                            borderRadius: "0.375rem",
                          },
                          "& .MuiInputBase-input": {
                            padding: "8px 12px",
                            fontSize: "0.875rem",
                            color: "#374151",
                            cursor: "pointer",
                          },
                        }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    }
                  />
                </div>
                <div className="w-44">
                  <label
                    htmlFor="daysOfWeek"
                    className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
                  >
                    Chọn Ngày Trong Tuần
                  </label>
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      id="daysOfWeek"
                      multiple
                      value={daysOfWeek}
                      onChange={(e) =>
                        setDaysOfWeek(e.target.value as string[])
                      }
                      renderValue={(selected) =>
                        selected.map(translateDayToVietnamese).join(", ")
                      }
                      sx={{
                        height: "40px",
                        bgcolor: "white",
                        borderRadius: "0.375rem",
                        "& .MuiSelect-select": {
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                          color: "#374151",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 200,
                            bgcolor: "white",
                          },
                        },
                      }}
                    >
                      {daysOfWeekOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                          <Checkbox
                            checked={daysOfWeek.includes(day)}
                            sx={{
                              color: "#374151",
                              "&.Mui-checked": {
                                color: "#3b82f6",
                              },
                            }}
                          />
                          <ListItemText
                            primary={translateDayToVietnamese(day)}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </>
            ) : (
              <div className="w-44">
                <label
                  htmlFor="datePicker"
                  className="block text-gray-500 text-xs font-medium leading-tight mb-0.5"
                >
                  Chọn Ngày
                </label>
                <DatePicker
                  minDate={new Date()}
                  selected={startDate}
                  onChange={(date) => {
                    if (date) {
                      setStartDate(date);
                      setStartTime("");
                      setEndTime("");
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-start"
                  portalId="root"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                  customInput={
                    <TextField
                      id="datePicker"
                      size="small"
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                          height: "40px",
                          bgcolor: "white",
                          borderRadius: "0.375rem",
                        },
                        "& .MuiInputBase-input": {
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                          color: "#374151",
                          cursor: "pointer",
                        },
                      }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  }
                />
              </div>
            )}

            <Stack direction="row" alignItems="flex-end" spacing={2}>
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

              <Box marginTop="auto">
                <Button onClick={handleSearch}>Tìm kiếm</Button>
              </Box>
            </Stack>
          </div>

          <TermsDialog
            open={openTermsDialog}
            onClose={() => setOpenTermsDialog(false)}
          />

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
                  {bookingMode === "monthly"
                    ? `Đặt lịch tháng ${gameType} vào mỗi ${daysOfWeek
                        .map(translateDayToVietnamese)
                        .join(", ")} từ ${fromDate.toLocaleDateString(
                        "vi-VN"
                      )} đến ${toDate.toLocaleDateString("vi-VN")}`
                    : gameType}
                </h2>
                {bookingMode === "monthly" && chessBookings.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSelectAll}
                      variant="gradient"
                      color="blue"
                      className="py-2 px-4 text-sm"
                    >
                      Chọn Hết
                    </Button>
                    {bookingMode === "monthly" && chessBookings.length > 0 && (
                      <Button
                        onClick={handleDeselectAll}
                        variant="gradient"
                        color="red"
                        className="py-2 px-4 text-sm"
                        disabled={!hasMonthlyBookings}
                      >
                        Bỏ Chọn Hết
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <CircularProgress />
                  <span className="ml-3">Đang tải dữ liệu...</span>
                </div>
              ) : chessBookings.length > 0 ? (
                <div className="mt-6 mb-6">
                  {bookingMode === "monthly" ? (
                    Object.entries(groupedBookings).map(([day, bookings]) => (
                      <div key={day} className="mb-8">
                        <h3 className="text-xl font-semibold text-black mb-4">
                          {translateDayToVietnamese(day)}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                          {bookings.map((chessBooking) => (
                            <div
                              key={`${chessBooking.tableId}-${chessBooking.date}`}
                              className="flex flex-col items-center"
                            >
                              <p className="text-lg font-bold text-black mb-2">
                                <span className="font-medium">Ngày: </span>
                                <strong>
                                  {new Date(
                                    chessBooking.date || chessBooking.startDate
                                  ).toLocaleDateString("vi-VN")}
                                </strong>
                              </p>
                              <div
                                className={`bg-white shadow-md transition rounded-md p-3 w-full ${
                                  chessBooking.isAvailable
                                    ? "hover:shadow-lg hover:scale-105"
                                    : "opacity-70"
                                }`}
                              >
                                {!chessBooking.isAvailable ? (
                                  <div className="text-center">
                                    <p className="text-red-600 text-base font-semibold">
                                      Không có bàn nào khả dụng
                                    </p>
                                    <p className="text-gray-600 text-sm mt-2">
                                      Không có bàn trống cho ngày{" "}
                                      {new Date(
                                        chessBooking.date ||
                                          chessBooking.startDate
                                      ).toLocaleDateString("vi-VN")}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    {isBooked(
                                      chessBooking.tableId,
                                      chessBooking.startDate,
                                      chessBooking.endDate
                                    ) && (
                                      <div className="mt-2 text-sm text-green-600">
                                        {(() => {
                                          const localBooking = getLocalBooking(
                                            chessBooking.tableId,
                                            new Date(chessBooking.startDate)
                                          );
                                          if (localBooking) {
                                            return (
                                              <p>
                                                Bạn đã chọn bàn này (
                                                {localBooking.bookingMode ===
                                                "monthly"
                                                  ? "Lịch Tháng"
                                                  : "Lịch Thường"}
                                                ) từ{" "}
                                                {formatShortTime(
                                                  localBooking.startDate
                                                )}{" "}
                                                đến{" "}
                                                {formatShortTime(
                                                  localBooking.endDate
                                                )}
                                              </p>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    )}
                                    <p
                                      onClick={() =>
                                        viewBookingDetail({
                                          id: chessBooking.tableId,
                                          startDate: chessBooking.startDate,
                                          endDate: chessBooking.endDate,
                                        })
                                      }
                                      className="text-blue-500 text-sm italic cursor-pointer hover:underline"
                                    >
                                      🔍 Bấm vào để xem chi tiết bàn
                                    </p>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Loại Đặt Lịch:{" "}
                                      </span>
                                      {chessBooking.bookingMode === "monthly"
                                        ? "Lịch Tháng"
                                        : "Lịch Thường"}
                                    </p>
                                    <h3 className="text-base font-medium mt-2 text-black">
                                      Loại cờ: {chessBooking.gameType.typeName}{" "}
                                      <span className="font-medium text-black text-sm ml-1">
                                        (
                                        {Number(
                                          chessBooking.gameTypePrice
                                        ).toLocaleString("vi-VN")}{" "}
                                        ₫/giờ)
                                      </span>
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Loại Phòng:{" "}
                                      </span>
                                      {chessBooking.roomType}{" "}
                                      <span className="font-medium text-black text-sm ml-1">
                                        (
                                        {Number(
                                          chessBooking.roomTypePrice
                                        ).toLocaleString("vi-VN")}{" "}
                                        ₫/giờ)
                                      </span>
                                    </p>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Mã Bàn:{" "}
                                      </span>
                                      {chessBooking.tableId}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Tên Phòng:{" "}
                                      </span>
                                      {chessBooking.roomName}
                                    </p>
                                    <div className="text-gray-600 text-sm mt-2">
                                      <p>
                                        <span className="font-medium text-black">
                                          Giờ Bắt Đầu:{" "}
                                        </span>
                                        {new Date(
                                          chessBooking.startDate
                                        ).toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: false,
                                          timeZone: "Asia/Ho_Chi_Minh",
                                        })}
                                      </p>
                                      <p className="mt-2">
                                        <span className="font-medium text-black">
                                          Giờ Kết Thúc:{" "}
                                        </span>
                                        {new Date(
                                          chessBooking.endDate
                                        ).toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: false,
                                          timeZone: "Asia/Ho_Chi_Minh",
                                        })}
                                      </p>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Giá Thuê Theo Giờ:{" "}
                                      </span>
                                      {(
                                        chessBooking.roomTypePrice +
                                        chessBooking.gameTypePrice
                                      ).toLocaleString("vi-VN")}{" "}
                                      đ
                                    </p>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Tổng Thời Gian Đặt Bàn:{" "}
                                      </span>
                                      {formatDuration(
                                        chessBooking.durationInHours
                                      )}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-2">
                                      <span className="font-medium text-black">
                                        Tổng Giá:{" "}
                                      </span>
                                      {chessBooking.totalPrice > 0
                                        ? chessBooking.totalPrice.toLocaleString(
                                            "vi-VN",
                                            {
                                              style: "currency",
                                              currency: "VND",
                                            }
                                          )
                                        : "Không xác định"}
                                    </p>
                                    <div className="flex flex-col gap-2 mt-3">
                                      <Button
                                        variant="gradient"
                                        color="amber"
                                        className={`w-full py-2 text-sm ${
                                          isBooked(
                                            chessBooking.tableId,
                                            chessBooking.startDate,
                                            chessBooking.endDate
                                          )
                                            ? "opacity-70 cursor-not-allowed"
                                            : "hover:shadow-md transition-shadow"
                                        }`}
                                        disabled={isBooked(
                                          chessBooking.tableId,
                                          chessBooking.startDate,
                                          chessBooking.endDate
                                        )}
                                        onClick={() => {
                                          try {
                                            const newStart = new Date(
                                              chessBooking.startDate
                                            );
                                            const newEnd = new Date(
                                              chessBooking.endDate
                                            );

                                            const isAlreadyBooked =
                                              localBookings.some((booking) => {
                                                if (
                                                  booking.tableId !==
                                                  chessBooking.tableId
                                                )
                                                  return false;
                                                const bookingStart = new Date(
                                                  booking.startDate
                                                );
                                                const bookingEnd = new Date(
                                                  booking.endDate
                                                );
                                                return (
                                                  (newStart >= bookingStart &&
                                                    newStart < bookingEnd) ||
                                                  (newEnd > bookingStart &&
                                                    newEnd <= bookingEnd) ||
                                                  (newStart <= bookingStart &&
                                                    newEnd >= bookingEnd)
                                                );
                                              });

                                            if (isAlreadyBooked) {
                                              const existingBookings =
                                                localBookings.filter(
                                                  (b) =>
                                                    b.tableId ===
                                                    chessBooking.tableId
                                                );
                                              const bookingDetails =
                                                existingBookings
                                                  .map((b) => {
                                                    const start = new Date(
                                                      b.startDate
                                                    ).toLocaleTimeString(
                                                      "vi-VN",
                                                      {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                      }
                                                    );
                                                    const end = new Date(
                                                      b.endDate
                                                    ).toLocaleTimeString(
                                                      "vi-VN",
                                                      {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                      }
                                                    );
                                                    return `${start} - ${end}`;
                                                  })
                                                  .join(", ");
                                              toast.warning(
                                                `Bàn số ${chessBooking.tableId} đã được đặt trong khung giờ: ${bookingDetails}`
                                              );
                                              return;
                                            }

                                            const updatedBooking = {
                                              ...chessBooking,
                                              bookingMode,
                                            };
                                            const updatedBookings = [
                                              ...localBookings,
                                              updatedBooking,
                                            ];
                                            const startTimeStr =
                                              newStart.toLocaleTimeString(
                                                "vi-VN",
                                                {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: false,
                                                }
                                              );
                                            const endTimeStr =
                                              newEnd.toLocaleTimeString(
                                                "vi-VN",
                                                {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: false,
                                                }
                                              );

                                            localStorage.setItem(
                                              "chessBookings",
                                              JSON.stringify(updatedBookings)
                                            );
                                            setLocalBookings(updatedBookings);
                                            toast.success(
                                              `Đã thêm bàn số ${chessBooking.tableId} (${
                                                bookingMode === "monthly"
                                                  ? "Lịch Tháng"
                                                  : "Lịch Thường"
                                              }) từ ${startTimeStr} đến ${endTimeStr} vào danh sách đặt!`
                                            );
                                          } catch (error) {
                                            console.error(
                                              "Lỗi khi xử lý đặt bàn:",
                                              error
                                            );
                                            toast.error(
                                              "Có lỗi xảy ra khi đặt bàn!"
                                            );
                                          }
                                        }}
                                      >
                                        {isBooked(
                                          chessBooking.tableId,
                                          chessBooking.startDate,
                                          chessBooking.endDate
                                        )
                                          ? "Đã thêm vào danh sách"
                                          : "Thêm vào danh sách"}
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          viewBookingDetail({
                                            id: chessBooking.tableId,
                                            startDate: chessBooking.startDate,
                                            endDate: chessBooking.endDate,
                                          })
                                        }
                                        className="w-full text-xs py-2 bg-green-600 text-white"
                                      >
                                        Xem Chi Tiết
                                      </Button>
                                      <Button
                                        variant="gradient"
                                        color="red"
                                        className={`w-full text-xs py-2 ${
                                          !isBooked(
                                            chessBooking.tableId,
                                            chessBooking.startDate,
                                            chessBooking.endDate
                                          )
                                            ? "opacity-70 cursor-not-allowed"
                                            : "hover:shadow-md transition-shadow"
                                        }`}
                                        disabled={
                                          !isBooked(
                                            chessBooking.tableId,
                                            chessBooking.startDate,
                                            chessBooking.endDate
                                          )
                                        }
                                        onClick={() =>
                                          handleDeselectTable(chessBooking)
                                        }
                                      >
                                        Bỏ Chọn
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {chessBookings.map((chessBooking) => (
                        <div
                          key={`${chessBooking.tableId}-${chessBooking.date || chessBooking.startDate}`}
                          className="flex flex-col items-center"
                        >
                          <div className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105 w-full">
                            {isBooked(
                              chessBooking.tableId,
                              chessBooking.startDate,
                              chessBooking.endDate
                            ) && (
                              <div className="mt-2 text-sm text-green-600">
                                {(() => {
                                  const localBooking = getLocalBooking(
                                    chessBooking.tableId,
                                    new Date(chessBooking.startDate)
                                  );
                                  if (localBooking) {
                                    return (
                                      <p>
                                        Bạn đã chọn bàn này (
                                        {localBooking.bookingMode === "monthly"
                                          ? "Lịch Tháng"
                                          : "Lịch Thường"}
                                        ) từ{" "}
                                        {formatShortTime(
                                          localBooking.startDate
                                        )}{" "}
                                        đến{" "}
                                        {formatShortTime(localBooking.endDate)}
                                      </p>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                            <p
                              onClick={() =>
                                viewBookingDetail({
                                  id: chessBooking.tableId,
                                  startDate: chessBooking.startDate,
                                  endDate: chessBooking.endDate,
                                })
                              }
                              className="text-blue-500 text-sm italic cursor-pointer hover:underline"
                            >
                              🔍 Bấm vào để xem chi tiết bàn
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium text-black">
                                Loại Đặt Lịch:{" "}
                              </span>
                              {chessBooking.bookingMode === "monthly"
                                ? "Lịch Tháng"
                                : "Lịch Thường"}
                            </p>
                            <h3 className="text-base font-medium mt-2 text-black">
                              Loại cờ: {chessBooking.gameType.typeName}{" "}
                              <span className="font-medium text-black text-sm ml-1">
                                (
                                {Number(
                                  chessBooking.gameTypePrice
                                ).toLocaleString("vi-VN")}{" "}
                                ₫/giờ)
                              </span>
                            </h3>
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium text-black">
                                Loại Phòng:{" "}
                              </span>{" "}
                              {chessBooking.roomType}{" "}
                              <span className="font-medium text-black text-sm ml-1">
                                (
                                {Number(
                                  chessBooking.roomTypePrice
                                ).toLocaleString("vi-VN")}{" "}
                                ₫/giờ)
                              </span>
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium text-black">
                                Mã Bàn:{" "}
                              </span>{" "}
                              {chessBooking.tableId}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium text-black">
                                Tên Phòng:{" "}
                              </span>{" "}
                              {chessBooking.roomName}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium text-black">
                                Ngày:{" "}
                              </span>{" "}
                              <strong>
                                {new Date(
                                  chessBooking.date || chessBooking.startDate
                                ).toLocaleDateString("vi-VN")}
                              </strong>
                            </p>
                            <div className="text-gray-600 text-sm mt-2">
                              <p>
                                <span className="font-medium text-black">
                                  Giờ Bắt Đầu:{" "}
                                </span>
                                {new Date(
                                  chessBooking.startDate
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                  timeZone: "Asia/Ho_Chi_Minh",
                                })}
                              </p>
                              <p className="mt-2">
                                <span className="font-medium text-black">
                                  Giờ Kết Thúc:{" "}
                                </span>
                                {new Date(
                                  chessBooking.endDate
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                  timeZone: "Asia/Ho_Chi_Minh",
                                })}
                              </p>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium text-black">
                                Giá Thuê Theo Giờ:{" "}
                              </span>{" "}
                              {(
                                chessBooking.roomTypePrice +
                                chessBooking.gameTypePrice
                              ).toLocaleString("vi-VN")}{" "}
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
                                ? chessBooking.totalPrice.toLocaleString(
                                    "vi-VN",
                                    {
                                      style: "currency",
                                      currency: "VND",
                                    }
                                  )
                                : "Không xác định"}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="gradient"
                                color="amber"
                                className={`flex-1 py-2 text-sm ${
                                  isBooked(
                                    chessBooking.tableId,
                                    chessBooking.startDate,
                                    chessBooking.endDate
                                  )
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:shadow-md transition-shadow"
                                }`}
                                disabled={isBooked(
                                  chessBooking.tableId,
                                  chessBooking.startDate,
                                  chessBooking.endDate
                                )}
                                onClick={() => {
                                  try {
                                    const newStart = new Date(
                                      chessBooking.startDate
                                    );
                                    const newEnd = new Date(
                                      chessBooking.endDate
                                    );

                                    const isAlreadyBooked = localBookings.some(
                                      (booking) => {
                                        if (
                                          booking.tableId !==
                                          chessBooking.tableId
                                        )
                                          return false;

                                        const bookingStart = new Date(
                                          booking.startDate
                                        );
                                        const bookingEnd = new Date(
                                          booking.endDate
                                        );

                                        return (
                                          (newStart >= bookingStart &&
                                            newStart < bookingEnd) ||
                                          (newEnd > bookingStart &&
                                            newEnd <= bookingEnd) ||
                                          (newStart <= bookingStart &&
                                            newEnd >= bookingEnd)
                                        );
                                      }
                                    );

                                    if (isAlreadyBooked) {
                                      const existingBookings =
                                        localBookings.filter(
                                          (b) =>
                                            b.tableId === chessBooking.tableId
                                        );

                                      const bookingDetails = existingBookings
                                        .map((b) => {
                                          const start = new Date(
                                            b.startDate
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                          });
                                          const end = new Date(
                                            b.endDate
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                          });
                                          return `${start} - ${end}`;
                                        })
                                        .join(", ");

                                      toast.warning(
                                        `Bàn số ${chessBooking.tableId} đã được đặt trong khung giờ: ${bookingDetails}`
                                      );
                                      return;
                                    }

                                    const updatedBooking = {
                                      ...chessBooking,
                                      bookingMode,
                                    };

                                    const updatedBookings = [
                                      ...localBookings,
                                      updatedBooking,
                                    ];

                                    const startTimeStr =
                                      newStart.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      });
                                    const endTimeStr =
                                      newEnd.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      });

                                    localStorage.setItem(
                                      "chessBookings",
                                      JSON.stringify(updatedBookings)
                                    );
                                    setLocalBookings(updatedBookings);
                                    toast.success(
                                      `Đã thêm bàn số ${chessBooking.tableId} (${
                                        chessBooking.bookingMode === "monthly"
                                          ? "Lịch Tháng"
                                          : "Lịch Thường"
                                      }) từ ${startTimeStr} đến ${endTimeStr} vào danh sách đặt!`
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Lỗi khi xử lý đặt bàn:",
                                      error
                                    );
                                    toast.error("Có lỗi xảy ra khi đặt bàn!");
                                  }
                                }}
                              >
                                {isBooked(
                                  chessBooking.tableId,
                                  chessBooking.startDate,
                                  chessBooking.endDate
                                )
                                  ? "Đã thêm vào danh sách"
                                  : "Thêm vào danh sách"}
                              </Button>
                              <Button
                                onClick={() =>
                                  viewBookingDetail({
                                    id: chessBooking.tableId,
                                    startDate: chessBooking.startDate,
                                    endDate: chessBooking.endDate,
                                  })
                                }
                                className="text-xs px-2 py-1 bg-green-600 text-white"
                              >
                                Xem Chi Tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Không tìm thấy bàn cờ phù hợp</p>
                </div>
              )}

              {bookingMode !== "monthly" && totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-8">
                  <DefaultPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
