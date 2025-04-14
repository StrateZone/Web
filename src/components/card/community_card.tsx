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

export type CommunityCardProps = {
  theme: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  dateTime?: string;
  likes?: number;
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
  const [likeId, setLikeId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });

  const buttonColors: { [key: string]: string } = {
    // Các loại cờ
    "cờ vua": "bg-gray-900 text-white", // Màu tối cho cờ vua
    "cờ tướng": "bg-red-700 text-white", // Màu đỏ truyền thống Trung Quốc
    "cờ vây": "bg-yellow-600 text-black", // Màu vàng tượng trưng cho đá cờ vây

    // Loại nội dung
    "chiến thuật": "bg-blue-600 text-white", // Màu xanh dương mạnh mẽ
    gambit: "bg-indigo-600 text-white", // Màu chàm đậm
    mẹo: "bg-purple-500 text-white", // Màu tím sáng
    "thảo luận": "bg-green-600 text-white", // Màu xanh lá cây
    "trò chuyện": "bg-teal-500 text-white", // Màu xanh ngọc
    "ngoài lề": "bg-pink-500 text-white", // Màu hồng nhạt

    // Mức độ quan trọng
    "thông báo": "bg-orange-500 text-white", // Màu cam cảnh báo
    "quan trọng": "bg-red-600 text-white", // Màu đỏ nổi bật

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

              <Button
                variant="outlined"
                className={`flex items-center gap-1 py-1 px-2 border-2 rounded text-sm ${
                  isLiked ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                onClick={handleButtonClick}
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isLiked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-4 w-4 ${isLiked ? "text-red-500" : "text-red-500"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                {likeCount}
              </Button>
            </div>

            <Typography
              variant="h5"
              className="text-black font-bold mb-2 cursor-pointer hover:text-light-green-500"
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
