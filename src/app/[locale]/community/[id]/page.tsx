"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button, Input, Typography } from "@material-tailwind/react";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { InsufficientBalancePopup } from "../../chess_appointment/chess_appointment_order/InsufficientBalancePopup";
import { MembershipUpgradeDialog } from "../MembershipUpgradeDialog ";

interface Thread {
  threadId: number;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
  createdBy: number;
  status: "pending" | "published" | "rejected" | "deleted";
  createdByNavigation: {
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  threadsTags: {
    tag: {
      tagName: string;
      tagColor?: string;
    };
  }[];
  likesCount: number;
  isLiked: boolean;
  likeId: number | null;
  likes: Array<{
    id: number;
    userId: number;
    threadId: number;
  }>;
}

interface Comment {
  commentId: number;
  replyTo: number | null;
  threadId: number;
  userId: number;
  content: string;
  createdAt: string;
  user: {
    userLabel: number;
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  } | null;
  replyToNavigation: {
    user: {
      username: string;
      fullName: string;
    };
  } | null;
  inverseReplyToNavigation: Comment[];
  likesCount: number;
  isLiked: boolean;
  likeId: number | null;
}

interface MembershipPrice {
  id: number;
  price1: number;
  unit: string;
}

function getContrastColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith("#")) return "#FFFFFF";

  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { locale } = useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingCommentLike, setIsLoadingCommentLike] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [membershipPrice, setMembershipPrice] =
    useState<MembershipPrice | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Get user data from localStorage
  const authDataString =
    typeof window !== "undefined" ? localStorage.getItem("authData") : null;
  const parsedAuthData = authDataString ? JSON.parse(authDataString) : {};
  const userInfo = parsedAuthData.userInfo || {};
  const token = parsedAuthData.token;

  const [currentUser] = useState({
    userId: userInfo.userId,
    username: userInfo.username,
    fullName: userInfo.fullName,
    avatarUrl: userInfo.avatarUrl || "",
  });

  const [mainCommentContent, setMainCommentContent] = useState("");
  const [replyCommentContent, setReplyCommentContent] = useState("");

  // Xác định Top Contributor
  const isTopContributor = thread?.createdByNavigation?.userLabel === 1;

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
      } else {
        toast.error("Vui lòng đăng nhập để xem chi tiết bài viết");
        router.push(`/${locale}/login`);
      }
      setInitialLoading(false);
    };

    checkUserMembership();
  }, [router, locale]);

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
              <p>Bạn đã có thể truy cập toàn bộ nội dung</p>
            </div>,
            {
              autoClose: 3000,
              closeButton: true,
            }
          );

          // Reload thread data
          fetchData();
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

  const fetchData = async () => {
    try {
      // Fetch thread data
      const threadResponse = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/threads/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!threadResponse.ok) {
        throw new Error(`HTTP error! status: ${threadResponse.status}`);
      }
      const threadData = await threadResponse.json();

      // Kiểm tra quyền truy cập
      if (
        threadData.status !== "published" &&
        threadData.createdBy !== userId
      ) {
        setHasPermission(false);
        toast.error("Bạn không có quyền xem bài viết này");
        router.push(`/${locale}/community`);
        return;
      }

      // Check if current user has liked this thread
      const userLike = threadData.likes?.find(
        (like: any) => like.userId === currentUser.userId
      );

      setThread({
        ...threadData,
        isLiked: !!userLike,
        likeId: userLike?.id || null,
      });
      setHasPermission(true);

      // Fetch comments (only for published threads)
      if (threadData.status === "published") {
        const commentsResponse = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/comments/thread/${id}`
        );
        let commentsData = await commentsResponse.json();

        // Structure comments with replies
        const commentsMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        commentsData.forEach((comment: any) => {
          const formattedComment: Comment = {
            ...comment,
            user: comment.user || null,
            inverseReplyToNavigation: [],
            isLiked:
              comment.likes?.some(
                (like: any) => like.userId === currentUser.userId
              ) || false,
            likeId:
              comment.likes?.find(
                (like: any) => like.userId === currentUser.userId
              )?.id || null,
            likesCount: comment.likes?.length || 0,
          };

          commentsMap.set(comment.commentId, formattedComment);

          if (comment.replyTo) {
            const parent = commentsMap.get(comment.replyTo);
            if (parent) {
              parent.inverseReplyToNavigation.push(formattedComment);
            }
          } else {
            rootComments.push(formattedComment);
          }
        });

        setComments(rootComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasPermission(false);
      toast.error("Không thể tải bài viết hoặc bạn không có quyền xem.");
      router.push(`/${locale}/community`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "Member" && id) {
      fetchData();
    }
  }, [id, currentUser.userId, userRole]);

  const handleSubmitMainComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainCommentContent.trim()) return;

    try {
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            threadId: parseInt(id),
            userId: currentUser.userId,
            content: mainCommentContent,
            replyTo: null,
          }),
        }
      );

      if (response.ok) {
        const newComment = await response.json();

        const commentWithLike = {
          ...newComment,
          user: currentUser,
          inverseReplyToNavigation: [],
          likesCount: 0,
          isLiked: false,
          likeId: null,
        };

        setComments((prevComments) => [commentWithLike, ...prevComments]);
        setMainCommentContent("");
        toast.success("Bình luận đã được đăng");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Có lỗi xảy ra khi đăng bình luận");
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyCommentContent.trim() || !replyingTo) return;

    try {
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            threadId: parseInt(id),
            userId: currentUser.userId,
            content: replyCommentContent,
            replyTo: replyingTo,
          }),
        }
      );

      if (response.ok) {
        const newComment = await response.json();

        const commentWithLike = {
          ...newComment,
          user: currentUser,
          inverseReplyToNavigation: [],
          likesCount: 0,
          isLiked: false,
          likeId: null,
        };

        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.commentId === replyingTo) {
              return {
                ...comment,
                inverseReplyToNavigation: [
                  ...comment.inverseReplyToNavigation,
                  commentWithLike,
                ],
              };
            }
            const updatedInverseReplies = comment.inverseReplyToNavigation.map(
              (reply) => {
                if (reply.commentId === replyingTo) {
                  return {
                    ...reply,
                    inverseReplyToNavigation: [
                      ...reply.inverseReplyToNavigation,
                      commentWithLike,
                    ],
                  };
                }
                return reply;
              }
            );

            if (updatedInverseReplies !== comment.inverseReplyToNavigation) {
              return {
                ...comment,
                inverseReplyToNavigation: updatedInverseReplies,
              };
            }
            return comment;
          })
        );

        setReplyCommentContent("");
        setReplyingTo(null);
        toast.success("Bình luận đã được đăng");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Có lỗi xảy ra khi đăng bình luận");
    }
  };

  const handleLikeThread = async () => {
    if (!thread || isLoadingLike || !currentUser.userId) return;
    setIsLoadingLike(true);

    try {
      if (thread.isLiked && thread.likeId) {
        // Unlike
        await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${thread.likeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setThread({
          ...thread,
          likesCount: thread.likesCount - 1,
          isLiked: false,
          likeId: null,
        });
      } else {
        // Like
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/likes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: currentUser.userId,
              threadId: thread.threadId,
            }),
          }
        );
        const data = await response.json();
        setThread({
          ...thread,
          likesCount: thread.likesCount + 1,
          isLiked: true,
          likeId: data.id,
        });
      }
    } catch (error) {
      console.error("Error toggling thread like:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleLikeComment = async (
    commentId: number,
    currentLikeStatus: boolean,
    currentLikeId: number | null
  ) => {
    if (isLoadingCommentLike) return;
    setIsLoadingCommentLike(true);

    try {
      if (currentLikeStatus && currentLikeId) {
        // Unlike
        await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${currentLikeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update state
        setComments((prevComments) =>
          updateCommentLikes(prevComments, commentId, false, null, -1)
        );
      } else {
        // Like
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/likes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: currentUser.userId,
              commentId: commentId,
            }),
          }
        );
        const data = await response.json();

        // Update state
        setComments((prevComments) =>
          updateCommentLikes(prevComments, commentId, true, data.id, 1)
        );
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    } finally {
      setIsLoadingCommentLike(false);
    }
  };

  const updateCommentLikes = (
    comments: Comment[],
    commentId: number,
    isLiked: boolean,
    likeId: number | null,
    countChange: number
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.commentId === commentId) {
        return {
          ...comment,
          isLiked,
          likeId,
          likesCount: comment.likesCount + countChange,
        };
      }

      // Check replies
      if (comment.inverseReplyToNavigation.length > 0) {
        return {
          ...comment,
          inverseReplyToNavigation: updateCommentLikes(
            comment.inverseReplyToNavigation,
            commentId,
            isLiked,
            likeId,
            countChange
          ),
        };
      }

      return comment;
    });
  };

  const renderComments = (commentList: Comment[], depth = 0) => {
    return commentList.map((comment) => (
      <div key={comment.commentId} className={`mt-4`}>
        <div className="flex gap-3">
          <img
            src={
              comment.user?.avatarUrl ||
              "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
            }
            alt={comment.user?.fullName || "Anonymous"}
            className="rounded-full w-10 h-10 object-cover"
          />
          <div className="bg-gray-100 p-3 rounded w-full">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {comment.user?.username || "Anonymous"}
              </p>
              {comment.replyToNavigation && (
                <span className="text-sm text-gray-500">
                  → @{comment.replyToNavigation.user?.username}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </p>
            <p className="mt-1 text-gray-700">{comment.content}</p>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() =>
                  setReplyingTo(
                    comment.commentId === replyingTo ? null : comment.commentId
                  )
                }
                className="text-blue-500 text-sm hover:underline"
              >
                Trả lời
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeComment(
                    comment.commentId,
                    comment.isLiked,
                    comment.likeId
                  );
                }}
                className="flex items-center gap-1 text-sm"
                disabled={isLoadingCommentLike}
              >
                {comment.isLiked ? (
                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-500" />
                )}
                <span
                  className={comment.isLiked ? "text-red-500" : "text-gray-500"}
                >
                  {comment.likesCount}
                </span>
              </button>
            </div>

            {replyingTo === comment.commentId && (
              <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyCommentContent}
                  onChange={(e) => setReplyCommentContent(e.target.value)}
                  placeholder={`Trả lời ${comment.user?.username || "người dùng"}...`}
                  className="border p-2 rounded flex-1"
                />

                <Button type="submit" className="text-white px-3 py-1 rounded">
                  Gửi
                </Button>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-500 px-3 py-1 rounded hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
              </form>
            )}
          </div>
        </div>

        {comment.inverseReplyToNavigation.length > 0 && (
          <div className="pl-4">
            {renderComments(comment.inverseReplyToNavigation)}
          </div>
        )}
      </div>
    ));
  };

  const totalComments = comments.reduce(
    (total, comment) => total + 1 + comment.inverseReplyToNavigation.length,
    0
  );

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
    <div className="min-h-screen flex flex-col text-black">
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
      <Banner title={""} subtitle={""} />

      <MembershipUpgradeDialog
        open={showMembershipDialog}
        onClose={handleCloseDialog}
        onUpgrade={handleMembershipPayment}
        membershipPrice={membershipPrice || undefined}
        paymentProcessing={paymentProcessing}
      />

      {userRole === "Member" ? (
        <main className="flex-1 max-w-7xl mx-auto p-4 space-y-6">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p>Đang tải...</p>
            </div>
          ) : hasPermission === false ? (
            <div className="text-center py-12">
              <Typography variant="h6" color="red" className="mb-4">
                Bạn không có quyền xem bài viết này.
              </Typography>
              <Button
                color="blue"
                variant="gradient"
                onClick={() => router.push(`/${locale}/community`)}
              >
                Quay lại cộng đồng
              </Button>
            </div>
          ) : !thread ? (
            <div className="flex-1 flex items-center justify-center">
              <p>Bài viết không tồn tại</p>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <p className="text-sm text-blue-500">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push(`/${locale}/community`)}
                >
                  Home
                </span>{" "}
                / {thread.title}
              </p>

              <div className="flex flex-wrap -mx-4">
                {/* Main content */}
                <div className="w-full px-4">
                  {/* Post Title and Like Button */}
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {thread.title}
                    </h1>
                    {thread.status === "published" && (
                      <button
                        onClick={handleLikeThread}
                        disabled={isLoadingLike}
                        className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        {thread.isLiked ? (
                          <HeartIconSolid className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-500" />
                        )}
                        <span
                          className={
                            thread.isLiked ? "text-red-500" : "text-gray-500"
                          }
                        >
                          {thread.likesCount}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="flex flex-col text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Image
                        width={40}
                        height={40}
                        className={`rounded-full object-cover w-10 h-10 flex-shrink-0 ${
                          isTopContributor
                            ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/30"
                            : ""
                        }`}
                        src={thread.createdByNavigation.avatarUrl}
                        alt={thread.createdByNavigation.fullName}
                      />
                      <span
                        className={
                          isTopContributor ? "text-yellow-700" : "text-gray-600"
                        }
                      >
                        {thread.createdByNavigation.username}
                      </span>
                      {isTopContributor && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          TOP CONTRIBUTOR
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(thread.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                      <span>•</span>
                      <span>{getStatusBadge(thread.status)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1 mb-4">
                      {thread.threadsTags.map((tagItem) => {
                        const tagColor = tagItem.tag?.tagColor || "#6B7280";
                        const textColor = getContrastColor(tagColor);
                        const isImportantTag = [
                          "thông báo",
                          "quan trọng",
                        ].includes(tagItem.tag?.tagName || "");

                        return (
                          <Button
                            key={tagItem.tag.tagName}
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isImportantTag && (
                              <span className="mr-1">
                                {tagItem.tag.tagName === "quan trọng"
                                  ? "⚠️"
                                  : "📢"}
                              </span>
                            )}
                            {tagItem.tag.tagName}
                            {isImportantTag &&
                              tagItem.tag.tagName === "quan trọng" && (
                                <span className="ml-1">⚠️</span>
                              )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {thread.thumbnailUrl && (
                    <div className="w-full overflow-hidden">
                      <img
                        src={thread.thumbnailUrl}
                        alt={thread.title}
                        className="w-8/12 h-96 object-cover mb-4"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-thumbnail.jpg";
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="space-y-4 text-gray-700 whitespace-pre-line mb-4"
                    dangerouslySetInnerHTML={{ __html: thread.content }}
                  />

                  {/* Comments Section */}
                  {thread.status === "published" && (
                    <section className="border-t pt-6">
                      <h2 className="text-xl font-semibold">
                        Bình Luận ({totalComments})
                      </h2>

                      {/* Main comment form */}
                      <form
                        onSubmit={handleSubmitMainComment}
                        className="flex items-center gap-2 mt-4"
                      >
                        <Image
                          width={40}
                          height={40}
                          src={currentUser.avatarUrl}
                          alt={currentUser.fullName}
                          className="rounded-full w-10 h-10 object-cover"
                        />

                        <Input
                          type="text"
                          value={mainCommentContent}
                          onChange={(e) =>
                            setMainCommentContent(e.target.value)
                          }
                          placeholder="Viết bình luận của bạn..."
                          crossOrigin="anonymous"
                        />

                        <Button className="py-1" type="submit">
                          Bình luận
                        </Button>
                      </form>

                      {/* Comments List */}
                      <div className="mt-6">
                        {comments.length > 0 ? (
                          renderComments(comments)
                        ) : (
                          <p className="text-gray-500 mt-4">
                            Chưa có bình luận nào
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </>
          )}
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
                <Typography variant="paragraph" className="mb-8 text-gray-600">
                  Nâng cấp lên tài khoản Member để xem chi tiết bài viết và tham
                  gia thảo luận
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
      <Footer />
    </div>
  );
}

const buttonColors: { [key: string]: string } = {
  "cờ vua": "bg-gray-900 text-white",
  "cờ tướng": "bg-red-700 text-white",
  "cờ vây": "bg-yellow-600 text-black",
  "chiến thuật": "bg-blue-600 text-white",
  gambit: "bg-indigo-600 text-white",
  mẹo: "bg-purple-500 text-white",
  "thảo luận": "bg-green-600 text-white",
  "trò chuyện": "bg-teal-500 text-white",
  "ngoài lề": "bg-pink-500 text-white",
  "thông báo": "bg-orange-500 text-white",
  "quan trọng": "bg-red-600 text-white",
  default: "bg-gray-500 text-white",
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

export default PostDetailPage;
