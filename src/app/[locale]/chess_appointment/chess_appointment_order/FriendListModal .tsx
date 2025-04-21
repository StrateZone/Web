"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@material-tailwind/react";
import { User, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

interface Opponent {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  status: string;
  avatarUrl: string | null;
  bio: string | null;
  points: number;
  gender: string;
  isInvited?: boolean;
  ranking?: string;
  userRole?: string; // Added to check for "Member" role
}

interface ChessBooking {
  tableId: number;
  startDate: string;
  endDate: string;
  invitedUsers: { userId: number }[];
}

interface OpponentRecommendationModalProps {
  startDate: string;
  endDate: string;
  tableId: number;
  open: boolean;
  onClose: () => void;
  onInviteSuccess: (opponent: Opponent) => void;
}

interface ApiResponse {
  matchingOpponents: Opponent[];
  friends: Opponent[];
}

const OpponentRecommendationModal = ({
  startDate,
  endDate,
  tableId,
  open,
  onClose,
  onInviteSuccess,
}: OpponentRecommendationModalProps) => {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [friends, setFriends] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedOpponents, setInvitedOpponents] = useState<number[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasFetchedInitialData = useRef(false);

  const fetchOpponents = async () => {
    try {
      setLoading(true);
      setError(null);

      const authDataString = localStorage.getItem("authData");
      const authData = JSON.parse(authDataString || "{}");
      const userId = authData.userId;

      // Get already invited opponents from localStorage for this specific table
      const savedBookings = localStorage.getItem("chessBookings");
      let alreadyInvitedIds: number[] = [];

      if (savedBookings) {
        const bookings: ChessBooking[] = JSON.parse(savedBookings);
        const currentBooking = bookings.find(
          (b) =>
            b.tableId === tableId &&
            b.startDate === startDate &&
            b.endDate === endDate
        );

        if (currentBooking?.invitedUsers) {
          alreadyInvitedIds = currentBooking.invitedUsers.map(
            (user) => user.userId
          );
        }
      }

      // Build the URL with query parameters
      const url = new URL(
        `https://backend-production-ac5e.up.railway.app/api/users/opponents/${userId}`
      );

      if (searchTerm) {
        url.searchParams.append("SearchTerm", searchTerm);
      }

      const response = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error("Không tìm thấy đối thủ phù hợp");
      }

      const data: ApiResponse = await response.json();

      // Mark already invited opponents
      const markedOpponents = data.matchingOpponents.map((opponent) => ({
        ...opponent,
        isInvited: alreadyInvitedIds.includes(opponent.userId),
      }));

      const markedFriends = data.friends.map((friend) => ({
        ...friend,
        isInvited: alreadyInvitedIds.includes(friend.userId),
      }));

      setOpponents(markedOpponents || []);
      setFriends(markedFriends || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      fetchOpponents();
    }
  }, [open]);

  useEffect(() => {
    if (refreshTrigger && open) {
      fetchOpponents();
    }
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  const handleInvite = (opponent: Opponent) => {
    try {
      setLoading(true);

      // 1. Get data from localStorage
      const savedBookings = localStorage.getItem("chessBookings");
      if (!savedBookings) {
        toast.error("Không tìm thấy thông tin đặt bàn");
        return;
      }

      const bookings: ChessBooking[] = JSON.parse(savedBookings);

      // 2. Find booking for current table
      const currentBooking = bookings.find(
        (b) =>
          b.tableId === tableId &&
          b.startDate === startDate &&
          b.endDate === endDate
      );

      if (!currentBooking) {
        toast.error("Không tìm thấy thông tin bàn");
        return;
      }

      // 3. Check number of invited users (max 6)
      const currentInvitedCount = currentBooking.invitedUsers?.length || 0;
      if (currentInvitedCount >= 6) {
        toast.error("Mỗi bàn chỉ có thể mời tối đa 6 người");
        return;
      }

      // 4. Check if already invited this user
      const isAlreadyInvited = currentBooking.invitedUsers?.some(
        (u) => u.userId === opponent.userId
      );

      if (isAlreadyInvited) {
        toast.warning(`Bạn đã mời ${opponent.username} rồi`);
        return;
      }

      // 5. Update UI state
      const updatedOpponents = opponents.map((o) =>
        o.userId === opponent.userId ? { ...o, isInvited: true } : o
      );
      setOpponents(updatedOpponents);

      const updatedFriends = friends.map((f) =>
        f.userId === opponent.userId ? { ...f, isInvited: true } : f
      );
      setFriends(updatedFriends);

      // 6. Call callback to update localStorage
      onInviteSuccess(opponent);

      toast.success(`Đã gửi lời mời đến ${opponent.username} thành công!`);
    } catch (err) {
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi gửi lời mời");
      toast.error("Có lỗi xảy ra khi gửi lời mời");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const renderOpponentList = (opponents: Opponent[], title?: string) => {
    if (opponents.length === 0) return null;

    return (
      <>
        {title && (
          <div className="text-sm font-semibold text-gray-500 mt-4 mb-2">
            {title}
          </div>
        )}
        <div className="space-y-3">
          {opponents.map((opponent) => {
            const isMember = opponent.userRole === "Member"; // Check if this opponent is a member
            return (
              <div
                key={opponent.userId}
                className={`border rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  isMember
                    ? "border-purple-200 hover:bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                {opponent.avatarUrl ? (
                  <Image
                    src={opponent.avatarUrl}
                    alt={opponent.fullName}
                    width={40}
                    height={40}
                    className={`rounded-full object-cover w-10 h-10 flex-shrink-0 ${
                      isMember
                        ? "border-2 border-purple-500 shadow-lg shadow-purple-500/30"
                        : ""
                    }`}
                  />
                ) : (
                  <div
                    className={`bg-gray-200 text-gray-500 w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                      isMember
                        ? "border-2 border-purple-500 shadow-lg shadow-purple-500/30"
                        : ""
                    }`}
                  >
                    <User size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-sm truncate ${
                      isMember ? "text-purple-700" : "text-gray-800"
                    }`}
                  >
                    {opponent.username || opponent.username}
                    {isMember && (
                      <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-bounce">
                        VIP
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs ${isMember ? "text-purple-600" : "text-gray-500"}`}
                    >
                      {opponent.gender === "male" ? "Nam" : "Nữ"}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => handleInvite(opponent)}
                    disabled={opponent.isInvited || loading}
                    size="sm"
                    className={`text-white text-xs px-2.5 py-1 ${
                      opponent.isInvited
                        ? "bg-gray-400"
                        : isMember
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 animate-pulse"
                          : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {opponent.isInvited ? "Đã mời" : "Mời"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Gợi ý đối thủ</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
              disabled={loading}
              title="Làm mới danh sách"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm đối thủ..."
              className="flex-1 p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fetchOpponents();
                }
              }}
            />
            <Button
              onClick={fetchOpponents}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
              disabled={loading}
            >
              Tìm kiếm
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-4">Đang tải...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : opponents.length === 0 && friends.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Không tìm thấy đối thủ phù hợp.
            </div>
          ) : (
            <>
              {renderOpponentList(friends, "Bạn bè")}
              {renderOpponentList(opponents, "Đối thủ khác")}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpponentRecommendationModal;
