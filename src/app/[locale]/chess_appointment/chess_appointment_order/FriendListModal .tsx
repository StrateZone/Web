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
  ranking: string;
  isInvited?: boolean;
}

interface OpponentRecommendationModalProps {
  startDate: string;
  endDate: string;
  tableId: number;
  open: boolean;
  onClose: () => void;
  onInviteSuccess: (opponent: Opponent) => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedOpponents, setInvitedOpponents] = useState<number[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const hasFetchedInitialData = useRef(false);

  const fetchOpponents = async () => {
    try {
      setLoading(true);
      setError(null);

      const authDataString = localStorage.getItem("authData");
      const authData = JSON.parse(authDataString || "{}");
      const userId = authData.userId;
      const userRanking = authData.ranking || "basic";

      const formattedStartTime = new Date(startDate).toISOString();
      const formattedEndTime = new Date(endDate).toISOString();

      const url = new URL(
        `https://backend-production-ac5e.up.railway.app/api/users/by-ranking/random/${userId}/tables/${tableId}`
      );

      url.searchParams.append("StartTime", formattedStartTime);
      url.searchParams.append("EndTime", formattedEndTime);
      url.searchParams.append("ranking", userRanking);
      url.searchParams.append("up", "1");
      url.searchParams.append("down", "1");

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

      // Combine with manually invited opponents from state
      const allExcludedIds = [
        ...new Set([...invitedOpponents, ...alreadyInvitedIds]),
      ];

      if (allExcludedIds.length > 0) {
        allExcludedIds.forEach((id) => {
          url.searchParams.append("excludedIds", id.toString());
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch opponents");
      }

      const data = await response.json();

      const allOpponents = [
        ...(data.matchingOpponents?.basic || []),
        ...(data.matchingOpponents?.silver || []),
        ...(data.matchingOpponents?.gold || []),
        ...(data.matchingOpponents?.platinum || []),
        ...(data.matchingOpponents?.intermediate || []),
        ...(data.matchingOpponents?.advanced || []),
        ...(data.matchingOpponents?.expert || []),
      ];

      setOpponents(allOpponents);
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

  // const handleInvite = (opponent: Opponent) => {
  //   try {
  //     setLoading(true);

  //     const updatedOpponents = opponents.map((o) =>
  //       o.userId === opponent.userId ? { ...o, isInvited: true } : o
  //     );

  //     setOpponents(updatedOpponents);

  //     setInvitedOpponents((prev) => [...prev, opponent.userId]);

  //     onInviteSuccess(opponent);

  //     toast.success(`Đã gửi lời mời đến ${opponent.username} thành công!`);
  //   } catch (err) {
  //     console.error("Error details:", err);
  //     setError(err instanceof Error ? err.message : "Lỗi khi gửi lời mời");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleInvite = (opponent: Opponent) => {
    try {
      setLoading(true);

      // 1. Lấy dữ liệu từ localStorage
      const savedBookings = localStorage.getItem("chessBookings");
      if (!savedBookings) {
        toast.error("Không tìm thấy thông tin đặt bàn");
        return;
      }

      const bookings: ChessBooking[] = JSON.parse(savedBookings);

      // 2. Tìm booking cho bàn hiện tại
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

      // 3. Kiểm tra số lượng người đã mời (tối đa 6)
      const currentInvitedCount = currentBooking.invitedUsers?.length || 0;
      if (currentInvitedCount >= 6) {
        toast.error("Mỗi bàn chỉ có thể mời tối đa 6 người");
        return;
      }

      // 4. Kiểm tra nếu đã mời người này rồi
      const isAlreadyInvited = currentBooking.invitedUsers?.some(
        (u) => u.userId === opponent.userId
      );

      if (isAlreadyInvited) {
        toast.warning(`Bạn đã mời ${opponent.username} rồi`);
        return;
      }

      // 5. Cập nhật trạng thái UI
      const updatedOpponents = opponents.map((o) =>
        o.userId === opponent.userId ? { ...o, isInvited: true } : o
      );
      setOpponents(updatedOpponents);

      // 6. Gọi callback để cập nhật localStorage
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
  const translateRanking = (ranking: string) => {
    switch (ranking.toLowerCase()) {
      case "basic":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      case "expert":
        return "Chuyên gia";
      case "silver":
        return "Bạc";
      case "gold":
        return "Vàng";
      case "platinum ":
        return "Bạch kim";
      default:
        return ranking;
    }
  };

  const getRankingColor = (ranking: string) => {
    switch (ranking.toLowerCase()) {
      case "basic":
        return "bg-gray-200 text-gray-800";
      case "silver":
        return "bg-gray-300 text-gray-800";
      case "gold":
        return "bg-yellow-200 text-yellow-800";
      case "platinum":
        return "bg-blue-200 text-blue-800";
      case "intermediate":
        return "bg-green-200 text-green-800";
      case "advanced":
        return "bg-purple-200 text-purple-800";
      case "expert":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRankingHeaderColor = (ranking: string) => {
    switch (ranking.toLowerCase()) {
      case "basic":
        return "bg-gray-300 text-gray-800";
      case "silver":
        return "bg-gray-400 text-gray-800";
      case "gold":
        return "bg-yellow-300 text-yellow-900";
      case "platinum":
        return "bg-blue-300 text-blue-900";
      case "intermediate":
        return "bg-green-300 text-green-900";
      case "advanced":
        return "bg-purple-300 text-purple-900";
      case "expert":
        return "bg-red-300 text-red-900";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const groupOpponentsByRanking = () => {
    const grouped: Record<string, Opponent[]> = {};

    opponents.forEach((opponent) => {
      if (!grouped[opponent.ranking]) {
        grouped[opponent.ranking] = [];
      }
      grouped[opponent.ranking].push(opponent);
    });

    // Sort rankings in a specific order
    const rankingOrder = [
      "platinum",
      "gold",
      "silver",
      "basic",
      "expert",
      "advanced",
      "intermediate",
    ];

    return Object.entries(grouped).sort(
      ([a], [b]) => rankingOrder.indexOf(a) - rankingOrder.indexOf(b)
    );
  };

  if (!open) return null;

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
          {loading ? (
            <div className="text-center text-gray-500 py-4">Đang tải...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : opponents.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Không tìm thấy đối thủ phù hợp.
            </div>
          ) : (
            <>
              <div className="mb-3 text-sm text-gray-600">
                <p>
                  Hạng hiện tại của bạn là :{" "}
                  <span className="font-bold">
                    {translateRanking(
                      JSON.parse(localStorage.getItem("authData") || "{}")
                        .ranking || "basic"
                    )}
                  </span>{" "}
                </p>
              </div>

              <div className="space-y-4">
                {groupOpponentsByRanking().map(([ranking, opponents]) => (
                  <div key={ranking} className="space-y-2">
                    <div
                      className={`px-3 py-2 rounded-md font-bold ${getRankingHeaderColor(ranking)}`}
                    >
                      {translateRanking(ranking)}
                    </div>
                    <div className="space-y-3">
                      {opponents.map((opponent) => (
                        <div
                          key={opponent.userId}
                          className="border rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          {opponent.avatarUrl ? (
                            <Image
                              src={opponent.avatarUrl}
                              alt={opponent.fullName}
                              width={40}
                              height={40}
                              className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                            />
                          ) : (
                            <div className="bg-gray-200 text-gray-500 w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0">
                              <User size={18} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {opponent.fullName || opponent.username}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <div
                                className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${getRankingColor(
                                  opponent.ranking
                                )}`}
                              >
                                {translateRanking(opponent.ranking)}
                              </div>
                              <span className="text-xs text-gray-500">
                                {opponent.gender === "male" ? "Nam" : "Nữ"}
                              </span>
                              {opponent.points > 0 && (
                                <span className="text-xs text-gray-500">
                                  {opponent.points} điểm
                                </span>
                              )}
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
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            >
                              {opponent.isInvited ? "Đã mời" : "Mời"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpponentRecommendationModal;
