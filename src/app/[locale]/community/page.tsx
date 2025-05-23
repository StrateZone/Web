"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Typography,
  Chip,
} from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import CommunityCard from "@/components/card/community_card";
import SearchInput from "@/components/input/search_input";
import Footer from "@/components/footer";
import Banner from "@/components/banner/banner";
import { useParams, useRouter } from "next/navigation";
import { DefaultPagination } from "@/components/pagination";
import { MembershipUpgradeDialog } from "./MembershipUpgradeDialog ";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InsufficientBalancePopup } from "../chess_appointment/chess_appointment_order/InsufficientBalancePopup";
import Swal from "sweetalert2";
import { useLocale } from "next-intl";

interface ThreadTag {
  id: number;
  tag?: {
    tagId: number;
    tagName: string;
  };
}

interface Thread {
  threadId: number;
  title: string;
  thumbnailUrl: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount?: number;
  threadsTags?: ThreadTag[];
  createdByNavigation: {
    userId: number;
    fullName: string;
    username: string;
    avatarUrl: string;
  };
  likes?: Array<{ id: number; userId: number | null }>;
  comments?: Array<any>;
}

interface Tag {
  tagId: number;
  tagName: string;
  description?: string;
  postCount: number;
  tagColor: string;
}

interface PaginatedResponse {
  pagedList: Thread[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface MembershipPrice {
  id: number;
  price1: number;
  unit: string;
}

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagLoading, setTagLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const localActive = useLocale();

  const { locale } = useParams();
  const [orderBy, setOrderBy] = useState<
    "created-at-desc" | "popularity" | "friends"
  >("created-at-desc");
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [membershipPrice, setMembershipPrice] =
    useState<MembershipPrice | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const activeButtonClass = "bg-blue-100 font-semibold text-blue-800";
  const inactiveButtonClass = "text-gray-700 hover:bg-gray-100";
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

  useEffect(() => {
    const checkUserMembership = async () => {
      try {
        setInitialLoading(true);
        setError("");

        // Retrieve authData from localStorage
        const authDataString = localStorage.getItem("authData");
        if (!authDataString) {
          setIsLoggedIn(false);
          setInitialLoading(false);
          return;
        }

        // Parse authData to get userId
        const authData = JSON.parse(authDataString);
        const userId = authData.userId;
        if (!userId) {
          throw new Error("Không tìm thấy userId trong dữ liệu xác thực");
        }

        // Fetch user role using the /api/users/{id}/role endpoint
        const response = await fetch(
          `${API_BASE_URL}/api/users/${userId}/role`,
          {
            method: "GET",
            headers: {
              Accept: "text/plain",
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
          throw new Error(errorData || "Không thể lấy vai trò người dùng");
        }

        const userRole = await response.text(); // Response is plain text (e.g., "Member")
        setIsLoggedIn(true);
        setUserId(userId);
        setUserRole(userRole);

        if (userRole === "RegisteredUser") {
          fetchMembershipPrice();
          setShowMembershipDialog(true);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsLoggedIn(false);
        setError(
          error instanceof Error
            ? error.message
            : "Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại."
        );
        toast.error(
          error instanceof Error
            ? error.message
            : "Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại."
        );
      } finally {
        setInitialLoading(false);
      }
    };

    checkUserMembership();
  }, [locale]);

  useEffect(() => {
    if (userRole === "Member" && isLoggedIn) {
      fetchThreads();
      fetchTags();
    }
  }, [
    currentPage,
    pageSize,
    selectedTags,
    orderBy,
    userId,
    userRole,
    searchQuery,
    isLoggedIn,
  ]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError("");
      let url = `${API_BASE_URL}/api/threads/filter/statuses-and-tags?statuses=published&page-number=${currentPage}&page-size=${pageSize}`;

      if (orderBy === "friends" && userId) {
        url += `&order-by=${orderBy}&userId=${userId}`;
      } else {
        url += `&order-by=${orderBy}`;
      }

      if (selectedTags.length > 0) {
        selectedTags.forEach((tagId) => {
          url += `&TagIds=${tagId}`;
        });
      }

      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const response = await fetch(url, {
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
        throw new Error(errorData || "Không thể tải bài viết");
      }

      const data: PaginatedResponse = await response.json();
      setThreads(data.pagedList);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching threads:", error);
      setError(
        error instanceof Error ? error.message : "Không thể tải bài viết"
      );
      setThreads([]);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải bài viết. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      setTagLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
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
        throw new Error(errorData || "Không thể tải danh sách tag");
      }

      const data: Tag[] = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError(
        error instanceof Error ? error.message : "Không thể tải danh sách tag"
      );
      setTags([]);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách tag. Vui lòng thử lại."
      );
    } finally {
      setTagLoading(false);
    }
  };

  const fetchMembershipPrice = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/prices/membership`, {
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
        throw new Error(errorData || "Không thể tải giá thành viên");
      }

      const data: MembershipPrice = await response.json();
      setMembershipPrice(data);
    } catch (error) {
      console.error("Error fetching membership price:", error);
      setError(
        error instanceof Error ? error.message : "Không thể tải giá thành viên"
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải giá thành viên. Vui lòng thử lại."
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleTag = (tagId: number) => {
    setCurrentPage(1);
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  function getContrastColor(hexColor: string) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  const handleMembershipPayment = async () => {
    if (!userId) return;

    setPaymentProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/membership-payment/${userId}`,
        {
          method: "POST",
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
        throw new Error(errorData || "Thanh toán thất bại");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Thanh toán thất bại");
      }

      const userData = localStorage.getItem("authData");
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          userRole: "Member",
          ...(user.userInfo && {
            userInfo: {
              ...user.userInfo,
              userRole: "Member",
            },
          }),
        };

        localStorage.setItem("authData", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authDataUpdated"));

        setUserRole("Member");
        setShowMembershipDialog(false);

        toast.success(
          <div>
            <h3 className="font-bold">Nâng cấp thành công!</h3>
            <p>Bạn đã có thể truy cập toàn bộ cộng đồng</p>
          </div>,
          {
            autoClose: 3000,
            closeButton: true,
          }
        );

        fetchThreads();
      }
    } catch (error) {
      console.error("Error during membership payment:", error);
      setError(error instanceof Error ? error.message : "Thanh toán thất bại");
      toast.error(
        error instanceof Error
          ? error.message
          : "Thanh toán thất bại. Vui lòng thử lại."
      );
      if (
        error instanceof Error &&
        error.message.includes("Insufficient balance")
      ) {
        Swal.fire({
          icon: "error",
          title: "Số dư không đủ",
          text: "Số dư tài khoản của bạn không đủ để thực hiện thanh toán. Vui lòng nạp thêm tiền vào tài khoản.",
          confirmButtonText: "Nạp tiền",
          showCancelButton: true,
          cancelButtonText: "Hủy",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/${locale}/wallet`);
          }
        });
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCloseDialog = () => {
    setShowMembershipDialog(false);
  };

  const cleanAndTruncate = (html: string, maxLength: number = 200) => {
    if (!html) return "";
    const plainText = html.replace(/<[^>]*>/g, "");
    const normalizedText = plainText.replace(/\s+/g, " ").trim();
    if (normalizedText.length <= maxLength) return normalizedText;
    let truncated = normalizedText.substr(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    if (lastSpaceIndex > maxLength * 0.7) {
      truncated = truncated.substr(0, lastSpaceIndex);
    }
    return truncated + "...";
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  if (initialLoading || isLoggedIn === null) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <Typography variant="h4" className="mb-6 text-gray-800 font-bold">
              Vui lòng đăng nhập để tham gia cộng đồng
            </Typography>
            <Typography variant="paragraph" className="mb-8 text-gray-600">
              Bạn cần đăng nhập để tham gia cộng đồng và trải nghiệm tất cả tính
              năng trên StrateZone.
            </Typography>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.push(`/${locale}/login`)}
                color="blue"
                size="lg"
                className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => router.push(`/${locale}/register`)}
                variant="outlined"
                color="blue"
                size="lg"
                className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Navbar />
      <Banner
        title="Tham Gia Cộng Đồng Chơi Cờ"
        subtitle="Kết nối với những người đam mê cờ vua, cải thiện kỹ năng của bạn tại StrateZone!"
      />

      <MembershipUpgradeDialog
        open={showMembershipDialog}
        onClose={handleCloseDialog}
        onUpgrade={handleMembershipPayment}
        membershipPrice={membershipPrice || undefined}
        paymentProcessing={paymentProcessing}
      />

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 container mx-auto"
          role="alert"
        >
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {userRole === "Member" ? (
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full lg:w-3/4 px-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <ButtonGroup
                  variant="text"
                  className="flex md:flex-row flex-col"
                >
                  <Button
                    onClick={() => setOrderBy("created-at-desc")}
                    className={
                      orderBy === "created-at-desc"
                        ? activeButtonClass
                        : inactiveButtonClass
                    }
                  >
                    Mới Nhất
                  </Button>
                  <Button
                    onClick={() => setOrderBy("popularity")}
                    className={
                      orderBy === "popularity"
                        ? activeButtonClass
                        : inactiveButtonClass
                    }
                  >
                    Phổ Biến
                  </Button>
                  <Button
                    onClick={() => setOrderBy("friends")}
                    className={
                      orderBy === "friends"
                        ? activeButtonClass
                        : inactiveButtonClass
                    }
                  >
                    Bài Viết Bạn Bè
                  </Button>
                </ButtonGroup>

                <Button
                  onClick={() =>
                    router.push(`/${locale}/community/create_post`)
                  }
                  variant="filled"
                  className="md:ml-4"
                >
                  Tạo Bài Viết
                </Button>
              </div>

              <div className="w-full h-px max-w-6xl mx-auto my-3 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

              {searchQuery && (
                <Typography variant="small" className="mb-4 text-black">
                  Kết quả tìm kiếm cho: "{searchQuery}"
                </Typography>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : threads.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-lg">Không có bài viết nào.</p>
                </div>
              ) : (
                <>
                  {threads.map((thread) => (
                    <CommunityCard
                      key={thread.threadId}
                      threadId={thread.threadId}
                      theme={thread.threadsTags?.[0]?.tag?.tagName || "Chess"}
                      title={thread.title}
                      thumbnailUrl={thread.thumbnailUrl}
                      description={cleanAndTruncate(thread.content)}
                      dateTime={thread.createdAt}
                      likes={thread.likesCount}
                      commentsCount={thread.commentsCount}
                      threadData={{
                        likes:
                          thread.likes?.map((like) => ({
                            ...like,
                            threadId: thread.threadId,
                          })) || [],
                      }}
                      createdByNavigation={thread.createdByNavigation}
                      tags={thread.threadsTags || []}
                    />
                  ))}

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 mb-8">
                      <DefaultPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="w-full lg:w-1/4 px-4">
              <SearchInput onSearch={handleSearch} />

              <Typography variant="h4" className="my-4 text-black">
                Chọn Chủ Đề
              </Typography>

              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <Typography variant="small" className="mb-2 text-black">
                    Đang lọc theo:
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.tagId === tagId);
                      return tag ? (
                        <Chip
                          key={tag.tagId}
                          value={tag.tagName}
                          onClose={() => toggleTag(tag.tagId)}
                          className="cursor-pointer"
                        />
                      ) : null;
                    })}
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                </div>
              )}

              {tagLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.tagId}
                      onClick={() => toggleTag(tag.tagId)}
                      className="cursor-pointer"
                    >
                      <Chip
                        value={tag.tagName}
                        variant={
                          selectedTags.includes(tag.tagId)
                            ? "filled"
                            : "outlined"
                        }
                        style={{
                          backgroundColor: selectedTags.includes(tag.tagId)
                            ? tag.tagColor
                            : "transparent",
                          color: selectedTags.includes(tag.tagId)
                            ? getContrastColor(tag.tagColor)
                            : tag.tagColor,
                          borderColor: tag.tagColor,
                        }}
                        className="hover:shadow-md transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        !showMembershipDialog && (
          <div className="flex flex-col min-h-[calc(100vh-160px)] flex-grow">
            <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 text-center">
              <div className="max-w-md w-full mx-auto">
                <Typography
                  variant="h4"
                  className="mb-6 text-gray-800 font-bold"
                >
                  Bạn cần nâng cấp tài khoản để truy cập tính năng này
                </Typography>
                <Typography variant="paragraph" className="mb-8 text-gray-600">
                  Nâng cấp lên tài khoản Member để tham gia cộng đồng và trải
                  nghiệm tất cả tính năng
                </Typography>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowMembershipDialog(true)}
                    color="blue"
                    size="lg"
                    className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center min-h-[48px] w-full sm:w-auto"
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <span>Nâng cấp tài khoản</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
      <Footer />
    </div>
  );
}
