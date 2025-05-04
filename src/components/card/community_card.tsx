"use client";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type CommunityCardProps = {
  theme: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  dateTime?: string;
  likes?: number;
  commentsCount?: number;
  threadId?: number;
  threadData?: {
    likes: Array<{
      id: number;
      userId: number | null;
      threadId: number | null;
    }>;
  };
  createdByNavigation?: {
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string;
    bio?: string;
    skillLevel?: number;
    ranking?: number;
    userLabel?: string | number;
  };
  tags?: Array<{
    id: number;
    tag?: {
      tagId: number;
      tagName: string;
      tagColor?: string;
    };
  }>;
};

export default function CommunityCard({
  theme,
  title,
  description,
  dateTime,
  thumbnailUrl,
  likes = 0,
  commentsCount = 0,
  threadId,
  threadData,
  createdByNavigation,
  tags = [],
}: CommunityCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [likeId, setLikeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });

  const isTopContributor =
    createdByNavigation?.userLabel === 1 ||
    createdByNavigation?.userLabel === "top_contributor";

  const authDataString = localStorage.getItem("authData");
  const parsedAuthData = authDataString ? JSON.parse(authDataString) : {};
  const token = parsedAuthData.token;
  useEffect(() => {
    if (authDataString) {
      try {
        const userInfo = parsedAuthData.userInfo || {};
        setCurrentUser({
          userId: userInfo.userId || 0,
          fullName: userInfo.fullName || "",
          avatarUrl: userInfo.avatarUrl || "",
        });
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (threadData?.likes && currentUser.userId) {
      const userLike = threadData.likes.find(
        (like) =>
          like.userId === currentUser.userId && like.threadId === threadId
      );
      setIsLiked(!!userLike);
      setLikeId(userLike?.id || null);
      setLikeCount(likes);
    }
  }, [threadData, currentUser.userId, threadId, likes]);

  const handleLikeThread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser.userId) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      router.push(`/${locale}/login`);
      return;
    }
    if (!threadId || isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked && likeId) {
        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/likes/${likeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          setLikeCount((prev) => prev - 1);
          setIsLiked(false);
          setLikeId(null);
        } else {
          throw new Error("Failed to unlike thread");
        }
      } else {
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
              threadId: threadId,
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setLikeCount((prev) => prev + 1);
          setIsLiked(true);
          setLikeId(data.id);
        } else {
          const errorData = await response.json();
          if (errorData.message.includes("already liked")) {
            setIsLiked(true);
            setLikeId(errorData.likeId || null);
            toast.info("Bạn đã thích bài viết này");
          } else {
            throw new Error(errorData.message || "Failed to like thread");
          }
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (threadId) {
      router.push(`/${locale}/community/${threadId}`);
    }
  };

  function getContrastColor(hexColor: string) {
    if (!hexColor || !hexColor.startsWith("#")) return "#FFFFFF";
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
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
      <Card
        className={`w-full rounded-xl hover:bg-gray-50 my-2 transition-all hover:shadow-sm border-gray-200`}
      >
        <CardBody className="flex p-5 gap-4">
          <div className="w-1/3 min-w-[150px] max-w-[200px]">
            <img
              src={thumbnailUrl || "/default-thumbnail.jpg"}
              alt={title || "Default title"}
              className="w-full h-40 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {tags.map((tagItem) => {
                    const tagColor = tagItem.tag?.tagColor || "#6B7280";
                    const textColor = getContrastColor(tagColor);
                    const isImportantTag = ["thông báo", "quan trọng"].includes(
                      tagItem.tag?.tagName || ""
                    );
                    return (
                      <Button
                        key={tagItem.id}
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-3 transition-all duration-200 hover:opacity-90 ${
                          isImportantTag ? "animate-pulse shadow-md" : ""
                        }`}
                        style={{
                          backgroundColor: tagColor,
                          color: textColor,
                          border: isImportantTag ? "1px solid white" : "none",
                          boxShadow: isImportantTag
                            ? `0 0 8px ${tagColor}`
                            : "none",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tagItem.tag?.tagName}
                        {isImportantTag && <span className="ml-1">⚠️</span>}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    className={`flex items-center gap-1 py-1 px-2 border-2 rounded text-sm ${
                      isLiked ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    // onClick={handleLikeThread}
                    disabled={isLoading}
                  >
                    {isLiked ? (
                      <HeartIconSolid className="h-4 w-4 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={isLiked ? "text-red-500" : "text-gray-600"}
                    >
                      {likeCount}
                    </span>
                  </Button>
                  <Button
                    variant="outlined"
                    className="flex items-center gap-1 py-1 px-2 border-2 border-gray-300 rounded text-sm"
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   handleCardClick();
                    // }}
                  >
                    <ChatBubbleOvalLeftIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{commentsCount}</span>
                  </Button>
                </div>
              </div>
              <Typography
                variant="h5"
                className="text-black font-bold mb-2 cursor-pointer hover:text-light-green-500 transition-all duration-200 ease-in-out"
                onClick={handleCardClick}
              >
                {title}
              </Typography>
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  src={
                    createdByNavigation?.avatarUrl ||
                    "https://docs.material-tailwind.com/img/face-2.jpg"
                  }
                  alt="avatar"
                  size="xs"
                  className={`border ${
                    isTopContributor
                      ? "border-2 border-yellow-500 shadow-lg shadow-yellow-500/30"
                      : "border-gray-300"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <Typography
                    className={`text-sm ${
                      isTopContributor ? "text-yellow-700" : "text-gray-800"
                    }`}
                  >
                    {createdByNavigation?.username || "Tác giả"}
                  </Typography>
                  {isTopContributor && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      TOP CONTRIBUTOR
                    </span>
                  )}
                </div>
                <Typography className="text-gray-800 text-xs">
                  {formatDateTime(dateTime)}
                </Typography>
              </div>
              <Typography className="text-gray-800 text-sm line-clamp-2">
                {description}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
