"use client";
import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { User, X } from "lucide-react";
import Image from "next/image";

interface Opponent {
  userId: number;
  username: string;
  avatarUrl: string | null;
  ranking: string;
  points: number;
}

interface OpponentRecommendationModalProps {
  startDate: string;
  endDate: string;
  tableId: number;
  open: boolean;
  onClose: () => void;
}

const OpponentRecommendationModal = ({
  startDate,
  endDate,
  tableId,
  open,
  onClose,
}: OpponentRecommendationModalProps) => {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    totalPages: 1,
  });
  const [invitedOpponents, setInvitedOpponents] = useState<number[]>([]);

  const fetchOpponents = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/users/by-ranking?page-number=${pageNumber}&page-size=${pagination.pageSize}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch opponents");
      }

      const data = await response.json();
      setOpponents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchOpponents(pagination.pageNumber);
    }
  }, [open, pagination.pageNumber]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, pageNumber: newPage }));
      fetchOpponents(newPage);
    }
  };

  const handleInvite = async (opponentId: number) => {
    try {
      setLoading(true);

      const authDataString = localStorage.getItem("authData");
      if (!authDataString) throw new Error("User not authenticated");

      const authData = JSON.parse(authDataString);
      const fromUserId = authData.userId;

      const opponent = opponents.find((o) => o.userId === opponentId);
      if (!opponent) throw new Error("Opponent not found");

      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/appointmentrequests",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json-patch+json",
          },
          body: JSON.stringify({
            fromUser: fromUserId,
            toUser: opponentId,
            tableId: tableId,
            startTime: startDate,
            endTime: endDate,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invitation");
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      setInvitedOpponents((prev) => [...prev, opponentId]);
      alert(`Đã gửi lời mời đến ${opponent.username} thành công!`);
    } catch (err) {
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi gửi lời mời");
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
      default:
        return ranking;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold">Gợi ý đối thủ</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Mời đối thủ phù hợp vào bàn {tableId} từ {formatTime(startDate)} đến{" "}
            {formatTime(endDate)}
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : opponents.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              Không tìm thấy đối thủ phù hợp
            </div>
          ) : (
            <div className="space-y-3">
              {opponents.map((opponent) => (
                <div
                  key={opponent.userId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {opponent.avatarUrl ? (
                      <Image
                        src={opponent.avatarUrl}
                        alt={opponent.username}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="text-gray-500" size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{opponent.username}</h3>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>Hạng: {translateRanking(opponent.ranking)}</span>
                        <span>Điểm: {opponent.points.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color={
                      invitedOpponents.includes(opponent.userId)
                        ? "gray"
                        : "green"
                    }
                    onClick={() => handleInvite(opponent.userId)}
                    className="px-3 py-1.5"
                    disabled={
                      loading || invitedOpponents.includes(opponent.userId)
                    }
                  >
                    {invitedOpponents.includes(opponent.userId)
                      ? "Đã mời"
                      : "Mời"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outlined"
              size="sm"
              disabled={pagination.pageNumber === 1 || loading}
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {pagination.pageNumber} / {pagination.totalPages}
            </span>
            <Button
              variant="outlined"
              size="sm"
              disabled={
                pagination.pageNumber === pagination.totalPages || loading
              }
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpponentRecommendationModal;
