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
  tagColor: string; // Thêm dòng này
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
  const router = useRouter();
  const { locale } = useParams();
  const [orderBy, setOrderBy] = useState<
    "created-at-desc" | "popularity" | "friends"
  >("created-at-desc");
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [membershipPrice, setMembershipPrice] =
    useState<MembershipPrice | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Added for initial loading state

  const activeButtonClass = "bg-blue-100 font-semibold text-blue-800";
  const inactiveButtonClass = "text-gray-700 hover:bg-gray-100";

  useEffect(() => {
    const checkUserMembership = () => {
      const userData = localStorage.getItem("authData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.userId);
        setUserRole(user.userRole);

        if (user.userRole === "RegisteredUser") {
          fetchMembershipPrice();
          setShowMembershipDialog(true);
        }
      }
      setInitialLoading(false); // Set initial loading to false after checking
    };

    checkUserMembership();
  }, []);

  useEffect(() => {
    if (userRole === "Member") {
      fetchThreads();
      fetchTags();
    }
  }, [currentPage, pageSize, selectedTags, orderBy, userId, userRole]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      let url = `https://backend-production-ac5e.up.railway.app/api/threads/filter/statuses-and-tags?statuses=published&page-number=${currentPage}&page-size=${pageSize}`;

      if (orderBy === "friends" && userId) {
        url += `&order-by=${orderBy}&userId=${userId}`;
      } else {
        url += `&order-by=${orderBy}`;
      }

      if (selectedTags.length > 0) {
        url += `&TagIds=${selectedTags.join(",")}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch threads");
      const data: PaginatedResponse = await response.json();

      const processedThreads = data.pagedList.map((thread) => ({
        ...thread,
        commentsCount: thread.comments?.length || 0,
      }));

      setThreads(processedThreads);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching threads:", error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      setTagLoading(true);
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/tags"
      );
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data: Tag[] = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTags([]);
    } finally {
      setTagLoading(false);
    }
  };

  const fetchMembershipPrice = async () => {
    try {
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/prices/membership"
      );
      if (!response.ok) throw new Error("Failed to fetch membership price");
      const data: MembershipPrice = await response.json();
      setMembershipPrice(data);
    } catch (error) {
      console.error("Error fetching membership price:", error);
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
    // Chuyển hex sang RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Tính độ sáng (luminance)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Trả về màu trắng hoặc đen tùy độ sáng nền
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }
  const handleMembershipPayment = async () => {
    if (!userId) return;

    setPaymentProcessing(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/payments/membership-payment/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Payment failed");
      }

      if (result.success) {
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
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      if (error.message && error.message.includes("Balance is not enough")) {
        try {
          const shouldNavigate = await InsufficientBalancePopup({
            finalPrice: membershipPrice?.price1,
          });

          if (shouldNavigate) {
            router.push(`/${locale}/wallet`);
          }
        } catch (swalError) {
          console.error("Popup error:", swalError);
        }
      } else {
        Swal.fire({
          title: "Lỗi",
          text: error.message || "Đã xảy ra lỗi khi thanh toán",
          icon: "error",
          confirmButtonText: "Đóng",
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

  // Show loading state while checking user role
  if (initialLoading) {
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

  return (
    <div>
      <div>
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
          subtitle="Kết nối với những người đam mê cờ vua, tham gia các giải đấu và cải thiện kỹ năng của bạn tại StrateZone!"
        />

        <MembershipUpgradeDialog
          open={showMembershipDialog}
          onClose={handleCloseDialog}
          onUpgrade={handleMembershipPayment}
          membershipPrice={membershipPrice || undefined}
          paymentProcessing={paymentProcessing}
        />

        {userRole === "Member" ? (
          <main className="container mx-auto px-4 py-8">
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
                <SearchInput />

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
            <div className="flex flex-col min-h-[calc(100vh-160px)]">
              <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 text-center">
                <div className="max-w-md mx-auto">
                  <Typography
                    variant="h4"
                    className="mb-6 text-gray-800 font-bold"
                  >
                    Bạn cần nâng cấp tài khoản để truy cập tính năng này
                  </Typography>
                  <Typography
                    variant="paragraph"
                    className="mb-8 text-gray-600"
                  >
                    Nâng cấp lên tài khoản Member để tham gia cộng đồng và trải
                    nghiệm tất cả tính năng
                  </Typography>
                  <Button
                    onClick={() => setShowMembershipDialog(true)}
                    color="blue"
                    size="lg"
                    className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Nâng cấp tài khoản
                  </Button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}
