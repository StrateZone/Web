// "use client";
// import { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { User, X, RefreshCw } from "lucide-react";
// import Image from "next/image";

// interface Opponent {
//   userId: number;
//   username: string;
//   avatarUrl: string | null;
//   ranking: string;
//   points: number;
//   isInvited?: boolean;
// }

// interface OpponentRecommendationModalProps {
//   startDate: string;
//   endDate: string;
//   tableId: number;
//   open: boolean;
//   onClose: () => void;
// }

// const OpponentRecommendationModal = ({
//   startDate,
//   endDate,
//   tableId,
//   open,
//   onClose,
// }: OpponentRecommendationModalProps) => {
//   const [opponents, setOpponents] = useState<Opponent[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [invitedOpponents, setInvitedOpponents] = useState<number[]>([]);
//   const [refreshTrigger, setRefreshTrigger] = useState(false);

//   const fetchOpponents = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const authDataString = localStorage.getItem("authData");
//       const authData = JSON.parse(authDataString || "{}");
//       const userId = authData.userId;

//       const formattedStartTime = new Date(startDate).toISOString();
//       const formattedEndTime = new Date(endDate).toISOString();

//       const url = new URL(
//         `https://backend-production-ac5e.up.railway.app/api/users/by-ranking/random/${userId}/table/${tableId}`
//       );

//       url.searchParams.append("StartTime", formattedStartTime);
//       url.searchParams.append("EndTime", formattedEndTime);

//       const response = await fetch(url.toString(), {
//         headers: {
//           accept: "*/*",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch opponents");
//       }

//       const data = await response.json();
//       setOpponents(data.matchingOpponents || []);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "An unknown error occurred"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (open) {
//       fetchOpponents();
//     }
//   }, [open, refreshTrigger]);

//   const handleRefresh = () => {
//     setRefreshTrigger((prev) => !prev);
//   };

//   const handleInvite = async (opponentId: number) => {
//     try {
//       setLoading(true);

//       const authDataString = localStorage.getItem("authData");
//       if (!authDataString) throw new Error("User not authenticated");

//       const authData = JSON.parse(authDataString);
//       const fromUserId = authData.userId;

//       const opponent = opponents.find((o) => o.userId === opponentId);
//       if (!opponent) throw new Error("Opponent not found");

//       const response = await fetch(
//         "https://backend-production-ac5e.up.railway.app/api/appointmentrequests",
//         {
//           method: "POST",
//           headers: {
//             accept: "*/*",
//             "Content-Type": "application/json-patch+json",
//           },
//           body: JSON.stringify({
//             fromUser: fromUserId,
//             toUser: opponentId,
//             tableId: tableId,
//             startTime: startDate,
//             endTime: endDate,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to send invitation");
//       }

//       const responseData = await response.json();
//       console.log("API Response:", responseData);

//       setInvitedOpponents((prev) => [...prev, opponentId]);
//       alert(`Đã gửi lời mời đến ${opponent.username} thành công!`);

//       // Cập nhật trạng thái isInvited
//       setOpponents((prev) =>
//         prev.map((o) =>
//           o.userId === opponentId ? { ...o, isInvited: true } : o
//         )
//       );
//     } catch (err) {
//       console.error("Error details:", err);
//       setError(err instanceof Error ? err.message : "Lỗi khi gửi lời mời");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const translateRanking = (ranking: string) => {
//     switch (ranking.toLowerCase()) {
//       case "basic":
//         return "Cơ bản";
//       case "intermediate":
//         return "Trung cấp";
//       case "advanced":
//         return "Nâng cao";
//       case "expert":
//         return "Chuyên gia";
//       default:
//         return ranking;
//     }
//   };

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-black">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center border-b p-4">
//           <h2 className="text-xl font-bold">Gợi ý đối thủ</h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleRefresh}
//               className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
//               disabled={loading}
//               title="Làm mới danh sách"
//             >
//               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
//             </button>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         <div className="p-4">
//           <p className="text-sm text-gray-600 mb-4">
//             Mời đối thủ phù hợp vào bàn {tableId} từ {formatTime(startDate)} đến{" "}
//             {formatTime(endDate)}
//           </p>

