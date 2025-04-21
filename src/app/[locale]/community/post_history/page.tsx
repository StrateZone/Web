"use client";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface Thread {
  threadId: number;
  createdBy: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  rating: number;
  likesCount: number;
  status: "pending" | "published" | "rejected" | "deleted ";
  createdAt: string;
  updatedAt: string | null;
  comments: Comment[];
  createdByNavigation: {
    userId: number;
    username: string;
    avatarUrl: string;
  };
  threadsTags: {
    id: number;
    tagId: number;
    tag: {
      tagId: number;
      tagName: string;
    };
  }[];
  likes: Array<{
    id: number;
    userId: number | null;
    threadId: number | null;
  }>;
}

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
}

interface ApiResponse {
  pagedList: Thread[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

function BlogHistory() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });
  const router = useRouter();
  const pageSize = 4;

  function getTagColor(tagName: string): string {
    const colorMap: Record<string, string> = {
      "cờ vua": "#000000",
      "cờ tướng": "#8B0000",
      "cờ vây": "#343434",
      "chiến thuật": "#6A0DAD",
      gambit: "#DC143C",
      mẹo: "#DAA520",
      "thảo luận": "#3CB371",
      "trò chuyện": "#87CEFA",
      "ngoài lề": "#A9A9A9",
      "thông báo": "#1E90FF",
      "quan trọng": "#ff2200",
    };
    return colorMap[tagName.toLowerCase()] || "#6B7280";
  }
  function getContrastColor(hexColor: string) {
    if (!hexColor || !hexColor.startsWith("#")) return "#FFFFFF";

    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short", // 'long' cho đầy đủ
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  useEffect(() => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) {
      alert("Please login to view your blog history");
      router.push("/login");
      return;
    }

    try {
      const authData = JSON.parse(authDataString);
      if (authData && authData.userId) {
        setUserId(authData.userId);
        setCurrentUser({
          userId: authData.userId,
          fullName: authData.userInfo?.fullName || "",
          avatarUrl: authData.userInfo?.avatarUrl || "",
        });
      } else {
        throw new Error("Invalid auth data");
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      alert("Invalid authentication data. Please login again.");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch threads");
        }

        const data: ApiResponse = await response.json();
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching threads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Công Khai
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Chờ Xét Duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Đã Từ Chối
          </span>
        );
      case "deleted":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Đã Bị Ẩn Bởi Admin
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Unknown
          </span>
        );
    }
  };

  const handleDelete = async (threadId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/${threadId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setCurrentPage(1);
        } else {
          alert("Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting thread:", error);
      }
    }
  };

  const handleLike = async (
    threadId: number,
    isLiked: boolean,
    likeId?: number
  ) => {
    if (!currentUser.userId) return;

    try {
      if (isLiked && likeId) {
        // Unlike the thread
        await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${likeId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setThreads((prevThreads) =>
          prevThreads.map((thread) => {
            if (thread.threadId === threadId) {
              return {
                ...thread,
                likesCount: thread.likesCount - 1,
                likes: thread.likes.filter((like) => like.id !== likeId),
              };
            }
            return thread;
          })
        );
      } else {
        // Like the thread
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/likes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: currentUser.userId,
              threadId: threadId,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setThreads((prevThreads) =>
            prevThreads.map((thread) => {
              if (thread.threadId === threadId) {
                return {
                  ...thread,
                  likesCount: thread.likesCount + 1,
                  likes: [...thread.likes, data],
                };
              }
              return thread;
            })
          );
        } else {
          throw new Error("Failed to like thread");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading user data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Banner
        title="Lịch Sử Bài Viết"
        subtitle="Xem lại và quản lý các bài viết bạn đã đăng, đang chờ duyệt hoặc bị từ chối"
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Những Bài Viết Của Bạn ({totalCount})
              </h2>
              <p className="text-gray-600">
                Trạng thái của tất cả bài viết bạn đã tạo
              </p>
            </div>

            <div className="space-y-6">
              {threads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    You haven't written any blog posts yet.
                  </p>
                  <Link
                    href="/create-blog"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Write your first blog post
                  </Link>
                </div>
              ) : (
                threads.map((thread) => {
                  const isLiked = thread.likes.some(
                    (like) => like.userId === currentUser.userId
                  );
                  const likeId = thread.likes.find(
                    (like) => like.userId === currentUser.userId
                  )?.id;

                  return (
                    <div
                      key={thread.threadId}
                      className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-b-4 border-gray-200 hover:bg-gray-50 transition-all hover:shadow-sm"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              <Link
                                href={`/blog/${thread.threadId}`}
                                className="hover:text-blue-600"
                              >
                                {thread.title}
                              </Link>
                            </h3>
                            <div className="flex items-center space-x-4 mb-3">
                              {getStatusBadge(thread.status)}
                              <span className="text-sm text-gray-500">
                                Tạo lúc: {formatDate(thread.createdAt)}
                              </span>
                              {thread.updatedAt && (
                                <span className="text-sm text-gray-500">
                                  Lần Cuối Cập Nhật:{" "}
                                  {formatDate(thread.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(thread.threadId, isLiked, likeId);
                              }}
                              className={`flex items-center gap-1 py-1 px-2 border-2 rounded text-sm ${
                                isLiked
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                            >
                              {isLiked ? (
                                <HeartIconSolid className="h-4 w-4 text-red-500" />
                              ) : (
                                <HeartIcon className="h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={
                                  isLiked ? "text-red-500" : "text-gray-600"
                                }
                              >
                                {thread.likesCount}
                              </span>
                            </button>
                            <button className="flex items-center gap-1 py-1 px-2 border-2 border-gray-300 rounded text-sm">
                              <ChatBubbleOvalLeftIcon className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-600">
                                {thread.comments.length}
                              </span>
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {thread.content}
                        </p>

                        {thread.threadsTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {thread.threadsTags.map((tag) => {
                              const tagColor = getTagColor(tag.tag.tagName);
                              const textColor = getContrastColor(tagColor);
                              const isImportantTag = [
                                "thông báo",
                                "quan trọng",
                              ].includes(tag.tag.tagName);

                              return (
                                <span
                                  key={tag.id}
                                  className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-3 transition-all duration-200 ${
                                    isImportantTag
                                      ? "hover:scale-105"
                                      : "hover:opacity-90"
                                  }`}
                                  style={{
                                    backgroundColor: tagColor,
                                    color: textColor,
                                    transform: isImportantTag
                                      ? "scale(1.02)"
                                      : "none",
                                    border: isImportantTag
                                      ? "1px solid white"
                                      : "none",
                                    boxShadow: isImportantTag
                                      ? `0 0 5px ${tagColor}`
                                      : "none",
                                  }}
                                >
                                  {isImportantTag && (
                                    <span className="mr-1">
                                      {tag.tag.tagName === "quan trọng"
                                        ? "⚠️"
                                        : "📢"}
                                    </span>
                                  )}
                                  {tag.tag.tagName}
                                  {isImportantTag &&
                                    tag.tag.tagName === "quan trọng" && (
                                      <span className="ml-1">⚠️</span>
                                    )}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="relative w-8 h-8 mr-2">
                              <Image
                                src={
                                  thread.createdByNavigation.avatarUrl ||
                                  "/default-avatar.png"
                                }
                                alt={thread.createdByNavigation.username}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {thread.createdByNavigation.username}
                            </span>
                          </div>
                          <div className="space-x-2">
                            {/* <Link
                              href={`/blog/${thread.threadId}/edit`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </Link> */}
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                                Chỉnh sửa
                              </button>
                              <button className="px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors">
                                Xem
                              </button>
                              <button className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                                Xóa
                              </button>
                              <button className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                                Ẩn
                              </button>
                              <button className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                                Xem
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

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

      <Footer />
    </div>
  );
}

export default BlogHistory;
