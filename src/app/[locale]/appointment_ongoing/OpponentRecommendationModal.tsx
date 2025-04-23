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
import { User, X, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { FiSearch, FiUsers } from "react-icons/fi";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
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
}

interface ChessBooking {
  tableId: number;
  startDate: string;
  endDate: string;
  invitedUsers: {
    userId: number;
    data?: { username: string; fullName: string; avatarUrl: string | null };
  }[];
}

interface OpponentRecommendationModalProps {
  startDate: string;
  endDate: string;
  tableId: number;
  open: boolean;
  onClose: () => void;
  onInviteSuccess: (opponents: Opponent[]) => Promise<boolean>;
}

interface ApiResponse {
  matchingOpponents: Opponent[];
  friends: Opponent[];
}

const OpponentRecommendationModalWithNewInvite = ({
  startDate,
  endDate,
  tableId,
  open,
  onClose,
  onInviteSuccess,
}: OpponentRecommendationModalProps) => {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [friends, setFriends] = useState<Opponent[]>([]);
  const [selectedOpponents, setSelectedOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedOpponents, setInvitedOpponents] = useState<number[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("friends");
  const hasFetchedInitialData = useRef(false);

  const getChessBookingsInvite = () => {
    const savedBookings = localStorage.getItem("chessBookingsInvite");
    return savedBookings ? JSON.parse(savedBookings) : ([] as ChessBooking[]);
  };

  const saveChessBookingsInvite = (bookings: ChessBooking[]) => {
    localStorage.setItem("chessBookingsInvite", JSON.stringify(bookings));
  };

  const fetchOpponents = async () => {
    try {
      setLoading(true);
      setError(null);

      const authDataString = localStorage.getItem("authData");
      const authData = JSON.parse(authDataString || "{}");
      const userId = authData.userId;

      const bookings = getChessBookingsInvite();
      let alreadyInvitedIds: number[] = [];
      let selectedOpponentIds: number[] = [];

      const currentBooking = bookings.find(
        (b: ChessBooking) =>
          b.tableId === tableId &&
          b.startDate === startDate &&
          b.endDate === endDate,
      );

      if (currentBooking?.invitedUsers) {
        alreadyInvitedIds = currentBooking.invitedUsers.map(
          (user: { userId: number }) => user.userId,
        );
        selectedOpponentIds = currentBooking.invitedUsers.map(
          (user: { userId: number }) => user.userId,
        );
      }

      const url = new URL(
        `https://backend-production-ac5e.up.railway.app/api/users/opponents/${userId}`,
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

      const markedOpponents = data.matchingOpponents.map((opponent) => ({
        ...opponent,
        isInvited: alreadyInvitedIds.includes(opponent.userId),
      }));

      const markedFriends = data.friends.map((friend) => ({
        ...friend,
        isInvited: alreadyInvitedIds.includes(friend.userId),
      }));

      const selectedFromStorage = [...markedOpponents, ...markedFriends].filter(
        (opponent) => selectedOpponentIds.includes(opponent.userId),
      );

      const missingOpponents = currentBooking?.invitedUsers
        ? currentBooking.invitedUsers
            .filter(
              (user: any) =>
                !selectedFromStorage.some((o) => o.userId === user.userId),
            )
            .map((user: any) => ({
              userId: user.userId,
              username: user.data?.username || "Unknown",
              fullName: user.data?.fullName || "Unknown",
              avatarUrl: user.data?.avatarUrl || null,
              email: "",
              status: "",
              bio: null,
              points: 0,
              gender: "",
              isInvited: alreadyInvitedIds.includes(user.userId),
            }))
        : [];

      setOpponents(markedOpponents || []);
      setFriends(markedFriends || []);
      setSelectedOpponents([...selectedFromStorage, ...missingOpponents]);
      setInvitedOpponents(alreadyInvitedIds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
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
    const bookings = getChessBookingsInvite();
    const currentBooking = bookings.find(
      (b: ChessBooking) =>
        b.tableId === tableId &&
        b.startDate === startDate &&
        b.endDate === endDate,
    );

    const currentInvitedCount = currentBooking?.invitedUsers?.length || 0;
    const totalCount = currentInvitedCount + 1;

    if (totalCount > 6) {
      toast.error("Mỗi bàn chỉ có thể thêm tối đa 6 người");
      return;
    }

    if (!selectedOpponents.some((o) => o.userId === opponent.userId)) {
      const newSelectedOpponents = [...selectedOpponents, opponent];
      setSelectedOpponents(newSelectedOpponents);

      const bookingIndex = bookings.findIndex(
        (b: ChessBooking) =>
          b.tableId === tableId &&
          b.startDate === startDate &&
          b.endDate === endDate,
      );

      const opponentData = {
        userId: opponent.userId,
        username: opponent.username,
        fullName: opponent.fullName,
        avatarUrl: opponent.avatarUrl,
      };

      if (bookingIndex !== -1) {
        bookings[bookingIndex].invitedUsers = newSelectedOpponents.map((o) => ({
          userId: o.userId,
          data: {
            username: o.username,
            fullName: o.fullName,
            avatarUrl: o.avatarUrl,
          },
        }));
      } else {
        bookings.push({
          tableId,
          startDate,
          endDate,
          invitedUsers: newSelectedOpponents.map((o) => ({
            userId: o.userId,
            data: {
              username: o.username,
              fullName: o.fullName,
              avatarUrl: o.avatarUrl,
            },
          })),
        });
      }

      saveChessBookingsInvite(bookings);
    }
  };

  const handleRemoveOpponent = (userId: number) => {
    const newSelectedOpponents = selectedOpponents.filter(
      (o) => o.userId !== userId,
    );
    setSelectedOpponents(newSelectedOpponents);

    const bookings = getChessBookingsInvite();
    const bookingIndex = bookings.findIndex(
      (b: ChessBooking) =>
        b.tableId === tableId &&
        b.startDate === startDate &&
        b.endDate === endDate,
    );

    if (bookingIndex !== -1) {
      bookings[bookingIndex].invitedUsers = newSelectedOpponents.map((o) => ({
        userId: o.userId,
        data: {
          username: o.username,
          fullName: o.fullName,
          avatarUrl: o.avatarUrl,
        },
      }));
      saveChessBookingsInvite(bookings);
    }
  };

  const handleRemoveAll = () => {
    setSelectedOpponents([]);

    const bookings = getChessBookingsInvite();
    const bookingIndex = bookings.findIndex(
      (b: ChessBooking) =>
        b.tableId === tableId &&
        b.startDate === startDate &&
        b.endDate === endDate,
    );

    if (bookingIndex !== -1) {
      bookings[bookingIndex].invitedUsers = [];
      saveChessBookingsInvite(bookings);
    }
  };

  const handleInviteAll = async () => {
    try {
      setLoading(true);
      const success = await onInviteSuccess(selectedOpponents);
      if (success) {
        setInvitedOpponents([
          ...invitedOpponents,
          ...selectedOpponents.map((o) => o.userId),
        ]);
        setSelectedOpponents([]);

        const bookings = getChessBookingsInvite();
        const bookingIndex = bookings.findIndex(
          (b: ChessBooking) =>
            b.tableId === tableId &&
            b.startDate === startDate &&
            b.endDate === endDate,
        );

        if (bookingIndex !== -1) {
          bookings[bookingIndex].invitedUsers = [];
          saveChessBookingsInvite(bookings);
        }

        onClose();
      }
    } catch (err) {
      console.error("Error inviting opponents:", err);
      toast.error("Có lỗi khi gửi lời mời");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const renderOpponentList = (
    opponents: Opponent[],
    isSelectedTab: boolean = false,
  ) => {
    if (opponents.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <Typography
            variant="h3"
            className="mt-2 text-lg font-medium text-gray-900"
          >
            {isSelectedTab
              ? "Chưa có đối thủ nào được chọn"
              : "Không tìm thấy đối thủ"}
          </Typography>
          <Typography variant="paragraph" className="mt-1 text-gray-500">
            {isSelectedTab
              ? "Hãy thêm đối thủ từ các tab khác"
              : "Hãy thử tìm kiếm với từ khóa khác hoặc làm mới danh sách"}
          </Typography>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {opponents.map((opponent) => {
          const isMember =
            opponent.userRole === "Member" || opponent.userRole === 1;
          return (
            <div
              key={opponent.userId}
              className={`border rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                isMember
                  ? "border-purple-200 hover:bg-purple-50"
                  : "border-gray-200"
              }`}
            >
              <Badge
                overlap="circular"
                placement="bottom-end"
                className={`border-2 border-white ${
                  isMember
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse !h-5 !w-5"
                    : "bg-blue-gray-100"
                }`}
                content={
                  isMember ? (
                    <Tooltip content="Thành viên câu lạc bộ">
                      <CheckBadgeIcon className="h-4 w-4 text-white" />
                    </Tooltip>
                  ) : null
                }
              >
                {opponent.avatarUrl ? (
                  <Image
                    src={opponent.avatarUrl}
                    alt={opponent.fullName || "Avatar"}
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
              </Badge>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-sm truncate ${
                    isMember ? "text-purple-700" : "text-gray-800"
                  }`}
                >
                  {opponent.username || opponent.fullName}
                  {isMember && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-bounce">
                      MEMBER
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span
                    className={`text-xs ${
                      isMember ? "text-purple-600" : "text-gray-500"
                    }`}
                  >
                    {opponent.gender === "male" ? "Nam" : "Nữ"}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {isSelectedTab ? (
                  <Button
                    onClick={() => handleRemoveOpponent(opponent.userId)}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2.5 py-1"
                  >
                    Xóa
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAddOpponent(opponent)}
                    disabled={
                      opponent.isInvited ||
                      loading ||
                      selectedOpponents.some(
                        (o) => o.userId === opponent.userId,
                      )
                    }
                    size="sm"
                    className={`text-white text-xs px-2.5 py-1 ${
                      opponent.isInvited ||
                      selectedOpponents.some(
                        (o) => o.userId === opponent.userId,
                      )
                        ? "bg-gray-400"
                        : isMember
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {selectedOpponents.some((o) => o.userId === opponent.userId)
                      ? "Đã thêm"
                      : opponent.isInvited
                        ? "Đã mời"
                        : "Thêm"}
                  </Button>
                )}
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
    {
      label: (
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Đã chọn
          {selectedOpponents.length > 0 && (
            <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
              {selectedOpponents.length}
            </span>
          )}
        </div>
      ),
      value: "selected",
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
              <TabPanel value="selected" className="p-0 mt-4">
                <div className="mb-4 flex justify-between items-center">
                  <Button
                    onClick={handleRemoveAll}
                    disabled={selectedOpponents.length === 0 || loading}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Xóa tất cả
                  </Button>
                  <Button
                    onClick={handleInviteAll}
                    disabled={selectedOpponents.length === 0 || loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Mời ({selectedOpponents.length})
                  </Button>
                </div>
                {renderOpponentList(selectedOpponents, true)}
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OpponentRecommendationModalWithNewInvite;
