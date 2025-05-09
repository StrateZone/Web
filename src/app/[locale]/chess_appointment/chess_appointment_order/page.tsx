"use client";
import { useState, useEffect } from "react";
import { Button, Input, Select, Option } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { UserPlus, UserX, X } from "lucide-react";
import CouponsPage from "../coupon_modal/CouponsPage";
import { useParams, useRouter } from "next/navigation";
import OrderAttention from "@/components/OrderAttention/page";
import { ConfirmBookingPopup } from "./ConfirmBookingPopup";
import { InsufficientBalancePopup } from "./InsufficientBalancePopup";
import { useLocale } from "next-intl";
import { PastTimePopup } from "./SelectTimeInThePast";
import { UnavailableTablesPopup } from "./UnavailableTablesPopup";
import { SuccessBookingPopup } from "./BookingSuccess";
import OpponentRecommendationModal from "./FriendListModal ";
import { toast } from "react-toastify";
import { ConfirmCancelPopup } from "./ConfirmCancelPopup";
import { CloseTimeWarningPopup } from "./CloseTimeWarningPopup";
import TermsDialog from "../chess_category/TermsDialog";
import VoucherModal from "./VoucherModal";
import RedeemVoucherModal from "./RedeemVoucherModal";

interface InvitedUser {
  userId: number;
  username: string;
  avatarUrl: string | null;
}

export interface Voucher {
  voucherId: number;
  voucherName: string;
  value: number;
  minPriceCondition: number;
  description: string;
  pointsCost: number;
  contributionPointsCost: number;
  isSample?: boolean;
  userId?: number;
  expireDate?: string | null;
  status?: number;
}

export interface ChessBooking {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  durationInHours: number;
  endDate: string;
  gameType: {
    typeId: number;
    typeName: string;
  };
  gameTypeId: number;
  gameTypePrice: number;
  roomDescription: string;
  roomTypePrice: number;
  startDate: string;
  totalPrice: number;
  hasInvitations?: boolean;
  originalPrice?: number;
  invitedUsers?: InvitedUser[];
  appliedVoucher?: Voucher | null;
}

interface BackendUnavailableTable {
  table_id: number;
  start_time: string;
  end_time: string;
}

interface TableNotAvailableError {
  error: {
    code: string;
    message: string;
    unavailable_tables: BackendUnavailableTable[];
  };
}

interface UnavailableTable {
  tableId: number;
  startTime: string;
  endTime: string;
}

interface UnavailableTableWithRaw extends UnavailableTable {
  rawStartTime: string;
  rawEndTime: string;
}

interface Opponent {
  userId: number;
  username: string;
  avatarUrl: string | null;
}