//           {loading && opponents.length === 0 ? (
//             <div className="flex justify-center items-center h-40">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : error ? (
//             <div className="text-red-500 text-center p-4">{error}</div>
//           ) : opponents.length === 0 ? (
//             <div className="text-center p-4 text-gray-500">
//               Không tìm thấy đối thủ phù hợp
//               <Button
//                 onClick={handleRefresh}
//                 variant="text"
//                 className="mt-2 text-blue-500"
//                 disabled={loading}
//               >
//                 Thử lại
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {opponents.map((opponent) => (
//                 <div
//                   key={opponent.userId}
//                   className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex items-center space-x-3">
//                     {opponent.avatarUrl ? (
//                       <Image
//                         src={opponent.avatarUrl}
//                         alt={opponent.username}
//                         width={50}
//                         height={50}
//                         className="rounded-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
//                         <User className="text-gray-500" size={24} />
//                       </div>
//                     )}
//                     <div>
//                       <h3 className="font-semibold">{opponent.username}</h3>
//                       <div className="flex space-x-4 text-sm text-gray-600">
//                         <span>Hạng: {translateRanking(opponent.ranking)}</span>
//                         <span>Điểm: {opponent.points.toLocaleString()}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     color={
//                       opponent.isInvited ||
//                       invitedOpponents.includes(opponent.userId)
//                         ? "gray"
//                         : "green"
//                     }
//                     onClick={() => handleInvite(opponent.userId)}
//                     className="px-3 py-1.5"
//                     disabled={
//                       loading ||
//                       opponent.isInvited ||
//                       invitedOpponents.includes(opponent.userId)
//                     }
//                   >
//                     {opponent.isInvited ||
//                     invitedOpponents.includes(opponent.userId)
//                       ? "Đã mời"
//                       : "Mời"}
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OpponentRecommendationModal;
"use client";
import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { User, X, RefreshCw } from "lucide-react";
import Image from "next/image";

interface Opponent {
  userId: number;
  username: string;
  avatarUrl: string | null;
  ranking: string;
  points: number;
  isInvited?: boolean;
}

interface OpponentRecommendationModalProps {
  startDate: string;
  endDate: string;
  tableId: number;
  open: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
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

  const fetchOpponents = async () => {
    try {
      setLoading(true);
      setError(null);

      const authDataString = localStorage.getItem("authData");
      const authData = JSON.parse(authDataString || "{}");
      const userId = authData.userId;

      const formattedStartTime = new Date(startDate).toISOString();
      const formattedEndTime = new Date(endDate).toISOString();

      const url = new URL(
        `https://backend-production-ac5e.up.railway.app/api/users/by-ranking/random/${userId}/table/${tableId}`
      );

      url.searchParams.append("StartTime", formattedStartTime);
      url.searchParams.append("EndTime", formattedEndTime);

      const response = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch opponents");
      }

      const data = await response.json();
      setOpponents(data.matchingOpponents || []);
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
      fetchOpponents();
    }
  }, [open, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
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

      setOpponents((prev) =>
        prev.map((o) =>
          o.userId === opponentId ? { ...o, isInvited: true } : o
        )
      );

      onInviteSuccess();
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
          <p className="text-sm text-gray-600 mb-4">
            Mời đối thủ phù hợp vào bàn {tableId} từ {formatTime(startDate)} đến{" "}
            {formatTime(endDate)}
          </p>

          {loading && opponents.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : opponents.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              Không tìm thấy đối thủ phù hợp
              <Button
                onClick={handleRefresh}
                variant="text"
                className="mt-2 text-blue-500"
                disabled={loading}
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {opponents.map((opponent) => (
                <div
                  key={opponent.userId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
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
                      opponent.isInvited ||
                      invitedOpponents.includes(opponent.userId)
                        ? "gray"
                        : "green"
                    }
                    onClick={() => handleInvite(opponent.userId)}
                    className="px-3 py-1.5"
                    disabled={
                      loading ||
                      opponent.isInvited ||
                      invitedOpponents.includes(opponent.userId)
                    }
                  >
                    {opponent.isInvited ||
                    invitedOpponents.includes(opponent.userId)
                      ? "Đã mời"
                      : "Mời"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpponentRecommendationModal;
