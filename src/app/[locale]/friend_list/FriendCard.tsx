// components/friends/FriendCard.tsx
"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Avatar,
} from "@material-tailwind/react";
import { FiInfo, FiX, FiUserPlus } from "react-icons/fi";
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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatarUrl || "/default-avatar.png"}
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
          fullWidth
          variant="outlined"
          className="flex items-center justify-center gap-2"
          onClick={onViewProfile}
        >
          <FiInfo className="h-4 w-4" />
          Xem thông tin
        </Button>
        {isFriend ? (
          <Button
            fullWidth
            variant="outlined"
            color="red"
            className="flex items-center justify-center gap-2"
            onClick={onRemoveFriend}
          >
            <FiX className="h-4 w-4" />
            Hủy kết bạn
          </Button>
        ) : (
          <Button
            fullWidth
            className="flex items-center justify-center gap-2"
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