const TableBookingPage = () => {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState<Record<string, boolean>>({});
  const localActive = useLocale();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [chessBookings, setChessBookings] = useState<ChessBooking[]>([]);
  const { locale } = useParams();
  const [showOpponentModal, setShowOpponentModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [openRedeemVoucherModal, setOpenRedeemVoucherModal] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    tableId: number;
    startDate: string;
    endDate: string;
  } | null>(null);
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";
  const handleTokenExpiration = async (retryCallback: () => Promise<void>) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Không có refresh token, vui lòng đăng nhập lại");
      }

      console.log("Sending refreshToken:", refreshToken); // Debug
      const response = await fetch(
        `${API_BASE_URL}/api/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            // Remove Content-Type since we're not sending a JSON body
            // Authorization header may still be needed if the API requires it
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Refresh token error:", errorData); // Debug
        throw new Error(errorData.message || "Không thể làm mới token");
      }

      // Since the API returns 204, there may be no response body
      // Check if the API sets the new token in headers or elsewhere
      const newToken = response.headers.get("x-access-token"); // Adjust based on API behavior
      if (newToken) {
        localStorage.setItem("accessToken", newToken);
      } else {
        // If the API returns a JSON body (based on your original code), parse it
        const data = await response.json();
        localStorage.setItem("accessToken", data.data.newToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
      }

      await retryCallback();
    } catch (error) {
      console.error("Token refresh failed:", error);
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");
      // localStorage.removeItem("authData");
      // // Chỉ chuyển hướng nếu cần
      // document.cookie =
      //   "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      // document.cookie =
      //   "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      // window.location.href = "/login";
    }
  };
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const sampleResponse = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/vouchers/samples",
          {
            headers: {
              accept: "*/*",
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (sampleResponse.status === 401) {
          await handleTokenExpiration(fetchVouchers);
          return;
        }
        if (sampleResponse.ok) {
          const sampleData = await sampleResponse.json();
          setAvailableVouchers(sampleData.pagedList);
        }

        const authDataString = localStorage.getItem("authData");
        if (authDataString) {
          const authData = JSON.parse(authDataString);
          const userResponse = await fetch(
            `https://backend-production-ac5e.up.railway.app/api/vouchers/of-user/${authData.userId}`,
            {
              headers: {
                accept: "*/*",
                authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          if (userResponse.status === 401) {
            await handleTokenExpiration(fetchVouchers);
            return;
          }
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserVouchers(userData.pagedList);
          }
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast.error("Không thể tải danh sách voucher");
      }
    };

    fetchVouchers();
  }, []);

  useEffect(() => {
    const savedBookings = localStorage.getItem("chessBookings");
    if (savedBookings) {
      try {
        const parsedBookings: ChessBooking[] = JSON.parse(savedBookings);
        setChessBookings(parsedBookings);
      } catch (error) {
        console.error("Error parsing data from localStorage:", error);
      }
    }
  }, []);

  const handleRedeemSuccess = (newVoucher: Voucher) => {
    setUserVouchers((prev) => [...prev, newVoucher]);
  };

  const handleApplyVoucher = (
    tableId: number,
    startDate: string,
    endDate: string,
    voucher: Voucher | null
  ) => {
    console.log("=== Starting handleApplyVoucher ===");
    console.log("Input parameters:", {
      tableId,
      startDate,
      endDate,
      voucher: voucher
        ? {
            voucherId: voucher.voucherId,
            voucherName: voucher.voucherName,
            value: voucher.value,
            minPriceCondition: voucher.minPriceCondition,
          }
        : null,
    });

    let voucherApplied = false;
    const updatedBookings = chessBookings.map((booking) => {
      if (
        voucher &&
        booking.appliedVoucher?.voucherId === voucher.voucherId &&
        (booking.tableId !== tableId ||
          booking.startDate !== startDate ||
          booking.endDate !== endDate)
      ) {
        console.log(
          `Removing voucher ${voucher.voucherId} from table ${booking.tableId}`
        );
        const basePrice =
          (booking.roomTypePrice + booking.gameTypePrice) *
          booking.durationInHours;
        let newTotalPrice = basePrice;
        if (booking.hasInvitations) {
          newTotalPrice *= 0.5;
        }
        return {
          ...booking,
          appliedVoucher: null,
          totalPrice: newTotalPrice,
          originalPrice: basePrice,
        };
      }

      if (
        booking.tableId === tableId &&
        booking.startDate === startDate &&
        booking.endDate === endDate
      ) {
        const basePrice =
          (booking.roomTypePrice + booking.gameTypePrice) *
          booking.durationInHours;
        let newTotalPrice = basePrice;
        let voucherDiscount = 0;

        if (voucher) {
          if (basePrice >= voucher.minPriceCondition) {
            console.log(
              `Applying voucher ${voucher.voucherId} to table ${tableId}`
            );
            voucherDiscount = voucher.value;
            newTotalPrice -= voucherDiscount;
            voucherApplied = true;
          } else {
            console.log(
              `Cannot apply voucher ${voucher.voucherId}: basePrice = ${basePrice} < minPriceCondition = ${voucher.minPriceCondition}`
            );
            toast.error(
              `Giá bàn (${basePrice.toLocaleString()}đ) nhỏ hơn giá tối thiểu để sử dụng voucher (${voucher.minPriceCondition.toLocaleString()}đ)`
            );
            return booking;
          }
        } else {
          console.log(`Removing voucher from table ${tableId}`);
        }

        if (booking.hasInvitations) {
          newTotalPrice *= 0.5;
        }

        console.log("Final calculations:", {
          basePrice,
          voucherDiscount,
          hasInvitations: booking.hasInvitations,
          newTotalPrice,
        });

        return {
          ...booking,
          appliedVoucher: voucher,
          totalPrice: newTotalPrice,
          originalPrice: basePrice,
        };
      }

      return booking;
    });

    console.log(
      "Updated bookings:",
      updatedBookings.map((b) => ({
        tableId: b.tableId,
        totalPrice: b.totalPrice,
        appliedVoucher: b.appliedVoucher ? b.appliedVoucher.voucherId : null,
      }))
    );

    setChessBookings(updatedBookings);
    localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
    setShowVoucherModal(false);
    if (voucherApplied) {
      toast.success("Áp dụng voucher thành công!");
    } else if (!voucher) {
      toast.success("Đã xóa voucher!");
    }
    console.log("=== Finished handleApplyVoucher ===");
  };

  const handleCancelInvitation = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    if (isLoading) return;

    const loadingKey = `${tableId}|${startDate}|${endDate}`;
    try {
      setLocalLoading((prev) => ({ ...prev, [loadingKey]: true }));

      const updatedBookings = chessBookings.map((booking) => {
        if (
          booking.tableId === tableId &&
          booking.startDate === startDate &&
          booking.endDate === endDate
        ) {
          const basePrice =
            (booking.roomTypePrice + booking.gameTypePrice) *
            booking.durationInHours;
          let newTotalPrice = basePrice;
          if (
            booking.appliedVoucher &&
            basePrice >= booking.appliedVoucher.minPriceCondition
          ) {
            newTotalPrice -= booking.appliedVoucher.value;
          }

          return {
            ...booking,
            hasInvitations: false,
            invitedUsers: [],
            totalPrice: newTotalPrice,
            originalPrice: basePrice,
          };
        }
        return booking;
      });

      setChessBookings(updatedBookings);
      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      toast.info(
        `Đã hủy tất cả lời mời cho bàn số ${tableId} (${formatTime(
          startDate
        )} - ${formatTime(endDate)})`
      );
    } catch (error) {
      console.error("Error canceling invitations:", error);
      toast.error("Có lỗi xảy ra khi hủy lời mời");
    } finally {
      setLocalLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleInviteSuccess = (opponent: Opponent, tableId: number) => {
    const invitedUser: InvitedUser = {
      userId: opponent.userId,
      username: opponent.username,
      avatarUrl: opponent.avatarUrl,
    };

    const updatedBookings = chessBookings.map((booking) => {
      if (
        booking.tableId === tableId &&
        booking.startDate === selectedStartDate && // Kiểm tra startDate
        booking.endDate === selectedEndDate
      ) {
        const existingInvites = booking.invitedUsers || [];
        const isAlreadyInvited = existingInvites.some(
          (u) => u.userId === opponent.userId
        );

        if (isAlreadyInvited) {
          return booking;
        }

        const newInvitedUsers = [...existingInvites, invitedUser];
        const hasInvitations = newInvitedUsers.length > 0;
        let newTotalPrice =
          (booking.roomTypePrice + booking.gameTypePrice) *
          booking.durationInHours;

        if (
          booking.appliedVoucher &&
          newTotalPrice >= booking.appliedVoucher.minPriceCondition
        ) {
          newTotalPrice -= booking.appliedVoucher.value;
        }

        if (hasInvitations) {
          newTotalPrice *= 0.5;
        }

        return {
          ...booking,
          invitedUsers: newInvitedUsers,
          hasInvitations,
          totalPrice: newTotalPrice,
          originalPrice:
            (booking.roomTypePrice + booking.gameTypePrice) *
            booking.durationInHours,
        };
      }
      return booking;
    });

    setChessBookings(updatedBookings);
    localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
  };

  const removeTable = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    if (isLoading) return;

    const loadingKey = `${tableId}|${startDate}|${endDate}`;
    try {
      setLocalLoading((prev) => ({ ...prev, [loadingKey]: true }));

      const booking = chessBookings.find(
        (b) =>
          b.tableId === tableId &&
          b.startDate === startDate &&
          b.endDate === endDate
      );

      if (booking?.invitedUsers && booking.invitedUsers.length > 0) {
        const isConfirmed = await ConfirmCancelPopup();
        if (!isConfirmed) {
          return;
        }
      }

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
    } catch (error) {
      console.error("Error removing table:", error);
      toast.error("Có lỗi xảy ra khi xóa bàn");
    } finally {
      setLocalLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDuration = (hours: number): string => {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);

    if (fullHours === 0) {
      return `${minutes} phút`;
    } else if (minutes === 0) {
      return `${fullHours} tiếng`;
    } else {
      return `${fullHours} tiếng ${minutes} phút`;
    }
  };

  const GAME_TYPE_TRANSLATIONS: Record<string, string> = {
    chess: "Cờ Vua",
    xiangqi: "Cờ Tướng",
    go: "Cờ Vây",
  };

  const translateRoomType = (roomType?: string): string => {
    if (!roomType) return "Không xác định";

    const type = roomType.toLowerCase();
    if (type.includes("basic")) return "Phòng thường";
    if (type.includes("premium")) return "Phòng cao cấp";
    if (type.includes("openspace") || type.includes("open space"))
      return "Không gian mở";

    return roomType;
  };

  const totalPrice = chessBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );
  const finalPrice = totalPrice;

  const viewBookingDetail = (bookingInfo: {
    id: number;
    startDate: string;
    endDate: string;
  }) => {
    if (isLoading) return;
    router.push(
      `/${locale}/chess_appointment/${bookingInfo.id}?startTime=${encodeURIComponent(
        bookingInfo.startDate
      )}&endTime=${encodeURIComponent(bookingInfo.endDate)}`
    );
  };

  const inviteFriend = (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    if (isLoading) return;
    setSelectedTableId(tableId);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setShowOpponentModal(true);
  };

  const handleConfirmBooking = async () => {
    const isConfirmed = await ConfirmBookingPopup({
      chessBookings,
      finalPrice,
    });
    if (!isConfirmed) return;

    const now = new Date();
    const closeToNowBookings = chessBookings.filter(
      (booking) =>
        new Date(booking.startDate).getTime() - now.getTime() < 90 * 60 * 1000
    );

    if (closeToNowBookings.length > 0) {
      const confirmContinue = await CloseTimeWarningPopup({
        closeBookings: closeToNowBookings.map((b) => ({
          tableId: b.tableId,
          startTime: formatTime(b.startDate),
          gameType: b.gameType.typeName,
          roomType: b.roomType,
        })),
      });

      if (!confirmContinue) return;
    }

    try {
      setIsLoading(true);
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) {
        alert("Vui lòng đăng nhập để đặt bàn");
        router.push(`/${locale}/login`);
        setIsLoading(false);
        return;
      }

      if (chessBookings.length === 0) {
        alert("Vui lòng chọn ít nhất một bàn để đặt");
        return;
      }

      const authData = JSON.parse(authDataString);
      const requestData = {
        userId: authData.userId,
        tablesAppointmentRequests: chessBookings.map((booking) => ({
          price: booking.totalPrice,
          tableId: booking.tableId,
          scheduleTime: booking.startDate,
          endTime: booking.endDate,
          invitedUsers: booking.invitedUsers?.map((user) => user.userId) || [],
          voucherId: booking.appliedVoucher?.voucherId || null,
        })),
        totalPrice: finalPrice,
      };

      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/payments/booking-payment",
        {
          method: "POST",
          headers: {
            accept: "text/plain",
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(requestData),
        }
      );
      if (response.status === 401) {
        await handleTokenExpiration(() => handleConfirmBooking());
        return;
      }
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || `HTTP ${response.status}`);
      }

      localStorage.removeItem("chessBookings");
      setChessBookings([]);
      setDiscount(0);
      setCoupon("");

      const userChoice = await SuccessBookingPopup();
      if (userChoice) {
        router.push(`/${localActive}/appointment_ongoing`);
      } else {
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý:", error);

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
          const pastBookings = chessBookings
            .filter((booking) => new Date(booking.startDate) <= now)
            .map((booking) => ({
              tableId: booking.tableId,
              startTime: formatTime(booking.startDate),
              endTime: formatTime(booking.endDate),
            }));

          await PastTimePopup({
            pastBookings: pastBookings,
          });

          const validBookings = chessBookings.filter(
            (booking) => new Date(booking.startDate) > now
          );
          setChessBookings(validBookings);
          localStorage.setItem("chessBookings", JSON.stringify(validBookings));
        } else if (
          error.message.includes("TABLE_NOT_AVAILABLE") ||
          error.message.includes("This table is being booked by someone else")
        ) {
          try {
            let unavailableTablesWithRaw: UnavailableTableWithRaw[] = [];

            if (error.message.includes("TABLE_NOT_AVAILABLE")) {
              const errorData = JSON.parse(error.message);
              unavailableTablesWithRaw = errorData.error.unavailable_tables.map(
                (t: BackendUnavailableTable) => ({
                  tableId: t.table_id,
                  startTime: formatTime(t.start_time),
                  endTime: formatTime(t.end_time),
                  rawStartTime: t.start_time,
                  rawEndTime: t.end_time,
                })
              );
            } else if (
              error.message.includes(
                "This table is being booked by someone else"
              )
            ) {
              const match = error.message.match(
                /Table ID (\d+), schedule time: ([^,]+), end time: ([^"]+)/
              );
              if (match) {
                const rawStartTime = new Date(match[2]).toISOString();
                const rawEndTime = new Date(match[3]).toISOString();
                unavailableTablesWithRaw = [
                  {
                    tableId: parseInt(match[1]),
                    startTime: formatTime(match[2]),
                    endTime: formatTime(match[3]),
                    rawStartTime,
                    rawEndTime,
                  },
                ];
              } else {
                throw new Error("Invalid error format for booked table");
              }
            }

            const unavailableTables: UnavailableTable[] =
              unavailableTablesWithRaw.map(
                ({ tableId, startTime, endTime }) => ({
                  tableId,
                  startTime,
                  endTime,
                })
              );

            await UnavailableTablesPopup({ unavailableTables });

            const updatedBookings = chessBookings.filter((booking) => {
              return !unavailableTablesWithRaw.some(
                (unavailable) =>
                  booking.tableId === unavailable.tableId &&
                  booking.startDate === unavailable.rawStartTime &&
                  booking.endDate === unavailable.rawEndTime
              );
            });

            setChessBookings(updatedBookings);
            localStorage.setItem(
              "chessBookings",
              JSON.stringify(updatedBookings)
            );
          } catch (parseError) {
            console.error(
              "Error parsing unavailable/booked tables:",
              parseError
            );
            toast.error("Có lỗi khi xử lý thông báo bàn không khả dụng");
          }
        } else {
          toast.error("Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Spinner = ({ size = 5 }: { size?: number }) => (
    <svg
      className={`animate-spin h-${size} w-${size}`}
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
  );

  return (
    <div className="text-base">
      <Navbar />
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="min-h-[300px] relative z-30 h-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            Đặt Bàn - Thi Đấu Cùng Bạn Bè
          </h2>
          <p className="sm:text-xl text-lg text-center text-gray-200">
            Kết nối - Cạnh tranh - Tỏa sáng
          </p>
        </div>
      </div>

      <div className="mt-10">
        <OrderAttention />
      </div>

      <div className="min-h-[calc(100vh-200px)] bg-gray-100 p-6 text-black">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Đơn đặt bàn của bạn
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
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
                chessBookings.map((booking) => {
                  const loadingKey = `${booking.tableId}|${booking.startDate}|${booking.endDate}`;
                  const isLoadingLocal = localLoading[loadingKey] || false;

                  return (
                    <div
                      key={`${booking.tableId}|${booking.startDate}|${booking.endDate}`}
                      className="border-2 p-4 rounded-lg flex items-center relative"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4 text-base">
                        <div>
                          <div className="col-span-2 mb-2">
                            <p
                              className={`text-blue-500 text-sm italic cursor-pointer hover:underline ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              onClick={() => {
                                if (!isLoading) {
                                  viewBookingDetail({
                                    id: booking.tableId,
                                    startDate: booking.startDate,
                                    endDate: booking.endDate,
                                  });
                                }
                              }}
                            >
                              🔍 Bấm vào để xem chi tiết bàn
                            </p>
                          </div>
                          <p>
                            <span className="font-bold text-lg">Loại Cờ: </span>
                            {GAME_TYPE_TRANSLATIONS[
                              booking?.gameType?.typeName?.toLowerCase?.() || ""
                            ] ||
                              booking?.gameType?.typeName ||
                              "Không rõ"}
                          </p>
                          <p>
                            <span className="font-bold text-lg">
                              Loại Phòng:{" "}
                            </span>
                            {translateRoomType(booking.roomType)}
                          </p>
                          <p>
                            <span className="font-bold text-lg">Mã Bàn: </span>
                            {booking.tableId}
                          </p>
                          <p>
                            <span className="font-bold text-lg">
                              Tên Phòng:{" "}
                            </span>
                            {booking.roomName}
                          </p>
                          <p>
                            <span className="font-bold text-lg">
                              Tổng Thời Gian Thuê Bàn:{" "}
                            </span>
                            {formatDuration(booking.durationInHours)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>
                            <span className="font-bold text-lg">
                              Ngày Đặt:{" "}
                            </span>
                            {formatDate(booking.startDate)}
                          </p>
                          <p>
                            <span className="font-bold text-lg">
                              Giờ Bắt Đầu:{" "}
                            </span>
                            {formatTime(booking.startDate)}
                          </p>
                          <p>
                            <span className="font-bold text-lg">
                              Giờ Kết thúc:{" "}
                            </span>
                            {formatTime(booking.endDate)}
                          </p>
                          <p>
                            <span className="font-bold text-lg">
                              Giá Thuê Theo Giờ:{" "}
                            </span>
                            {(
                              booking.roomTypePrice + booking.gameTypePrice
                            ).toLocaleString("vi-VN")}
                            đ
                          </p>
                          <p className="mt-2">
                            <span className="font-bold text-lg">Tổng: </span>
                            {booking.totalPrice?.toLocaleString()}đ
                            {booking.hasInvitations && (
                              <span className="text-green-600 ml-2">
                                (Thanh Toán Trước 50%)
                              </span>
                            )}
                            {booking.appliedVoucher && (
                              <span className="text-blue-600 ml-2">
                                (Voucher: -
                                {booking.appliedVoucher.value.toLocaleString()}
                                đ)
                              </span>
                            )}
                            {booking.originalPrice &&
                              booking.originalPrice !== booking.totalPrice && (
                                <span className="text-gray-500 ml-2 line-through">
                                  {booking.originalPrice.toLocaleString()}đ
                                </span>
                              )}
                          </p>
                          <div className="mt-4">
                            <Button
                              onClick={() => {
                                setSelectedBooking({
                                  tableId: booking.tableId,
                                  startDate: booking.startDate,
                                  endDate: booking.endDate,
                                });
                                setShowVoucherModal(true);
                              }}
                              variant="outlined"
                              className="text-sm"
                              disabled={isLoading || isLoadingLocal}
                            >
                              {booking.appliedVoucher
                                ? `Voucher: ${booking.appliedVoucher.voucherName}`
                                : "Chọn Voucher"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-2 flex items-center">
                        {booking.invitedUsers &&
                          booking.invitedUsers.length > 0 && (
                            <div className="flex -space-x-2 mr-2">
                              {booking.invitedUsers.map((user) => (
                                <div
                                  key={user.userId}
                                  className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                                  title={user.username}
                                >
                                  {user.avatarUrl ? (
                                    <img
                                      src={user.avatarUrl}
                                      alt={user.username}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/default-avatar.png";
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="w-full h-full flex items-center justify-center bg-blue-500 text-white text \n
                                    text-xs font-bold"
                                    >
                                      {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="flex items-center ml-4 space-x-3">
                        <button
                          onClick={() =>
                            !isLoading &&
                            inviteFriend(
                              booking.tableId,
                              booking.startDate,
                              booking.endDate
                            )
                          }
                          className={`text-blue-500 hover:text-blue-700 p-2 ${
                            isLoading || isLoadingLocal
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title="Mời bạn vào bàn này"
                          disabled={isLoadingLocal || isLoading}
                        >
                          {isLoadingLocal ? (
                            <Spinner size={4} />
                          ) : (
                            <UserPlus size={24} />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            !isLoading &&
                            handleCancelInvitation(
                              booking.tableId,
                              booking.startDate,
                              booking.endDate
                            )
                          }
                          className={`p-2 ${
                            !booking.hasInvitations ||
                            isLoading ||
                            isLoadingLocal
                              ? "text-gray-400 hover:text-gray-400 cursor-not-allowed"
                              : "text-red-500 hover:text-red-700"
                          }`}
                          title={
                            !booking.hasInvitations
                              ? "Chưa mời ai"
                              : isLoading || isLoadingLocal
                                ? "Đang xử lý..."
                                : "Hủy Mời Bạn"
                          }
                          disabled={
                            !booking.hasInvitations ||
                            isLoadingLocal ||
                            isLoading
                          }
                        >
                          {isLoadingLocal ? (
                            <Spinner size={4} />
                          ) : (
                            <UserX size={24} />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            !isLoading &&
                            removeTable(
                              booking.tableId,
                              booking.startDate,
                              booking.endDate
                            )
                          }
                          className={`text-red-500 hover:text-red-700 p-2 ${
                            isLoading || isLoadingLocal
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={
                            isLoading || isLoadingLocal
                              ? "Đang xử lý..."
                              : "Xóa bàn này"
                          }
                          disabled={isLoadingLocal || isLoading}
                        >
                          {isLoadingLocal ? (
                            <Spinner size={4} />
                          ) : (
                            <X size={24} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mb-6 flex justify-between items-center">
              <p className="font-bold text-xl">
                Thành tiền: {finalPrice.toLocaleString()}đ
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setOpenTermsDialog(true)}
                variant="outlined"
                className="px-6 py-3 text-base"
                disabled={isLoading}
              >
                Xem Điều Khoản
              </Button>
              <Button
                onClick={() => setOpenRedeemVoucherModal(true)}
                variant="outlined"
                className="px-6 py-3 text-base"
                disabled={isLoading}
              >
                Đổi Voucher
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="hover:bg-gray-900 text-white px-12 py-3 text-base"
                disabled={chessBookings.length === 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size={5} />
                    <span className="ml-2">Đang xử lý...</span>
                  </div>
                ) : (
                  "Xác nhận đặt bàn"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <VoucherModal
        open={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        userVouchers={userVouchers}
        availableVouchers={availableVouchers}
        selectedBooking={selectedBooking}
        chessBookings={chessBookings}
        handleApplyVoucher={handleApplyVoucher}
        handleRedeemVoucher={() => {}}
      />

      <RedeemVoucherModal
        open={openRedeemVoucherModal}
        onClose={() => setOpenRedeemVoucherModal(false)}
        availableVouchers={availableVouchers}
        onRedeemSuccess={handleRedeemSuccess}
      />

      {showCouponModal && (
        <CouponsPage
          onClose={() => setShowCouponModal(false)}
          setCoupon={setCoupon}
          setDiscount={setDiscount}
        />
      )}
      {selectedTableId && (
        <OpponentRecommendationModal
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          tableId={selectedTableId}
          open={showOpponentModal}
          onClose={() => setShowOpponentModal(false)}
          onInviteSuccess={(opponent) =>
            handleInviteSuccess(opponent, selectedTableId)
          }
        />
      )}
      <TermsDialog
        open={openTermsDialog}
        onClose={() => setOpenTermsDialog(false)}
      />

      <Footer />
    </div>
  );
};

export default TableBookingPage;
