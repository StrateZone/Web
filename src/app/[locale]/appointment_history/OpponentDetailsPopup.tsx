"use client";
import { Badge, Button } from "@material-tailwind/react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import OpponentRecommendationModalWithNewInvite from "../appointment_ongoing/OpponentRecommendationModal";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface User {
  userId: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  skillLevel: string;
  ranking: string;
  userRole?: number | string;
}

interface AppointmentRequest {
  id: number;
  fromUser: number;
  toUser: number | number[];
  status: string;
  tableId: number;
  appointmentId: number;
  startTime: string;
  endTime: string;
  expireAt: string;
  createdAt: string;
  totalPrice: number;
  toUserNavigation: User;
}

interface OpponentDetailsPopupProps {
  show: boolean;
  onClose: () => void;
  requests: AppointmentRequest[];
  tableId: number;
  tableAppointmentStatus?: string;
  appointmentId?: number;
  startTime?: string;
  endTime?: string;
}

function OpponentDetailsPopup({
  show,
  onClose,
  requests,
  tableId,
  tableAppointmentStatus,
  appointmentId,
  startTime,
  endTime,
}: OpponentDetailsPopupProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newlyInvitedUsers, setNewlyInvitedUsers] = useState<number[]>([]);
  const [localRequests, setLocalRequests] =
    useState<AppointmentRequest[]>(requests);

  useEffect(() => {
    setLocalRequests((prev) => {
      const localOnlyRequests = prev.filter(
        (req) => !requests.some((r) => r.id === req.id),
      );
      return [...requests, ...localOnlyRequests];
    });
  }, [requests]);

  useEffect(() => {
    if (!show) {
      setNewlyInvitedUsers([]);
    }
  }, [show]);

  if (!show) return null;

  const filteredRequests = localRequests.filter(
    (request) => request.tableId === tableId,
  );

  const allRequestsInvalid = filteredRequests.every(
    (request) =>
      request.status.toLowerCase() === "rejected" ||
      request.status.toLowerCase() === "expired" ||
      request.status.toLowerCase() === "accepted_by_others",
  );

  const showInviteButton =
    tableAppointmentStatus?.toLowerCase() === "confirmed" &&
    allRequestsInvalid &&
    newlyInvitedUsers.length === 0;

  const isMember = (userRole: number | string | undefined) =>
    userRole === 1 || userRole === "Member";

  interface Opponent {
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  }

  const handleInviteSuccess = async (opponents: Opponent[]) => {
    try {
      const authDataString = localStorage.getItem("authData");
      const authData = authDataString ? JSON.parse(authDataString) : {};
      const fromUserId = authData.userId;

      if (!fromUserId || !appointmentId || !startTime || !endTime) {
        throw new Error("Missing required data for invitation");
      }

      const savedBookings = localStorage.getItem("chessBookingsInvite");
      interface ChessBooking {
        tableId: number;
        startDate: string;
        endDate: string;
        invitedUsers: { userId: number }[];
      }
      const bookings: ChessBooking[] = savedBookings
        ? JSON.parse(savedBookings)
        : [];

      const requestBody = {
        fromUser: fromUserId,
        toUser: opponents.map((o) => o.userId),
        tableId,
        appointmentId,
        startTime,
        endTime,
        totalPrice: 0,
      };

      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/appointmentrequests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send invitations");
      }

      const bookingIndex = bookings.findIndex(
        (b) => b.tableId === tableId && b.startDate === startTime,
      );

      const newInvitedUsers = opponents.map((o) => ({ userId: o.userId }));

      if (bookingIndex !== -1) {
        bookings[bookingIndex].invitedUsers = [
          ...(bookings[bookingIndex].invitedUsers || []),
          ...newInvitedUsers,
        ];
      } else {
        bookings.push({
          tableId,
          startDate: startTime,
          endDate: endTime,
          invitedUsers: newInvitedUsers,
        });
      }

      localStorage.setItem("chessBookingsInvite", JSON.stringify(bookings));

      setNewlyInvitedUsers((prev) => [
        ...prev,
        ...opponents.map((o) => o.userId),
      ]);

      const newRequests: AppointmentRequest[] = opponents.map((opponent) => ({
        id: Date.now() + opponent.userId,
        fromUser: fromUserId,
        toUser: [opponent.userId],
        status: "pending",
        tableId,
        appointmentId,
        startTime,
        endTime,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        totalPrice: 0,
        toUserNavigation: {
          userId: opponent.userId,
          username: opponent.username,
          fullName: opponent.fullName,
          avatarUrl: opponent.avatarUrl,
          email: "",
          phone: "",
          skillLevel: "",
          ranking: "",
          userRole: undefined,
        },
      }));

      setLocalRequests((prev) => [...prev, ...newRequests]);

      toast.success(`Đã gửi lời mời đến ${opponents.length} người thành công!`);

      const updatedBookings = bookings.filter(
        (b) => !(b.tableId === tableId && b.startDate === startTime),
      );
      localStorage.setItem(
        "chessBookingsInvite",
        JSON.stringify(updatedBookings),
      );

      return true;
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Có lỗi khi gửi lời mời");
      return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">
              Danh sách người chơi (Bàn {tableId})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <p className="text-gray-500 py-4 text-lg">
              Chưa có lời mời nào cho bàn này
            </p>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Badge
                      overlap="circular"
                      placement="bottom-end"
                      className={`border-2 border-white ${
                        isMember(request.toUserNavigation.userRole)
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse !h-5 !w-5"
                          : "bg-blue-gray-100"
                      }`}
                      content={
                        isMember(request.toUserNavigation.userRole) ? (
                          <div className="relative group">
                            <CheckBadgeIcon className="h-4 w-4 text-white" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-black text-sm p-2 rounded shadow-lg">
                              Thành viên câu lạc bộ
                            </span>
                          </div>
                        ) : null
                      }
                    >
                      <img
                        src={
                          request.toUserNavigation.avatarUrl ||
                          "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                        }
                        alt={request.toUserNavigation.fullName}
                        className={`w-12 h-12 rounded-full object-cover ${
                          isMember(request.toUserNavigation.userRole)
                            ? "border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                            : ""
                        }`}
                      />
                    </Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium text-lg ${
                            isMember(request.toUserNavigation.userRole)
                              ? "text-purple-600"
                              : ""
                          }`}
                        >
                          {request.toUserNavigation.fullName}
                        </p>
                        {isMember(request.toUserNavigation.userRole) && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            MEMBER
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {request.toUserNavigation.username}
                      </p>
                      {isMember(request.toUserNavigation.userRole) && (
                        <p className="text-purple-500 text-sm mt-1">
                          Thành viên câu lạc bộ
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : request.status === "accepted_by_others"
                              ? "bg-pink-100 text-pink-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status === "pending"
                        ? "Đang chờ"
                        : request.status === "accepted"
                          ? "Đã chấp nhận Lời Mời"
                          : request.status === "accepted_by_others"
                            ? "Lời mời đã có người chấp nhận"
                            : "Lời mời đã hết hạn"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Thời gian chơi:{" "}
                      {new Date(request.startTime).toLocaleTimeString("vi-VN")}{" "}
                      - {new Date(request.endTime).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showInviteButton && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
              >
                Mời thêm đối thủ
              </Button>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-lg"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <OpponentRecommendationModalWithNewInvite
          startDate={startTime!}
          endDate={endTime!}
          tableId={tableId}
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
}

export default OpponentDetailsPopup;
