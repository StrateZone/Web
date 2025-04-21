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
import { FiInfo, FiX, FiUserPlus, FiClock, FiUser } from "react-icons/fi";
import { CheckBadgeIcon } from "@heroicons/react/24/solid"; // Thêm import này
import { SearchFriendResult } from "./page";

interface SearchResultCardProps {
  user: SearchFriendResult;
  onAddFriend: () => void;
  onCancelRequest?: () => void;
  onViewProfile: () => void;
}

export function SearchResultCard({
  user,
  onAddFriend,
  onCancelRequest,
  onViewProfile,
}: SearchResultCardProps) {
  const isMember = user.userRole === "Member";

  const getFriendStatusText = () => {
    switch (user.friendStatus) {
      case 0:
        return isMember ? "Thêm bạn" : "Thêm bạn";
      case 1:
        return isMember ? "Đã gửi yêu cầu" : "Đã gửi yêu cầu";
      case 2:
        return isMember ? "Bạn bè" : "Bạn bè";
      default:
        return isMember ? "Thêm bạn" : "Thêm bạn";
    }
  };

  const getButtonVariant = () => {
    switch (user.friendStatus) {
      case 0:
        return isMember ? "gradient" : "filled";
      case 1:
        return "outlined";
      case 2:
        return "outlined";
      default:
        return isMember ? "gradient" : "filled";
    }
  };

  const getButtonColor = () => {
    switch (user.friendStatus) {
      case 0:
        return isMember ? "purple" : "blue";
      case 1:
        return isMember ? "purple" : "amber";
      case 2:
        return isMember ? "purple" : "gray";
      default:
        return isMember ? "purple" : "blue";
    }
  };

  const getButtonIcon = () => {
    if (isMember && user.friendStatus === 0) {
      return <FiUserPlus className="h-4 w-4 text-white" />;
    }
    switch (user.friendStatus) {
      case 0:
        return <FiUserPlus className="h-4 w-4" />;
      case 1:
        return <FiClock className="h-4 w-4" />;
      case 2:
        return <FiUser className="h-4 w-4" />;
      default:
        return <FiUserPlus className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isMember ? "border border-purple-200" : ""}`}
    >
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <Badge
            overlap="circular"
            placement="bottom-end"
            className={`border-2 border-white ${isMember ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" : "bg-blue-gray-100"}`}
            content={
              isMember ? (
                <Tooltip content="Thành viên câu lạc bộ">
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
              className={`border-2 ${isMember ? "border-purple-500 shadow-lg shadow-purple-500/20" : "border-blue-100"}`}
            />
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Typography
                variant="h5"
                className={`text-gray-900 truncate ${isMember ? "text-purple-600" : ""}`}
              >
                {user.username}
              </Typography>
              {isMember && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  MEMBER
                </span>
              )}
            </div>
            <Typography variant="small" color="gray" className="truncate">
              {user.fullName || "Không có tên hiển thị"}
            </Typography>
            {isMember && (
              <Typography variant="small" className="text-purple-500 mt-1">
                Thành viên câu lạc bộ
              </Typography>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button
          variant={isMember ? "gradient" : "outlined"}
          color={isMember ? "purple" : "blue-gray"}
          className={`flex items-center justify-center gap-2 ${isMember ? "shadow-purple-500/20" : ""}`}
          onClick={onViewProfile}
        >
          <FiInfo className="h-4 w-4" />
          Xem thông tin
        </Button>

        {user.friendStatus === 1 ? (
          <>
            <Button
              variant={getButtonVariant()}
              color={getButtonColor()}
              fullWidth
              className={`flex items-center justify-center gap-2 cursor-default ${
                isMember ? "border-purple-500 text-purple-500" : ""
              }`}
              disabled
            >
              {getButtonIcon()}
              {getFriendStatusText()}
            </Button>
            <Button
              variant="outlined"
              color={isMember ? "purple" : "red"}
              fullWidth
              className={`flex items-center justify-center gap-2 ${
                isMember
                  ? "border-purple-500 text-purple-500 hover:bg-purple-50"
                  : ""
              }`}
              onClick={onCancelRequest}
            >
              <FiX className="h-4 w-4" />
              Hủy yêu cầu
            </Button>
          </>
        ) : (
          <Button
            onClick={user.friendStatus === 0 ? onAddFriend : undefined}
            variant={getButtonVariant()}
            color={getButtonColor()}
            fullWidth
            className={`flex items-center justify-center gap-2 ${
              user.friendStatus !== 0 ? "cursor-default" : ""
            } ${isMember && user.friendStatus === 0 ? "shadow-purple-500/20" : ""}`}
            disabled={user.friendStatus !== 0}
          >
            {getButtonIcon()}
            {getFriendStatusText()}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
