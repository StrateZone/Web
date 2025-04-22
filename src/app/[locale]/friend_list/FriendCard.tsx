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
import { CheckBadgeIcon } from "@heroicons/react/24/solid"; // Thêm import này
import { User } from "./page";

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
  const isMember = user.userRole === "Member";

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
          fullWidth
          variant={isMember ? "gradient" : "outlined"}
          color={isMember ? "purple" : "blue-gray"}
          className={`flex items-center justify-center gap-2 ${isMember ? "shadow-purple-500/20" : ""}`}
          onClick={onViewProfile}
        >
          <FiInfo className="h-4 w-4" />
          Xem thông tin
        </Button>
        {isFriend ? (
          <Button
            fullWidth
            variant={isMember ? "outlined" : "outlined"}
            color={isMember ? "purple" : "red"}
            className={`flex items-center justify-center gap-2 ${isMember ? "border-purple-500 text-purple-500 hover:bg-purple-50" : ""}`}
            onClick={onRemoveFriend}
          >
            <FiX className="h-4 w-4" />
            Hủy kết bạn
          </Button>
        ) : (
          <Button
            fullWidth
            variant={isMember ? "gradient" : "filled"}
            color={isMember ? "purple" : "blue"}
            className={`flex items-center justify-center gap-2 ${isMember ? "shadow-purple-500/20" : ""}`}
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
