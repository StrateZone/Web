"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button, Input } from "@material-tailwind/react";
import { toast } from "react-toastify";

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
    };
  }[];
  likesCount: number;
  isLiked: boolean;
  likeId: number | null;
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
    fullName: string;
    avatarUrl: string;
  } | null;
  replyToNavigation: {
    user: {
      fullName: string;
    };
  } | null;
  inverseReplyToNavigation: Comment[];
  likesCount: number;
  isLiked: boolean;
  likeId: number | null;
}

interface PageProps {
  params: {
    id: string;
    locale?: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

function PostDetailPage({ params }: PageProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const authDataString = localStorage.getItem("authData");
  const parsedAuthData = JSON.parse(authDataString || "{}");
  const userInfo = parsedAuthData.userInfo || {};
  const userId = userInfo.userId;
  const fullName = userInfo.fullName;
  const avatarUrl = userInfo.avatarUrl || "";

  const [currentUser] = useState({
    userId: userId,
    fullName: fullName,
    avatarUrl: avatarUrl,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch thread data
        const threadResponse = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/${params.id}`
        );
        const threadData = await threadResponse.json();
        setThread(threadData);

        // Fetch comments
        const commentsResponse = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/comments/thread/${params.id}`
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const response = await fetch(
        "https://backend-production-ac5e.up.railway.app/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threadId: parseInt(params.id),
            userId: currentUser.userId,
            content: commentContent,
            replyTo: replyingTo,
          }),
        }
      );

      if (response.ok) {
        const newComment = await response.json();

        // Add like status to the new comment
        const commentWithLike = {
          ...newComment,
          user: currentUser,
          inverseReplyToNavigation: [],
          likesCount: 0,
          isLiked: false,
          likeId: null,
        };

        if (newComment.replyTo) {
          setComments((prevComments) =>
            prevComments.map((comment) => {
              if (comment.commentId === newComment.replyTo) {
                return {
                  ...comment,
                  inverseReplyToNavigation: [
                    ...comment.inverseReplyToNavigation,
                    commentWithLike,
                  ],
                };
              }
              // Handle nested replies
              const updatedInverseReplies =
                comment.inverseReplyToNavigation.map((reply) => {
                  if (reply.commentId === newComment.replyTo) {
                    return {
                      ...reply,
                      inverseReplyToNavigation: [
                        ...reply.inverseReplyToNavigation,
                        commentWithLike,
                      ],
                    };
                  }
                  return reply;
                });

              if (updatedInverseReplies !== comment.inverseReplyToNavigation) {
                return {
                  ...comment,
                  inverseReplyToNavigation: updatedInverseReplies,
                };
              }
              return comment;
            })
          );
        } else {
          setComments((prevComments) => [commentWithLike, ...prevComments]);
        }

        setCommentContent("");
        setReplyingTo(null);
        toast.success("Bình luận đã được đăng");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Có lỗi xảy ra khi đăng bình luận");
    }
  };

  const handleLikeThread = async () => {
    if (!thread) return;

    try {
      if (thread.isLiked && thread.likeId) {
        // Unlike
        await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${thread.likeId}`,
          {
            method: "DELETE",
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
            },
            body: JSON.stringify({
              threadId: thread.threadId,
            }),
          }
        );
        const data = await response.json();
        setThread({
          ...thread,
          likesCount: thread.likesCount + 1,
          isLiked: true,
          likeId: data.likeId,
        });
      }
    } catch (error) {
      console.error("Error toggling thread like:", error);
    }
  };

  const handleLikeComment = async (
    commentId: number,
    currentLikeStatus: boolean,
    currentLikeId: number | null
  ) => {
    try {
      if (currentLikeStatus && currentLikeId) {
        // Unlike
        await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${currentLikeId}`,
          {
            method: "DELETE",
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
            },
            body: JSON.stringify({
              commentId: commentId,
            }),
          }
        );
        const data = await response.json();

        // Update state
        setComments((prevComments) =>
          updateCommentLikes(prevComments, commentId, true, data.likeId, 1)
        );
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
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
        className={`mt-4 ${depth > 0 ? "ml-8" : ""}`}
      >
        <div className="flex gap-3">
          <img
            src={comment.user?.avatarUrl || "/default-avatar.png"}
            alt={comment.user?.fullName || "Anonymous"}
            className="rounded-full w-10 h-10 object-cover"
          />
          <div className="bg-gray-100 p-3 rounded w-full">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {comment.user?.fullName || "Anonymous"}
              </p>
              {comment.replyToNavigation && (
                <span className="text-sm text-gray-500">
                  → {comment.replyToNavigation.user?.fullName}
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
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={comment.isLiked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-4 w-4 ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                <span
                  className={comment.isLiked ? "text-red-500" : "text-gray-500"}
                >
                  {comment.likesCount}
                </span>
              </button>
            </div>

            {/* Reply form when this comment is selected for reply */}
            {replyingTo === comment.commentId && (
              <form onSubmit={handleSubmitComment} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết trả lời..."
                  className="border p-2 rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  Gửi
                </button>
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

        {/* Render replies */}
        {comment.inverseReplyToNavigation.length > 0 && (
          <div className="border-l-2 border-gray-200 pl-2">
            {renderComments(comment.inverseReplyToNavigation, depth + 1)}
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
          <p>Loading...</p>
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

  const tags = thread.threadsTags.map((tt) => tt.tag.tagName).join(" | ");

  return (
    <div className="min-h-screen flex flex-col text-black">
      <Navbar />
      <Banner
        title={thread.title}
        subtitle={`${thread.createdByNavigation.fullName} | ${tags} | ${formattedDate}`}
      />

      <main className="flex-1 max-w-6xl mx-auto p-4 space-y-6">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500">Home / {thread.title}</p>

        {/* Post Title and Like Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{thread.title}</h1>
          <button
            onClick={handleLikeThread}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={thread.isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`h-5 w-5 ${thread.isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <span className={thread.isLiked ? "text-red-500" : "text-gray-500"}>
              {thread.likesCount}
            </span>
          </button>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Image
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10 flex-shrink-0"
            src={thread.createdByNavigation.avatarUrl}
            alt={thread.createdByNavigation.fullName}
          />
          <span>{thread.createdByNavigation.fullName}</span>
          <span>•</span>
          <span>{tags}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        {thread.thumbnailUrl && (
          <div className="w-full overflow-hidden">
            <img
              src={thread.thumbnailUrl}
              alt={thread.title}
              className="w-8/12 h-96 object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-thumbnail.jpg";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div
          className="space-y-4 text-gray-700 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />

        {/* Comments Section */}
        <section className="border-t pt-6">
          <h2 className="text-xl font-semibold">Bình Luận ({totalComments})</h2>

          {/* Main comment form */}
          <form
            onSubmit={handleSubmitComment}
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
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Viết bình luận của bạn..."
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

        {/* Related Posts */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Bài Viết Liên Quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* You would fetch related posts here */}
            <div className="space-y-2">
              <div className="bg-gray-300 w-full h-40 rounded-xl" />
              <h3 className="text-lg font-bold">Tiêu Đề</h3>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PostDetailPage;
