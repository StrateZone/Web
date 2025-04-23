"use client";

import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiUserPlus,
  FiCheck,
  FiX,
  FiUser,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import {
  Card,
  CardBody,
  Input,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Avatar,
  IconButton,
  Chip,
  Spinner,
  Typography,
  Button,
  Badge,
  Tooltip,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import { FriendCard } from "./FriendCard";
import { SearchResultCard } from "./SearchResultCard";
import { UserProfileDialog } from "./UserProfileDialog";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

type FriendRequest = {
  id: number;
  fromUser: number;
  toUser: number;
  status: string;
  createdAt: string;
  fromUserNavigation: User;
  toUserNavigation: User;
};

export interface User {
  userId: number;
  cartId: number | null;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  password: string;
  status: "Active" | "Inactive" | string;
  address: string;
  avatarUrl: string;
  bio: string | null;
  points: number;
  userRole: number | string;
  gender: number;
  skillLevel: number;
  ranking: number;
  createdAt: string;
  updatedAt: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  otp: string | null;
  otpExpiry: string | null;
  wallet: null | {
    walletId: number;
    balance: number;
  };
}

export interface FriendList {
  id: number;
  userId: number;
  friendId: number;
  status: "accepted" | "pending" | "rejected" | string;
  createdAt: string;
  updatedAt: string;
  friend: User;
}

export interface SearchFriendResult {
  friendStatus: number;
  userId: number;
  username: string;
  email: string;
  phone: string;
  userRole: string;
  fullName: string | null;
  status: string;
  address: string | null;
  avatarUrl: string | null;
  bio: string | null;
  points: number;
  gender: string;
  skillLevel: string;
  ranking: string;
  createdAt: string;
}

export default function FriendManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchFriendResult[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendList, setFriendList] = useState<FriendList[]>([]);
  const [activeTab, setActiveTab] = useState("friends");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<
    User | SearchFriendResult | null
  >(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);

  useEffect(() => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) {
      router.push("/login");
      return;
    }

    try {
      const authData = JSON.parse(authDataString);
      if (authData.userId) {
        setUserId(authData.userId);
      } else {
        throw new Error("Không tìm thấy userId trong dữ liệu xác thực");
      }
    } catch (error) {
      console.error("Lỗi phân tích dữ liệu xác thực:", error);
      router.push("/login");
    }
  }, [router]);

  const loadFriendRequests = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/to/${userId}`,
      );
      const data = await response.json();
      setFriendRequests(data.pagedList || []);
    } catch (err) {
      setError("Không thể tải yêu cầu kết bạn");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadFriendList = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendlists/user/${userId}`,
      );
      const data = await response.json();
      setFriendList(data.pagedList || []);
    } catch (err) {
      setError("Không thể tải danh sách bạn bè");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadFriendList();
      loadFriendRequests();
    }
  }, [userId, loadFriendList, loadFriendRequests]);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/users/${userId}/search-friends?username=${searchTerm}`,
      );
      const data = await response.json();
      setSearchResults(data.pagedList || []);
      setActiveTab("search");
    } catch (err) {
      toast.error("Không tìm thấy người dùng bạn đã tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: number) => {
    if (!userId) return;

    setSearchResults((prevResults) =>
      prevResults.map((user) =>
        user.userId === targetUserId ? { ...user, friendStatus: 1 } : user,
      ),
    );

    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromUser: userId,
            toUser: targetUserId,
          }),
        },
      );

      if (!response.ok) {
        setSearchResults((prevResults) =>
          prevResults.map((user) =>
            user.userId === targetUserId ? { ...user, friendStatus: 0 } : user,
          ),
        );
        const errorData = await response.json();
        throw new Error(errorData.message || "Gửi yêu cầu thất bại");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    }
  };

  const cancelFriendRequest = async (receiverId: number) => {
    if (!userId) return;

    try {
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.userId === receiverId ? { ...user, friendStatus: 0 } : user,
        ),
      );

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/sender/${userId}/receiver/${receiverId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        setSearchResults((prevResults) =>
          prevResults.map((user) =>
            user.userId === receiverId ? { ...user, friendStatus: 1 } : user,
          ),
        );
        throw new Error("Hủy yêu cầu thất bại");
      }

      toast.success("Đã hủy yêu cầu kết bạn");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hủy yêu cầu thất bại");
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try {
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/accept/${requestId}`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("Chấp nhận yêu cầu thất bại");
      }

      await loadFriendRequests();
      await loadFriendList();
    } catch (err) {
      loadFriendRequests();
      setError(
        err instanceof Error ? err.message : "Chấp nhận yêu cầu thất bại",
      );
    }
  };

  const rejectFriendRequest = async (requestId: number) => {
    try {
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/reject/${requestId}`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("Từ chối yêu cầu thất bại");
      }

      await loadFriendRequests();
      await loadFriendList();
    } catch (err) {
      loadFriendRequests();
      setError(err instanceof Error ? err.message : "Từ chối yêu cầu thất bại");
    }
  };

  const removeFriend = async (id: number) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendlists/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Hủy kết bạn thất bại");
      }

      await loadFriendList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hủy kết bạn thất bại");
    }
  };

  const pendingRequests = friendRequests.filter(
    (request) => request.status === "pending",
  );

  const tabsData = [
    {
      label: (
        <div className="flex items-center gap-2">
          <FiUsers className="h-5 w-5" />
          Bạn bè
          <Chip
            value={friendList.length}
            size="sm"
            variant="ghost"
            color="blue"
            className="rounded-full"
          />
        </div>
      ),
      value: "friends",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <FiClock className="h-5 w-5" />
          Yêu cầu
          <Chip
            value={pendingRequests.length}
            size="sm"
            variant="ghost"
            color="amber"
            className="rounded-full"
          />
        </div>
      ),
      value: "requests",
    },
    ...(searchResults.length > 0
      ? [
          {
            label: (
              <div className="flex items-center gap-2">
                <FiSearch className="h-5 w-5" />
                Kết quả tìm kiếm
                <Chip
                  value={searchResults.length}
                  size="sm"
                  variant="ghost"
                  color="green"
                  className="rounded-full"
                />
              </div>
            ),
            value: "search",
          },
        ]
      : []),
  ];

  const handleViewProfile = (user: User | SearchFriendResult) => {
    setSelectedUser(user);
    setOpenProfileDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Banner title="Quản lý bạn bè" subtitle="Kết nối với người chơi khác" />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Thanh tìm kiếm */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative flex items-center gap-2">
            <Input
              type="text"
              label="Tìm kiếm theo tên người dùng..."
              className="flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              crossOrigin="anonymous"
            />
            <Button
              onClick={handleSearch}
              className="flex items-center gap-2"
              loading={isLoading}
            >
              {!isLoading && <FiSearch className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {/* {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )} */}

        {/* Các tab */}
        <Tabs value={activeTab} className="mb-8">
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
              <div className="p-6">
                <Typography variant="h2" className="mb-6 text-gray-800">
                  Danh sách bạn bè
                </Typography>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-12 w-12" />
                  </div>
                ) : friendList.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardBody>
                      <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                      <Typography
                        variant="h3"
                        className="mt-2 text-lg font-medium text-gray-900"
                      >
                        Chưa có bạn bè
                      </Typography>
                      <Typography
                        variant="paragraph"
                        className="mt-1 text-gray-500"
                      >
                        Hãy bắt đầu bằng cách tìm kiếm người chơi để kết nối
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friendList.map((friendItem) => (
                      <FriendCard
                        key={friendItem.id}
                        user={friendItem.friend}
                        isFriend={true}
                        onRemoveFriend={() => removeFriend(friendItem.id)}
                        onViewProfile={() =>
                          handleViewProfile(friendItem.friend)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel value="requests" className="p-0 mt-4">
              <div className="p-6">
                <Typography variant="h2" className="mb-6 text-gray-800">
                  Yêu cầu kết bạn
                </Typography>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-12 w-12" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardBody>
                      <FiUserPlus className="mx-auto h-12 w-12 text-gray-400" />
                      <Typography
                        variant="h3"
                        className="mt-2 text-lg font-medium text-gray-900"
                      >
                        Không có yêu cầu đang chờ
                      </Typography>
                      <Typography
                        variant="paragraph"
                        className="mt-1 text-gray-500"
                      >
                        Hiện tại bạn không có yêu cầu kết bạn nào
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => {
                      const isMember =
                        request.fromUserNavigation.userRole === 1; // Kiểm tra nếu là Member (role 1)
                      return (
                        <Card
                          key={request.id}
                          className={`hover:shadow-md transition-shadow ${
                            isMember ? "border border-purple-200" : ""
                          }`}
                        >
                          <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <Badge
                                    overlap="circular"
                                    placement="bottom-end"
                                    className={`border-2 border-white ${
                                      isMember
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"
                                        : "bg-blue-gray-100"
                                    }`}
                                    content={
                                      isMember ? (
                                        <Tooltip content="Thành viên câu lạc bộ">
                                          <CheckBadgeIcon className="h-5 w-5 text-white" />
                                        </Tooltip>
                                      ) : null
                                    }
                                  >
                                    <Avatar
                                      src={
                                        request.fromUserNavigation?.avatarUrl ||
                                        "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                                      }
                                      alt={
                                        request.fromUserNavigation?.username ||
                                        "Người dùng ẩn danh"
                                      }
                                      size="md"
                                      className={`border-2 ${
                                        isMember
                                          ? "border-purple-500 shadow-lg shadow-purple-500/20"
                                          : "border-blue-100"
                                      }`}
                                    />
                                  </Badge>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Typography
                                      variant="h6"
                                      className={`text-gray-900 ${
                                        isMember ? "text-purple-600" : ""
                                      }`}
                                    >
                                      {request.fromUserNavigation.username}
                                    </Typography>
                                    {isMember && (
                                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-bounce">
                                        MEMBER
                                      </span>
                                    )}
                                  </div>
                                  <Typography variant="small" color="gray">
                                    Đã gửi{" "}
                                    {new Date(
                                      request.createdAt,
                                    ).toLocaleDateString()}
                                  </Typography>
                                  {isMember && (
                                    <Typography
                                      variant="small"
                                      className="text-purple-500 mt-1"
                                    >
                                      Thành viên Câu Lạc Bộ
                                    </Typography>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 items-center">
                                {/* Nút xem hồ sơ */}
                                <Tooltip content="Xem hồ sơ">
                                  <IconButton
                                    onClick={() =>
                                      handleViewProfile(
                                        request.fromUserNavigation,
                                      )
                                    }
                                    color={isMember ? "purple" : "blue"}
                                    variant="text"
                                    size="sm"
                                  >
                                    <FiUser className="h-5 w-5" />
                                  </IconButton>
                                </Tooltip>
                                <IconButton
                                  onClick={() =>
                                    acceptFriendRequest(request.id)
                                  }
                                  color={isMember ? "purple" : "green"}
                                  variant={isMember ? "gradient" : "outlined"}
                                  title="Chấp nhận"
                                >
                                  <FiCheck className="h-5 w-5" />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    rejectFriendRequest(request.id)
                                  }
                                  color={isMember ? "pink" : "red"}
                                  variant={isMember ? "gradient" : "outlined"}
                                  title="Từ chối"
                                >
                                  <FiX className="h-5 w-5" />
                                </IconButton>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel value="search" className="p-0 mt-4">
              <div className="p-6">
                <Typography variant="h2" className="mb-6 text-gray-800">
                  Kết quả tìm kiếm
                </Typography>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-12 w-12" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardBody>
                      <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                      <Typography
                        variant="h3"
                        className="mt-2 text-lg font-medium text-gray-900"
                      >
                        Không tìm thấy người dùng
                      </Typography>
                      <Typography
                        variant="paragraph"
                        className="mt-1 text-gray-500"
                      >
                        Hãy thử tìm kiếm với tên người dùng khác
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((user) => (
                      <SearchResultCard
                        key={user.userId}
                        user={user}
                        onAddFriend={() => sendFriendRequest(user.userId)}
                        onCancelRequest={() => cancelFriendRequest(user.userId)}
                        onViewProfile={() => handleViewProfile(user)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>

      <UserProfileDialog
        open={openProfileDialog}
        onClose={() => setOpenProfileDialog(false)}
        user={selectedUser}
      />

      <Footer />
    </div>
  );
}
