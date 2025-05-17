"use client";

import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiSearch,
  FiUserPlus,
  FiCheck,
  FiX,
  FiUser,
  FiClock,
  FiUsers,
  FiInfo,
} from "react-icons/fi";
import {
  Card,
  CardBody,
  CardFooter,
  Input,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Avatar,
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
import { useLocale } from "next-intl";

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
  userLabel?: string | number;
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
  userLabel?: string | number;
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
  const { locale } = useParams();
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<
    User | SearchFriendResult | null
  >(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState<{
    [key: number]: boolean;
  }>({});
  const [isProcessingRequest, setIsProcessingRequest] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) {
      router.push(`/${locale}/login`);
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
      router.push(`/${locale}/login`);
    }
  }, [router, locale]);

  const localActive = useLocale();

  const loadFriendRequests = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friendrequests/to/${userId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể tải yêu cầu kết bạn");
      }

      const data = await response.json();
      setFriendRequests(data.pagedList || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải yêu cầu kết bạn"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadFriendList = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friendlists/user/${userId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể tải danh sách bạn bè");
      }

      const data = await response.json();
      setFriendList(data.pagedList || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách bạn bè"
      );
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
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/search-friends?username=${searchTerm}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không tìm thấy người dùng");
      }

      const data = await response.json();
      setSearchResults(data.pagedList || []);
      setActiveTab("search");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tìm thấy người dùng"
      );
      toast.error(
        err instanceof Error
          ? err.message
          : "Không tìm thấy người dùng bạn đã tìm kiếm"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: number) => {
    if (!userId) return;

    setIsSendingRequest((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/friendrequests`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          fromUser: userId,
          toUser: targetUserId,
        }),
      });

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Gửi yêu cầu kết bạn thất bại");
      }

      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.userId === targetUserId ? { ...user, friendStatus: 1 } : user
        )
      );
      toast.success("Yêu cầu kết bạn đã được gửi");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gửi yêu cầu kết bạn thất bại"
      );
    } finally {
      setIsSendingRequest((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const cancelFriendRequest = async (receiverId: number) => {
    if (!userId) return;

    setIsSendingRequest((prev) => ({ ...prev, [receiverId]: true }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friendrequests/sender/${userId}/receiver/${receiverId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Hủy yêu cầu kết bạn thất bại");
      }

      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.userId === receiverId ? { ...user, friendStatus: 0 } : user
        )
      );
      toast.success("Đã hủy yêu cầu kết bạn");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Hủy yêu cầu kết bạn thất bại"
      );
    } finally {
      setIsSendingRequest((prev) => ({ ...prev, [receiverId]: false }));
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    setIsProcessingRequest((prev) => ({ ...prev, [requestId]: true }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friendrequests/accept/${requestId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Chấp nhận yêu cầu kết bạn thất bại");
      }

      await loadFriendRequests();
      await loadFriendList();
      toast.success("Đã chấp nhận yêu cầu kết bạn");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Chấp nhận yêu cầu kết bạn thất bại"
      );
      await loadFriendRequests();
      toast.error(
        err instanceof Error
          ? err.message
          : "Chấp nhận yêu cầu kết bạn thất bại"
      );
    } finally {
      setIsProcessingRequest((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const rejectFriendRequest = async (requestId: number) => {
    setIsProcessingRequest((prev) => ({ ...prev, [requestId]: true }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friendrequests/reject/${requestId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Từ chối yêu cầu kết bạn thất bại");
      }

      await loadFriendRequests();
      await loadFriendList();
      toast.success("Đã từ chối yêu cầu kết bạn");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Từ chối yêu cầu kết bạn thất bại"
      );
      await loadFriendRequests();
      toast.error(
        err instanceof Error ? err.message : "Từ chối yêu cầu kết bạn thất bại"
      );
    } finally {
      setIsProcessingRequest((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const removeFriend = async (id: number) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/friendlists/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Hủy kết bạn thất bại");
      }

      await loadFriendList();
      toast.success("Đã hủy kết bạn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hủy kết bạn thất bại");
      toast.error(err instanceof Error ? err.message : "Hủy kết bạn thất bại");
    }
  };

  const pendingRequests = friendRequests.filter(
    (request) => request.status === "pending"
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
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.map((request) => {
                      const isMember =
                        request.fromUserNavigation.userRole === "Member" ||
                        request.fromUserNavigation.userRole === 1;
                      const isTopContributor =
                        request.fromUserNavigation.userLabel === 1 ||
                        request.fromUserNavigation.userLabel ===
                          "top_contributor";

                      return (
                        <Card
                          key={request.id}
                          className={`hover:shadow-md transition-shadow ${
                            isMember
                              ? "border border-purple-200"
                              : isTopContributor
                                ? "border border-amber-200"
                                : ""
                          }`}
                        >
                          <CardBody className="p-4">
                            <div className="flex items-center gap-4">
                              <Badge
                                overlap="circular"
                                placement="bottom-end"
                                className={`border-2 border-white ${
                                  isMember
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"
                                    : isTopContributor
                                      ? "bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse"
                                      : "bg-blue-gray-100"
                                }`}
                                content={
                                  isMember ? (
                                    <Tooltip content="Thành viên câu lạc bộ">
                                      <CheckBadgeIcon className="h-5 w-5 text-white" />
                                    </Tooltip>
                                  ) : isTopContributor ? (
                                    <Tooltip content="Top Contributor">
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
                                  size="lg"
                                  className={`border-2 ${
                                    isMember
                                      ? "border-purple-500 shadow-lg shadow-purple-500/20"
                                      : isTopContributor
                                        ? "border-amber-500 shadow-lg shadow-amber-500/20"
                                        : "border-blue-100"
                                  }`}
                                />
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col items-start gap-1">
                                  <Typography
                                    variant="h5"
                                    className={`text-gray-900 truncate ${
                                      isMember
                                        ? "text-purple-600"
                                        : isTopContributor
                                          ? "text-amber-700"
                                          : ""
                                    }`}
                                  >
                                    {request.fromUserNavigation.username}
                                  </Typography>
                                  <div className="flex items-center gap-2">
                                    {isMember && (
                                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                        MEMBER
                                      </span>
                                    )}
                                    {isTopContributor && (
                                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                        TOP CONTRIBUTOR
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Typography
                                  variant="small"
                                  color="gray"
                                  className="truncate"
                                >
                                  {request.fromUserNavigation.fullName ||
                                    "Không có tên hiển thị"}
                                </Typography>
                              </div>
                            </div>
                          </CardBody>
                          <CardFooter className="pt-0 flex flex-col gap-2">
                            <Button
                              fullWidth
                              variant={
                                isMember || isTopContributor
                                  ? "gradient"
                                  : "outlined"
                              }
                              color={
                                isMember
                                  ? "purple"
                                  : isTopContributor
                                    ? "amber"
                                    : "blue-gray"
                              }
                              className={`flex items-center justify-center gap-2 ${
                                isMember
                                  ? "shadow-purple-500/20"
                                  : isTopContributor
                                    ? "shadow-amber-500/20"
                                    : ""
                              }`}
                              onClick={() =>
                                handleViewProfile(request.fromUserNavigation)
                              }
                            >
                              <FiInfo className="h-4 w-4" />
                              Xem thông tin
                            </Button>
                            <Button
                              fullWidth
                              variant={
                                isMember || isTopContributor
                                  ? "gradient"
                                  : "filled"
                              }
                              color={
                                isMember
                                  ? "purple"
                                  : isTopContributor
                                    ? "amber"
                                    : "blue"
                              }
                              className={`flex items-center justify-center gap-2 ${
                                isMember
                                  ? "shadow-purple-500/20"
                                  : isTopContributor
                                    ? "shadow-amber-500/20"
                                    : ""
                              }`}
                              onClick={() => acceptFriendRequest(request.id)}
                              loading={isProcessingRequest[request.id] || false}
                            >
                              {!isProcessingRequest[request.id] && (
                                <FiCheck className="h-4 w-4" />
                              )}
                              Chấp nhận
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              color={
                                isMember
                                  ? "purple"
                                  : isTopContributor
                                    ? "amber"
                                    : "red"
                              }
                              className={`flex items-center justify-center gap-2 ${
                                isMember
                                  ? "border-purple-500 text-purple-500 hover:bg-purple-50"
                                  : isTopContributor
                                    ? "border-amber-500 text-amber-700 hover:bg-amber-50"
                                    : "border-red-500 text-red-500 hover:bg-red-50"
                              }`}
                              onClick={() => rejectFriendRequest(request.id)}
                              loading={isProcessingRequest[request.id] || false}
                            >
                              {!isProcessingRequest[request.id] && (
                                <FiX className="h-4 w-4" />
                              )}
                              Từ chối
                            </Button>
                          </CardFooter>
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
                        isSendingRequest={
                          isSendingRequest[user.userId] || false
                        }
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
