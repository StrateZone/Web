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

export type CommunityCardProps = {
  theme: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  dateTime?: string;
  likes?: number;
  commentsCount?: number; // Thêm prop commentsCount
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
  };
  tags?: Array<{
    id: number;
    tag?: {
      tagId: number;
      tagName: string;
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
  commentsCount = 0, // Giá trị mặc định là 0
  threadId,
  threadData,
  createdByNavigation,
  tags = [],
}: CommunityCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [userId, setUserId] = useState<number | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [likeId, setLikeId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });
  useEffect(() => {
    const fetchUserId = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
      }
    };

    fetchUserId();
  }, []);
  const buttonColors: { [key: string]: string } = {
    // Các loại cờ
    "cờ vua": "bg-gray-900 text-white",
    "cờ tướng": "bg-red-700 text-white",
    "cờ vây": "bg-yellow-600 text-black",
    // Loại nội dung
    "chiến thuật": "bg-blue-600 text-white",
    gambit: "bg-indigo-600 text-white",
    mẹo: "bg-purple-500 text-white",
    "thảo luận": "bg-green-600 text-white",
    "trò chuyện": "bg-teal-500 text-white",
    "ngoài lề": "bg-pink-500 text-white",
    // Mức độ quan trọng
    "thông báo": "bg-orange-500 text-white",
    "quan trọng": "bg-red-600 text-white",
    // Màu mặc định
    default: "bg-gray-500 text-white",
  };

  // Initialize current user from localStorage
  useEffect(() => {
    const authDataString = localStorage.getItem("authData");
    if (authDataString) {
      try {
        const parsedAuthData = JSON.parse(authDataString);
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
      setLikeId(userLike?.id);
    }
  }, [threadData, currentUser.userId, threadId]);

  const handleCardClick = () => {
    if (threadId) {
      router.push(`/${locale}/community/${threadId}`);
    }
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !threadId || !currentUser.userId) return;

    setIsLoading(true);

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
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
        setLikeId(undefined);
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
          setLikeCount((prev) => prev + 1);
          setIsLiked(true);
          setLikeId(data.id);
        } else {
          throw new Error("Failed to like thread");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date time
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
    <Card
      className="w-full border-2 border-b-4 border-gray-200 rounded-xl hover:bg-gray-50 my-2 transition-all hover:shadow-sm"
      onClick={handleCardClick}
    >
      <CardBody className="flex p-5 gap-4">
        {/* Left side - Thumbnail */}
        <div className="w-1/3 min-w-[150px] max-w-[200px]">
          <img
            src={thumbnailUrl || "/default-thumbnail.jpg"}
            alt={title || "Default title"}
            className="w-full h-40 object-cover rounded-lg"
            loading="lazy"
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1 flex-wrap">
                {tags.map((tagItem) => (
                  <Button
                    key={tagItem.id}
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-3 ${
                      buttonColors[tagItem.tag?.tagName || theme] ||
                      buttonColors.default
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tagItem.tag?.tagName}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                {/* Like Button */}
                <Button
                  variant="outlined"
                  className={`flex items-center gap-1 py-1 px-2 border-2 rounded text-sm ${
                    isLiked ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  onClick={handleButtonClick}
                  disabled={isLoading}
                >
                  {isLiked ? (
                    <HeartIconSolid className="h-4 w-4 text-red-500" />
                  ) : (
                    <HeartIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={isLiked ? "text-red-500" : "text-gray-600"}>
                    {likeCount}
                  </span>
                </Button>
                {/* Comment Button */}
                <Button
                  variant="outlined"
                  className="flex items-center gap-1 py-1 px-2 border-2 border-gray-300 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  <ChatBubbleOvalLeftIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{commentsCount}</span>
                </Button>
              </div>
            </div>

            <Typography
              variant="h5"
              className="text-black font-bold mb-2 cursor-pointer hover:text-light-green-500 transition-all duration-200 ease-in-out"
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
                className="border border-gray-300"
              />
              <Typography className="text-gray-800 text-sm">
                {createdByNavigation?.username || "Tác giả"}
              </Typography>
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
  );
}
