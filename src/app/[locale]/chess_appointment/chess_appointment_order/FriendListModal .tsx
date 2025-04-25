"use client";

import { useState, useEffect, useRef } from "react";
import {
  Input,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Spinner,
  Typography,
  Button,
  Badge,
  Tooltip,
} from "@material-tailwind/react";
import { User, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import { FiSearch, FiUsers } from "react-icons/fi";
import { CheckBadgeIcon, StarIcon } from "@heroicons/react/24/solid";
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
  userRole?: string | number;
  userLabel?: string; // Add userLabel for Top Contributor
}

interface ChessBooking {
  tableId: number;
  startDate: string;
  endDate: string;
  invitedUsers: {
    userId: number;
    username: string;
    avatarUrl: string | null;
  }[];
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
  const [activeTab, setActiveTab] = useState("friends");
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
      setInvitedOpponents(alreadyInvitedIds);
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

  const handleAddOpponent = (opponent: Opponent) => {
    // Get current bookings from localStorage
    const savedBookings = localStorage.getItem("chessBookings");
    if (!savedBookings) {
      toast.error("Không tìm thấy thông tin đặt bàn");
      return;
    }

    const bookings: ChessBooking[] = JSON.parse(savedBookings);
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

    const currentInvitedCount = currentBooking.invitedUsers?.length || 0;
    if (currentInvitedCount >= 6) {
      toast.error("Mỗi bàn chỉ có thể mời tối đa 6 người");
      return;
    }

    if (!invitedOpponents.includes(opponent.userId)) {
      try {
        setLoading(true);
        // Update localStorage
        const updatedBookings = bookings.map((b) => {
          if (
            b.tableId === tableId &&
            b.startDate === startDate &&
            b.endDate === endDate
          ) {
            const newInvitedUsers = [
              ...(b.invitedUsers || []),
              {
                userId: opponent.userId,
                username: opponent.username,
                avatarUrl: opponent.avatarUrl,
              },
            ];
            return {
              ...b,
              invitedUsers: newInvitedUsers,
            };
          }
          return b;
        });

        localStorage.setItem("chessBookings", JSON.stringify(updatedBookings));

        // Update state to mark opponent as invited
        setOpponents((prev) =>
          prev.map((o) =>
            o.userId === opponent.userId ? { ...o, isInvited: true } : o
          )
        );
        setFriends((prev) =>
          prev.map((f) =>
            f.userId === opponent.userId ? { ...f, isInvited: true } : f
          )
        );
        setInvitedOpponents((prev) => [...prev, opponent.userId]);

        // Call onInviteSuccess to update parent component
        onInviteSuccess(opponent);

        toast.success(`Đã mời ${opponent.username} vào bàn!`);
      } catch (err) {
        console.error("Error adding opponent:", err);
        toast.error("Có lỗi khi mời đối thủ");
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning(`${opponent.username} đã được mời!`);
    }
  };

  const isMember = (userRole: string | number | undefined) =>
    userRole === "Member" || userRole === 1;

  const isTopContributor = (userLabel: string | undefined) =>
    userLabel === "top_contributor";

  if (!open) return null;

  const renderOpponentList = (opponents: Opponent[]) => {
    if (opponents.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <Typography
            variant="h3"
            className="mt-2 text-lg font-medium text-gray-900"
          >
            Không tìm thấy đối thủ
          </Typography>
          <Typography variant="paragraph" className="mt-1 text-gray-500">
            Hãy thử tìm kiếm với từ khóa khác hoặc làm mới danh sách
          </Typography>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {opponents.map((opponent) => {
          const member = isMember(opponent.userRole);
          const topContributor = isTopContributor(opponent.userLabel);
          return (
            <div
              key={opponent.userId}
              className={`border rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                member
                  ? "border-purple-200 hover:bg-purple-50"
                  : topContributor
                    ? "border-yellow-200 hover:bg-yellow-50"
                    : "border-gray-200"
              }`}
            >
              <Badge
                overlap="circular"
                placement="bottom-end"
                className={`border-2 border-white ${
                  member
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse !h-5 !w-5"
                    : topContributor
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500  !h-5 !w-5"
                      : "bg-blue-gray-100"
                }`}
                content={
                  member || topContributor ? (
                    <div className="flex gap-1">
                      {member && (
                        <Tooltip content="Thành viên câu lạc bộ">
                          <CheckBadgeIcon className="h-4 w-4 text-white" />
                        </Tooltip>
                      )}
                    </div>
                  ) : null
                }
              >
                {opponent.avatarUrl ? (
                  <Image
                    src={opponent.avatarUrl}
                    alt={opponent.fullName}
                    width={40}
                    height={40}
                    className={`rounded-full object-cover w-10 h-10 flex-shrink-0 ${
                      member
                        ? "border-2 border-purple-500 shadow-lg shadow-purple-500/30"
                        : topContributor
                          ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/30"
                          : ""
                    }`}
                  />
                ) : (
                  <div
                    className={`bg-gray-200 text-gray-500 w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                      member
                        ? "border-2 border-purple-500 shadow-lg shadow-purple-500/30"
                        : topContributor
                          ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/30"
                          : ""
                    }`}
                  >
                    <User size={18} />
                  </div>
                )}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold text-sm truncate ${
                      member
                        ? "text-purple-700"
                        : topContributor
                          ? "text-yellow-700"
                          : "text-gray-800"
                    }`}
                  >
                    {opponent.username || opponent.fullName}
                  </h3>
                  {member && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white ">
                      MEMBER
                    </span>
                  )}
                  {topContributor && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white ">
                      TOP CONTRIBUTOR
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span
                    className={`text-xs ${
                      member
                        ? "text-purple-600"
                        : topContributor
                          ? "text-yellow-600"
                          : "text-gray-500"
                    }`}
                  >
                    {opponent.gender === "male" ? "Nam" : "Nữ"}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => handleAddOpponent(opponent)}
                  disabled={opponent.isInvited || loading}
                  size="sm"
                  className={`text-white text-xs px-2.5 py-1 ${
                    opponent.isInvited
                      ? "bg-gray-400"
                      : member
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : topContributor
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {opponent.isInvited ? "Đã mời" : "Thêm"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const tabsData = [
    {
      label: (
        <div className="flex items-center gap-2">
          <FiUsers className="h-5 w-5" />
          Bạn bè
        </div>
      ),
      value: "friends",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <FiSearch className="h-5 w-5" />
          Đối thủ khác
        </div>
      ),
      value: "opponents",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
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
            <Input
              type="text"
              label="Tìm kiếm đối thủ..."
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fetchOpponents();
                }
              }}
              crossOrigin="anonymous"
            />
            <Button
              onClick={fetchOpponents}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap"
              disabled={loading}
            >
              Tìm kiếm
            </Button>
          </div>

          <Tabs value={activeTab} className="mb-4">
            <TabsHeader>
              {tabsData.map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className="flex items-center gap-2"
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              <TabPanel value="friends" className="p-0 mt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-12 w-12" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4">{error}</div>
                ) : (
                  renderOpponentList(friends)
                )}
              </TabPanel>
              <TabPanel value="opponents" className="p-0 mt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-12 w-12" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4">{error}</div>
                ) : (
                  renderOpponentList(opponents)
                )}
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OpponentRecommendationModal;
