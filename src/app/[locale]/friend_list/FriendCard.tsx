"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Avatar,
  Badge,
  Tooltip,
} from "@material-tailwind/react";
import { FiInfo, FiX, FiUserPlus } from "react-icons/fi";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { User } from "./page";
import { useState } from "react";

interface FriendCardProps {
  user: User;
  isFriend: boolean;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onViewProfile: () => void;
}

export function FriendCard({
  user,
  isFriend,
  onAddFriend,
  onRemoveFriend,
  onViewProfile,
}: FriendCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const isMember = user.userRole === "Member";
  const isTopContributor =
    user.userLabel === 1 || user.userLabel === "top_contributor";

  const handleRemoveFriend = async () => {
    if (!onRemoveFriend) return;
    setIsRemoving(true);
    try {
      await onRemoveFriend();
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card
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
                user.avatarUrl ||
                "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
              }
              alt={user.username}
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
                {user.username}
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
            <Typography variant="small" color="gray" className="truncate">
              {user.fullName || "Không có tên hiển thị"}
            </Typography>
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button
          fullWidth
          variant={isMember || isTopContributor ? "gradient" : "outlined"}
          color={isMember ? "purple" : isTopContributor ? "amber" : "blue-gray"}
          className={`flex items-center justify-center gap-2 ${
            isMember
              ? "shadow-purple-500/20"
              : isTopContributor
                ? "shadow-amber-500/20"
                : ""
          }`}
          onClick={onViewProfile}
        >
          <FiInfo className="h-4 w-4" />
          Xem thông tin
        </Button>
        {isFriend ? (
          <Button
            fullWidth
            variant="outlined"
            color={isMember ? "purple" : isTopContributor ? "amber" : "red"}
            className={`flex items-center justify-center gap-2 ${
              isMember
                ? "border-purple-500 text-purple-500 hover:bg-purple-50"
                : isTopContributor
                  ? "border-amber-500 text-amber-700 hover:bg-amber-50"
                  : "border-red-500 text-red-500 hover:bg-red-50"
            }`}
            onClick={handleRemoveFriend}
            loading={isRemoving}
          >
            {!isRemoving && <FiX className="h-4 w-4" />}
            Hủy kết bạn
          </Button>
        ) : (
          <Button
            fullWidth
            variant={isMember || isTopContributor ? "gradient" : "filled"}
            color={isMember ? "purple" : isTopContributor ? "amber" : "blue"}
            className={`flex items-center justify-center gap-2 ${
              isMember
                ? "shadow-purple-500/20"
                : isTopContributor
                  ? "shadow-amber-500/20"
                  : ""
            }`}
            onClick={onAddFriend}
          >
            <FiUserPlus className="h-4 w-4" />
            Thêm bạn
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
