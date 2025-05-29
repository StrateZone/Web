"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Select,
  Option,
} from "@material-tailwind/react";
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
  payFullPrice?: boolean;
  bookingMode: "regular" | "monthly";
}

interface BackendUnavailableTable {
  table_id: number;
  start_time: string;
  end_time: string;
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
  const [activeTab, setActiveTab] = useState<"regular" | "monthly">("regular");
  const handleDeselectAllMonthly = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (monthlyBookings.length === 0) {
        toast.info("Không có bàn đặt lịch tháng nào để bỏ chọn!");
        return;
      }

      // Check if any monthly bookings have invitations
      const bookingsWithInvitations = monthlyBookings.filter(
        (booking) => booking.invitedUsers && booking.invitedUsers.length > 0
      );

      if (bookingsWithInvitations.length > 0) {
        const isConfirmed = await ConfirmCancelPopup();
        if (!isConfirmed) {
          setIsLoading(false);
          return;
        }
      }

      // Filter out monthly bookings, keep regular bookings
      const updatedBookings = chessBookings.filter(
        (booking) => booking.bookingMode !== "monthly"
      );

      setChessBookings(updatedBookings);
      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      toast.success("Đã bỏ chọn tất cả các bàn đặt lịch tháng!");
    } catch (error) {
      console.error("Lỗi khi bỏ chọn tất cả bàn lịch tháng:", error);
      toast.error("Có lỗi xảy ra khi bỏ chọn tất cả bàn lịch tháng!");
    } finally {
      setIsLoading(false);
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
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authData");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          document.cookie =
            "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          setTimeout(() => {
            window.location.href = `/${localActive}/login`;
          }, 2000);
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
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("authData");
            document.cookie =
              "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
            document.cookie =
              "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
            setTimeout(() => {
              window.location.href = `/${localActive}/login`;
            }, 2000);
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
  }, [localActive]);

  useEffect(() => {
    const savedBookings = localStorage.getItem("chessBookings");
    if (savedBookings) {
      try {
        const parsedBookings: ChessBooking[] = JSON.parse(savedBookings);
        setChessBookings(
          parsedBookings.map((booking) => ({
            ...booking,
            bookingMode: booking.bookingMode || "regular",
          }))
        );
      } catch (error) {
        console.error("Error parsing data from localStorage:", error);
        localStorage.removeItem("chessBookings");
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
    let voucherApplied = false;
    const updatedBookings = chessBookings.map((booking) => {
      if (
        voucher &&
        booking.appliedVoucher?.voucherId === voucher.voucherId &&
        (booking.tableId !== tableId ||
          booking.startDate !== startDate ||
          booking.endDate !== endDate)
      ) {
        const basePrice =
          (booking.roomTypePrice + booking.gameTypePrice) *
          booking.durationInHours;
        let newTotalPrice = basePrice;
        if (booking.hasInvitations && !booking.payFullPrice) {
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
            voucherDiscount = voucher.value;
            newTotalPrice -= voucherDiscount;
            voucherApplied = true;
          } else {
            toast.error(
              `Giá bàn (${basePrice.toLocaleString()}đ) nhỏ hơn giá tối thiểu để sử dụng voucher (${voucher.minPriceCondition.toLocaleString()}đ)`
            );
            return booking;
          }
        }

        if (booking.hasInvitations && !booking.payFullPrice) {
          newTotalPrice *= 0.5;
        }

        return {
          ...booking,
          appliedVoucher: voucher,
          totalPrice: newTotalPrice,
          originalPrice: basePrice,
        };
      }

      return booking;
    });

    setChessBookings(updatedBookings);
    localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
    setShowVoucherModal(false);
    if (voucherApplied) {
      toast.success("Áp dụng voucher thành công!");
    } else if (!voucher) {
      toast.success("Đã xóa voucher!");
    }
  };

  const handleCancelInvitation = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    if (isLoading) return;

    const loadingKey = `${tableId}-${startDate}-${endDate}`;
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
            payFullPrice: false,
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
        booking.startDate === selectedStartDate &&
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

        if (hasInvitations && !booking.payFullPrice) {
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
          payFullPrice: booking.payFullPrice ?? false,
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

    const loadingKey = `${tableId}-${startDate}-${endDate}`;
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

  const regularBookings = chessBookings.filter(
    (booking) => booking.bookingMode === "regular"
  );
  const monthlyBookings = chessBookings.filter(
    (booking) => booking.bookingMode === "monthly"
  );

  const regularTotalPrice = regularBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );
  const monthlyTotalPrice = monthlyBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );

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

  const handleConfirmBooking = async (isMonthly: boolean) => {
    const bookingsToProcess = isMonthly ? monthlyBookings : regularBookings;
    const finalPrice = isMonthly ? monthlyTotalPrice : regularTotalPrice;

    if (bookingsToProcess.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bàn để đặt");
      return;
    }

    const isConfirmed = await ConfirmBookingPopup({
      chessBookings: bookingsToProcess,
      finalPrice,
    });
    if (!isConfirmed) return;

    const now = new Date();
    const closeToNowBookings = bookingsToProcess.filter(
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
        toast.error("Vui lòng đăng nhập để đặt bàn");
        router.push(`/${locale}/login`);
        return;
      }

      const authData = JSON.parse(authDataString);
      const requestData = {
        userId: authData.userId,
        isMonthlyAppointment: isMonthly,
        tablesAppointmentRequests: bookingsToProcess.map((booking) => ({
          price: booking.totalPrice,
          tableId: booking.tableId,
          scheduleTime: booking.startDate,
          endTime: booking.endDate,
          invitedUsers: booking.invitedUsers?.map((user) => user.userId) || [],
          voucherId: booking.appliedVoucher?.voucherId || null,
          paidForOpponent: booking.payFullPrice || false,
        })),
        totalPrice: finalPrice,
      };

      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/payments/booking-payment",
        {
          method: "POST",
          headers: {
            Accept: "text/plain",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        setTimeout(() => {
          router.push(`/${localActive}/login`);
        }, 2000);
        return;
      }

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || `HTTP ${response.status}`);
      }

      const updatedBookings = chessBookings.filter(
        (booking) => booking.bookingMode !== (isMonthly ? "monthly" : "regular")
      );
      setChessBookings(updatedBookings);
      localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
      setDiscount(0);
      setCoupon("");

      const userChoice = await SuccessBookingPopup();
      if (userChoice) {
        router.push(`/${localActive}/appointment_ongoing`);
      } else {
        router.push(`/${localActive}/chess_appointment/chess_category`);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Balance is not enough")) {
          const isConfirmed = await InsufficientBalancePopup({
            finalPrice,
          });
          if (isConfirmed) {
            router.push(`/${localActive}/wallet`);
          }
        } else if (error.message.includes("Can not select time in the past")) {
          const now = new Date();
          const pastBookings = bookingsToProcess
            .filter((booking) => new Date(booking.startDate) <= now)
            .map((booking) => ({
              tableId: booking.tableId,
              startTime: formatTime(booking.startDate),
              endTime: formatTime(booking.endDate),
            }));

          await PastTimePopup({
            pastBookings,
          });

          const updatedBookings = chessBookings.filter(
            (booking) =>
              !(
                booking.bookingMode === (isMonthly ? "monthly" : "regular") &&
                new Date(booking.startDate) <= now
              )
          );
          setChessBookings(updatedBookings);
          localStorage.setItem(
            "chessBookings",
            JSON.stringify(updatedBookings)
          );
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
            } else {
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

            const unavailableTables = unavailableTablesWithRaw.map(
              ({ tableId, startTime, endTime }) => ({
                tableId,
                startTime,
                endTime,
              })
            );

            await UnavailableTablesPopup({
              unavailableTables,
            });

            const updatedBookings = chessBookings.filter(
              (booking) =>
                !(
                  booking.bookingMode === (isMonthly ? "monthly" : "regular") &&
                  unavailableTablesWithRaw.some(
                    (t) =>
                      booking.tableId === t.tableId &&
                      booking.startDate === t.rawStartTime &&
                      booking.endDate === t.rawEndTime
                  )
                )
            );

            setChessBookings(updatedBookings);
            localStorage.setItem(
              "chessBookings",
              JSON.stringify(updatedBookings)
            );
          } catch (parseError) {
            console.error("Error parsing unavailable tables:", parseError);
            toast.error("Có lỗi khi xử lý thông báo bàn không khả dụng.");
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
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      ></circle>
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        className="opacity-75"
      ></path>
    </svg>
  );

  const renderBookingSection = (bookings: ChessBooking[], title: string) => (
    <div className="p-6 rounded-lg">
      <h3 className="text-2xl font-semibold mb-6 text-center">{title}</h3>
      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-600 border rounded-xl bg-white shadow-md">
          <svg
            className="w-20 h-20 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xl font-medium">
            Không có bàn đặt {title.toLowerCase()}
          </p>
          <p className="text-base mt-2">
            Vui lòng chọn bàn để thêm vào {title.toLowerCase()}
          </p>
        </div>
      ) : (
        bookings.map((booking, index) => (
          <div
            key={`${booking.tableId}-${booking.startDate}-${index}`}
            className="border p-5 rounded-xl flex items-center mb-5 relative bg-white shadow-md"
          >
            <div className="flex-1 grid grid-cols-2 gap-4 text-base">
              <div>
                <div className="col-span-full mb-3">
                  <span
                    className={`text-blue-600 text-sm italic cursor-pointer hover:underline ${
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
                    🔍 Xem chi tiết bàn
                  </span>
                </div>
                <p>
                  <span className="font-semibold">Loại Cờ: </span>
                  {GAME_TYPE_TRANSLATIONS[
                    booking.gameType?.typeName?.toLowerCase() || ""
                  ] ||
                    booking.gameType?.typeName ||
                    "Không rõ"}
                </p>
                <p>
                  <span className="font-semibold">Loại Phòng: </span>
                  {translateRoomType(booking.roomType)}
                </p>
                <p>
                  <span className="font-semibold">Mã Bàn: </span>
                  {booking.tableId}
                </p>
                <p>
                  <span className="font-semibold">Tên Phòng: </span>
                  {booking.roomName}
                </p>
                <p>
                  <span className="font-semibold">Thời gian thuê: </span>
                  {formatDuration(booking.durationInHours)}
                </p>
                {booking.hasInvitations && (
                  <div className="mt-4">
                    <Select
                      label="Phương thức thanh toán"
                      value={booking.payFullPrice ? "full" : "half"}
                      onChange={(value) => {
                        const updatedBookings = chessBookings.map((b) => {
                          if (
                            b.tableId === booking.tableId &&
                            b.startDate === booking.startDate &&
                            b.endDate === booking.endDate
                          ) {
                            const payFullPrice = value === "full";
                            let newTotalPrice =
                              (b.roomTypePrice + b.gameTypePrice) *
                              b.durationInHours;
                            if (
                              b.appliedVoucher &&
                              newTotalPrice >=
                                b.appliedVoucher.minPriceCondition
                            ) {
                              newTotalPrice -= b.appliedVoucher.value;
                            }
                            if (b.hasInvitations && !payFullPrice) {
                              newTotalPrice *= 0.5;
                            }
                            return {
                              ...b,
                              payFullPrice,
                              totalPrice: newTotalPrice,
                            };
                          }
                          return b;
                        });
                        setChessBookings(updatedBookings);
                        localStorage.setItem(
                          "chessBookings",
                          JSON.stringify(updatedBookings)
                        );
                      }}
                      className="text-base"
                    >
                      <Option value="half">Chia đôi (50%)</Option>
                      <Option value="full">Toàn bộ (100%)</Option>
                    </Select>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold">Ngày đặt: </span>
                  {formatDate(booking.startDate)}
                </p>
                <p>
                  <span className="font-semibold">Giờ bắt đầu: </span>
                  {formatTime(booking.startDate)}
                </p>
                <p>
                  <span className="font-semibold">Giờ kết thúc: </span>
                  {formatTime(booking.endDate)}
                </p>
                <p>
                  <span className="font-semibold">Giá thuê/giờ: </span>
                  {(
                    booking.roomTypePrice + booking.gameTypePrice
                  ).toLocaleString("vi-VN")}
                  đ
                </p>
                <p className="mt-3">
                  <span className="font-semibold">Tổng: </span>
                  {booking.totalPrice.toLocaleString()}đ
                  {booking.hasInvitations && (
                    <span className="text-green-600 ml-2 text-sm">
                      {booking.payFullPrice
                        ? "(Thanh toán 100%)"
                        : "(Thanh toán 50%)"}
                    </span>
                  )}
                  {booking.appliedVoucher && (
                    <span className="text-blue-600 ml-2 text-sm">
                      (Voucher: -{booking.appliedVoucher.value.toLocaleString()}
                      đ)
                    </span>
                  )}
                  {booking.originalPrice &&
                    booking.originalPrice !== booking.totalPrice && (
                      <span className="text-gray-500 ml-2 text-sm line-through">
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
                    className="text-sm py-2 px-4"
                    disabled={
                      isLoading ||
                      localLoading[
                        `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                      ]
                    }
                  >
                    {booking.appliedVoucher
                      ? `Voucher: ${booking.appliedVoucher.voucherName}`
                      : "Chọn Voucher"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center">
              {booking.invitedUsers && booking.invitedUsers.length > 0 && (
                <div className="flex -space-x-2 mr-3">
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
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-sm font-bold">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center ml-3 space-x-2">
              <button
                onClick={() =>
                  !isLoading &&
                  inviteFriend(
                    booking.tableId,
                    booking.startDate,
                    booking.endDate
                  )
                }
                className={`text-blue-600 p-2 rounded hover:bg-blue-100 ${
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Mời bạn bè"
                disabled={
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                }
              >
                {localLoading[
                  `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                ] ? (
                  <Spinner size={4} />
                ) : (
                  <UserPlus size={20} />
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
                className={`p-2 rounded ${
                  !booking.hasInvitations ||
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-500 hover:bg-red-100"
                }`}
                title={
                  !booking.hasInvitations
                    ? "Chưa mời ai"
                    : isLoading ||
                        localLoading[
                          `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                        ]
                      ? "Đang xử lý..."
                      : "Hủy lời mời"
                }
                disabled={
                  !booking.hasInvitations ||
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                }
              >
                {localLoading[
                  `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                ] ? (
                  <Spinner size={4} />
                ) : (
                  <UserX size={20} />
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
                className={`text-red-600 p-2 rounded hover:bg-red-100 ${
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                    ? "Đang xử lý..."
                    : "Xóa bàn"
                }
                disabled={
                  isLoading ||
                  localLoading[
                    `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                  ]
                }
              >
                {localLoading[
                  `${booking.tableId}-${booking.startDate}-${booking.endDate}`
                ] ? (
                  <Spinner size={4} />
                ) : (
                  <X size={20} />
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="text-base">
      <Navbar />
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-10"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="min-h-[300px] relative z-20 max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-4">
          <h2 className="sm:text-3xl text-xl font-bold mb-4">
            Đặt Bàn - Thi Đấu Cùng Bạn Bè
          </h2>
          <p className="sm:text-lg text-base text-gray-200">
            Kết nối - Cạnh tranh - Tỏa sáng
          </p>
        </div>
      </div>

      <div className="mt-8">
        <OrderAttention />
      </div>

      <div className="min-h-[calc(100vh-200px)] bg-gray-100 p-4 text-gray-900">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Đơn đặt bàn của bạn
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Tabs
              value={activeTab}
              onChange={(value: string) =>
                setActiveTab(value as "regular" | "monthly")
              }
            >
              <TabsHeader className="bg-gray-200 rounded-t-lg">
                <Tab value="regular" className="py-3 text-base">
                  Lịch Thường
                </Tab>
                <Tab value="monthly" className="py-3 text-base">
                  Lịch Tháng
                </Tab>
              </TabsHeader>
              <TabsBody>
                <TabPanel value="regular">
                  {renderBookingSection(regularBookings, "Đặt Lịch Thường")}
                  {regularBookings.length > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                      <p className="font-bold text-xl">
                        Thành tiền: {regularTotalPrice.toLocaleString()} đ
                      </p>
                      <Button
                        onClick={() => handleConfirmBooking(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base"
                        disabled={regularBookings.length === 0 || isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Spinner size={6} />
                            <span className="ml-2">Đang xử lý...</span>
                          </div>
                        ) : (
                          "Xác nhận đặt bàn"
                        )}
                      </Button>
                    </div>
                  )}
                </TabPanel>
                <TabPanel value="monthly">
                  {renderBookingSection(monthlyBookings, "Đặt Lịch Tháng")}
                  {monthlyBookings.length > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                      <p className="font-bold text-xl">
                        Thành tiền: {monthlyTotalPrice.toLocaleString()} đ
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDeselectAllMonthly}
                          variant="gradient"
                          color="red"
                          className="px-5 py-3 text-base"
                          disabled={isLoading}
                        >
                          Bỏ Chọn Tất Cả
                        </Button>
                        <Button
                          onClick={() => handleConfirmBooking(true)}
                          className="bg-green-600 hover:bg-green-400 text-white px-8 py-3 text-base"
                          disabled={monthlyBookings.length === 0 || isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Spinner size={6} />
                              <span className="ml-2">Đang xử lý...</span>
                            </div>
                          ) : (
                            "Xác nhận đặt bàn tháng"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabPanel>
              </TabsBody>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                onClick={() => setOpenTermsDialog(true)}
                variant="outlined"
                className="px-5 py-2 text-base"
                disabled={isLoading}
              >
                Xem Điều Khoản
              </Button>
              <Button
                onClick={() => setOpenRedeemVoucherModal(true)}
                variant="outlined"
                className="px-5 py-2 text-base"
                disabled={isLoading}
              >
                Đổi Voucher
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
