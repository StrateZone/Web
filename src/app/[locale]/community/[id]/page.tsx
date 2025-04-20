"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button, Input, Typography, Chip } from "@material-tailwind/react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

interface Thread {
  threadId: number;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
  createdByNavigation: {
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  threadsTags: {
    tag: {
      tagName: string;
      tagColor?: string; // thêm dòng này
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

interface RelatedThread {
  threadId: number;
  title: string;
  thumbnailUrl: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  createdByNavigation: {
    userId: number;
    fullName: string;
    username: string;
    avatarUrl: string;
  };
  threadsTags: {
    tag: {
      tagName: string;
      tagColor?: string; // Thêm dòng này
    };
  }[];
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
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingCommentLike, setIsLoadingCommentLike] = useState(false);
  const [relatedThreads, setRelatedThreads] = useState<RelatedThread[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, []);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch thread data
        const threadResponse = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/${id}`
        );
        const threadData = await threadResponse.json();

        // Check if current user has liked this thread
        const userLike = threadData.likes?.find(
          (like: any) => like.userId === currentUser.userId
        );

        setThread({
          ...threadData,
          isLiked: !!userLike,
          likeId: userLike?.id || null,
        });

        // Fetch comments
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

        // Fetch related threads (newest threads)
        const relatedResponse = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/filter/statuses-and-tags?statuses=published&page-number=1&page-size=6&order-by=created-at-desc`
        );
        const relatedData = await relatedResponse.json();

        // Filter out current thread and set state
        const filteredRelatedThreads = relatedData.pagedList.filter(
          (relatedThread: RelatedThread) =>
            relatedThread.threadId !== parseInt(id)
        );

        setRelatedThreads(filteredRelatedThreads || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser.userId]);

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
      <div
        key={comment.commentId}
        className={`mt-4`} // Removed the ml-8 for nested comments
      >
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

                <Button
                  type="submit"
                  className=" text-white px-3 py-1 rounded "
                >
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

        {/* Render replies without indentation */}
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Thread not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(thread.createdAt), {
    addSuffix: true,
    locale: vi,
  });

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

  return (
    <div className="min-h-screen flex flex-col text-black">
      <Navbar />
      <Banner title={""} subtitle={""} />

      <main className="flex-1 max-w-7xl mx-auto p-4 space-y-6">
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
          {/* Main content (left side) */}
          <div className="w-full lg:w-3/4 px-4">
            {/* Post Title and Like Button */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                {thread.title}
              </h1>
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
                  className={thread.isLiked ? "text-red-500" : "text-gray-500"}
                >
                  {thread.likesCount}
                </span>
              </button>
            </div>

            {/* Author Info */}
            <div className="flex flex-col text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Image
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                  src={thread.createdByNavigation.avatarUrl}
                  alt={thread.createdByNavigation.fullName}
                />
                <span>{thread.createdByNavigation.username}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-1 mb-4">
                {thread.threadsTags.map((tagItem) => {
                  const tagColor = tagItem.tag?.tagColor || "#6B7280"; // Màu mặc định
                  const textColor = getContrastColor(tagColor);
                  const isImportantTag = ["thông báo", "quan trọng"].includes(
                    tagItem.tag?.tagName || ""
                  );

                  return (
                    <Button
                      key={tagItem.tag.tagName}
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-3 transition-all duration-200 ${
                        isImportantTag ? "hover:scale-105" : "hover:opacity-90"
                      }`}
                      style={{
                        backgroundColor: tagColor,
                        color: textColor,
                        transform: isImportantTag ? "scale(1.02)" : "none",
                        border: isImportantTag ? "1px solid white" : "none",
                        boxShadow: isImportantTag
                          ? `0 0 5px ${tagColor}`
                          : "none",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isImportantTag && (
                        <span className="mr-1">
                          {tagItem.tag.tagName === "quan trọng" ? "⚠️" : "📢"}
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
                  onChange={(e) => setMainCommentContent(e.target.value)}
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
                  <p className="text-gray-500 mt-4">Chưa có bình luận nào</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar (right side) */}
          <div className="w-full lg:w-1/4 px-6 ">
            {" "}
            {/* hoặc bất kỳ giá trị nào bạn muốn */}
            <Typography variant="h5" className="mb-4 text-black">
              Bài Viết Mới Nhất
            </Typography>
            <div className="space-y-4">
              {relatedThreads.map((thread) => {
                const threadDate = formatDistanceToNow(
                  new Date(thread.createdAt),
                  {
                    addSuffix: true,
                    locale: vi,
                  }
                );

                return (
                  <div
                    key={thread.threadId}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex h-32 w-full"
                    onClick={() =>
                      router.push(`/${locale}/community/${thread.threadId}`)
                    }
                  >
                    {thread.thumbnailUrl && (
                      <div className="w-1/3 h-20">
                        {" "}
                        {/* Điều chỉnh kích thước */}
                        <img
                          src={thread.thumbnailUrl}
                          alt={thread.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/default-thumbnail.jpg";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1">
                      {" "}
                      {/* Thêm flex-1 để chiếm phần còn lại */}
                      <h6 className="font-semibold text-sm line-clamp-2">
                        {thread.title}
                      </h6>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={thread.createdByNavigation.avatarUrl}
                            alt={thread.createdByNavigation.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-gray-500">
                            {thread.createdByNavigation.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <HeartIcon className="h-4 w-4" />
                            <span>{thread.likesCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                            <span>{thread.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{threadDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PostDetailPage;
