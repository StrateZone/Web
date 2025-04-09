"use client";
import { useState, useEffect } from "react";
import { Button, Input } from "@material-tailwind/react";
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
import Image from "next/image";
import { ConfirmCancelPopup } from "./ConfirmCancelPopup";
import { CloseTimeWarningPopup } from "./CloseTimeWarningPopup";

interface InvitedUser {
  userId: number;
  username: string;
  avatarUrl: string | null;
}

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
  const [showOpponentModal, setShowOpponentModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [selectedTotalPrice, setselectedTotalPrice] = useState<number | null>(
    null
  );

  const handleCancelInvitation = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    try {
      setIsLoading(true);

      // Gọi API hủy tất cả lời mời
      const success = await cancelTableInvitations(tableId, startDate, endDate);

      if (success) {
        // Cập nhật lại danh sách booking với giá mới
        const updatedBookings = await Promise.all(
          chessBookings.map(async (booking) => {
            if (
              booking.tableId === tableId &&
              booking.startDate === startDate &&
              booking.endDate === endDate
            ) {
              return await updateBookingPrice(booking);
            }
            return booking;
          })
        );

        setChessBookings(updatedBookings);
        localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));

        toast.info(
          `Đã hủy tất cả lời mời cho bàn số ${tableId} (${formatTime(startDate)} - ${formatTime(endDate)})`
        );
      } else {
        alert("Có lỗi xảy ra khi hủy lời mời");
      }
    } catch (error) {
      console.error("Error canceling invitations:", error);
      alert("Có lỗi xảy ra khi hủy lời mời");
    } finally {
      setIsLoading(false);
    }
  };

  const checkTableInvitations = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    try {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) return { hasInvitations: false, invitedUsers: [] };

      const authData = JSON.parse(authDataString);
      const userId = authData.userId;

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/users/${userId}/tables/${tableId}?startTime=${encodeURIComponent(startDate)}&endTime=${encodeURIComponent(endDate)}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "API Response not OK:",
          response.status,
          response.statusText
        );
        return { hasInvitations: false, invitedUsers: [] };
      }

      const data = await response.json();
      // console.log("[DEBUG] Full API Response:", JSON.stringify(data, null, 2));

      const invitedUsers = data.map((invite: any) => {
        // Lấy thông tin từ toUserNavigation thay vì toUser
        const userInfo = invite.toUserNavigation || {};
        // console.log("User info from toUserNavigation:", userInfo);

        return {
          userId: userInfo.userId || 0,
          username: userInfo.username || "Người chơi",
          avatarUrl: userInfo.avatarUrl || null,
        };
      });

      return {
        hasInvitations: data.length > 0,
        invitedUsers,
      };
    } catch (error) {
      console.error("Error in checkTableInvitations:", error);
      return { hasInvitations: false, invitedUsers: [] };
    }
  };

  const cancelTableInvitations = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    try {
      const authDataString = localStorage.getItem("authData");
      if (!authDataString) return false;

      const authData = JSON.parse(authDataString);
      const userId = authData.userId;

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/appointmentrequests/cancel-all/users/${userId}/tables/${tableId}?startTime=${encodeURIComponent(startDate)}&endTime=${encodeURIComponent(endDate)}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error canceling invitations:", error);
      return false;
    }
  };

  const updateBookingPrice = async (booking: ChessBooking) => {
    const { hasInvitations, invitedUsers } = await checkTableInvitations(
      booking.tableId,
      booking.startDate,
      booking.endDate
    );

    if (hasInvitations && !booking.hasInvitations) {
      return {
        ...booking,
        originalPrice: booking.totalPrice,
        totalPrice: booking.totalPrice * 0.5,
        hasInvitations: true,
        invitedUsers,
      };
    } else if (!hasInvitations && booking.hasInvitations) {
      return {
        ...booking,
        totalPrice: booking.originalPrice || booking.totalPrice * 2,
        hasInvitations: false,
        originalPrice: undefined,
        invitedUsers: [],
      };
    }
    return {
      ...booking,
      invitedUsers: invitedUsers || booking.invitedUsers || [],
    };
  };

  const handleInviteSuccess = async (tableId: number) => {
    const updatedBookings = await Promise.all(
      chessBookings.map(async (booking) => {
        if (booking.tableId === tableId) {
          return await updateBookingPrice(booking);
        }
        return booking;
      })
    );

    setChessBookings(updatedBookings);
    localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));
  };

  const removeTable = async (
    tableId: number,
    startDate: string,
    endDate: string
  ) => {
    try {
      // Kiểm tra xem có lời mời nào không
      const { hasInvitations, invitedUsers } = await checkTableInvitations(
        tableId,
        startDate,
        endDate
      );

      // Nếu có lời mời, hiển thị popup cảnh báo
      if (hasInvitations && invitedUsers && invitedUsers.length > 0) {
        const isConfirmed = await ConfirmCancelPopup();
        if (!isConfirmed) {
          return; // Không tiếp tục nếu người dùng không xác nhận
        }
      } else {
        // Hiển thị popup xác nhận thông thường nếu không có lời mời
      }
      // Hủy tất cả lời mời nếu có
      await cancelTableInvitations(tableId, startDate, endDate);

      // Xóa bàn khỏi danh sách
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
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      const savedBookings = localStorage.getItem("chessBookings");
      if (savedBookings) {
        try {
          const parsedBookings: ChessBooking[] = JSON.parse(savedBookings);

          const updatedBookings = await Promise.all(
            parsedBookings.map(async (booking) => {
              return await updateBookingPrice(booking);
            })
          );

          setChessBookings(updatedBookings);
        } catch (error) {
          console.error("Error parsing data from localStorage:", error);
        }
      }
    };

    loadBookings();
  }, []);

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

  const translateRoomType = (roomType: string): string => {
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
  const finalPrice = totalPrice - discount;

  const applyCoupon = () => {
    // Coupon logic here
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

  const inviteFriend = (
    tableId: number,
    startDate: string,
    endDate: string,
    totalPrice: number
  ) => {
    setSelectedTableId(tableId);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setselectedTotalPrice(totalPrice);
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
          gameType: b.gameType.typeName, // Extract typeName as a string
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
          },
          body: JSON.stringify(requestData),
        }
      );

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
        router.push(`/${localActive}/appointment_history`);
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
        } else if (error.message.includes("TABLE_NOT_AVAILABLE")) {
          try {
            const errorData = JSON.parse(error.message);
            const unavailableTables = errorData.error.unavailable_tables.map(
              (t: UnavailableTable) => ({
                tableId: t.table_id,
                startTime: formatTime(t.start_time),
                endTime: formatTime(t.end_time),
              })
            );

            await UnavailableTablesPopup({ unavailableTables });

            const updatedBookings = chessBookings.filter((booking) => {
              return !errorData.error.unavailable_tables.some(
                (unavailable: UnavailableTable) =>
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
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="min-h-[400px] relative z-30 h-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-5xl text-3xl font-bold mb-6">
            Đặt Bàn - Thi Đấu Cùng Bạn Bè
          </h2>
          <p className="sm:text-xl text-lg text-center text-gray-200">
            Kết nối - Cạnh tranh - Tỏa sáng
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
                    <div className="flex-1 grid grid-cols-2 gap-4 text-base">
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
                      <div className="text-right">
                        <p>
                          <span className="font-bold text-lg ">Ngày Đặt: </span>
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
                          {booking.hasInvitations ? (
                            <span className="text-green-600 ml-2">
                              (Thanh Toán Trước 50%)
                            </span>
                          ) : (
                            booking.originalPrice && (
                              <span className="text-gray-500 ml-2 line-through">
                                {booking.originalPrice.toLocaleString()}đ
                              </span>
                            )
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Phần hiển thị avatar người được mời */}
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
                                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                                    {user.username.charAt(0).toUpperCase()}
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
                          inviteFriend(
                            booking.tableId,
                            booking.startDate,
                            booking.endDate,
                            booking.totalPrice
                          )
                        }
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Mời bạn vào bàn này"
                      >
                        <UserPlus size={24} />
                      </button>

                      <button
                        onClick={() =>
                          handleCancelInvitation(
                            booking.tableId,
                            booking.startDate,
                            booking.endDate
                          )
                        }
                        className={`p-2 ${
                          !booking.hasInvitations
                            ? "text-gray-400 hover:text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:text-red-700"
                        }`}
                        title={
                          !booking.hasInvitations
                            ? "Chưa mời ai"
                            : "Hủy Mời Bạn"
                        }
                        disabled={!booking.hasInvitations || isLoading}
                      >
                        {isLoading ? (
                          <svg
                            className="animate-spin h-5 w-5"
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
                        ) : (
                          <UserX size={24} />
                        )}
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
              {/* <p className="font-bold text-xl">Nhập Mã Giảm Giá</p> */}
              <p className="font-bold text-xl">
                Thành tiền: {finalPrice.toLocaleString()}đ
              </p>
            </div>

            {/* <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                className="py-2 px-8 text-small"
              >
                Áp dụng
              </Button>
              <Button
                onClick={() => setShowCouponModal(true)}
                className="py-0 px-10 text-small bg-green-600"
              >
                Mã giảm giá
              </Button>
            </div> */}

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
          totalPrice={selectedTotalPrice ?? 0}
          open={showOpponentModal}
          onClose={() => setShowOpponentModal(false)}
          onInviteSuccess={() => handleInviteSuccess(selectedTableId)}
        />
      )}
      <Footer />
    </div>
  );
};

export default TableBookingPage;
