// components/friends/SearchResultCard.tsx
"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Avatar,
} from "@material-tailwind/react";
import { FiInfo, FiX, FiUserPlus, FiClock, FiUser } from "react-icons/fi";
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
  const getFriendStatusText = () => {
    switch (user.friendStatus) {
      case 0:
        return "Thêm bạn";
      case 1:
        return "Đã gửi yêu cầu";
      case 2:
        return "Bạn bè";
      default:
        return "Thêm bạn";
    }
  };

  const getButtonVariant = () => {
    switch (user.friendStatus) {
      case 0:
        return "filled";
      case 1:
        return "outlined";
      case 2:
        return "outlined";
      default:
        return "filled";
    }
  };

  const getButtonColor = () => {
    switch (user.friendStatus) {
      case 0:
        return "blue";
      case 1:
        return "amber";
      case 2:
        return "gray";
      default:
        return "blue";
    }
  };

  const getButtonIcon = () => {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={
              user.avatarUrl ||
              "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
            }
            alt={user.username}
            size="lg"
            className="border-2 border-blue-100"
          />
          <div className="flex-1 min-w-0">
            <Typography variant="h5" className="text-gray-900 truncate">
              {user.username}
            </Typography>
            <Typography variant="small" color="gray" className="truncate">
              {user.fullName || "Không có tên hiển thị"}
            </Typography>
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button
          variant="outlined"
          className="flex items-center justify-center gap-2"
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
              className="flex items-center justify-center gap-2 cursor-default"
              disabled
            >
              {getButtonIcon()}
              {getFriendStatusText()}
            </Button>
            <Button
              variant="outlined"
              color="red"
              fullWidth
              className="flex items-center justify-center gap-2"
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
            }`}
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
