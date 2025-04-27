"use client";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Badge,
} from "@material-tailwind/react";
import { XMarkIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { User, SearchFriendResult } from "./page";

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | SearchFriendResult | null;
}

export function UserProfileDialog({
  open,
  onClose,
  user,
}: UserProfileDialogProps) {
  const isMember = user?.userRole === "Member" || user?.userRole === 1;
  const isTopContributor =
    user?.userLabel === 1 || user?.userLabel === "top_contributor";

  return (
    <Dialog open={open} handler={onClose} size="md" className="rounded-lg">
      <DialogHeader className="justify-between p-4 border-b">
        <Typography variant="h5" color="blue-gray">
          Thông tin người dùng
        </Typography>
        <IconButton
          color="blue-gray"
          size="sm"
          variant="text"
          onClick={onClose}
        >
          <XMarkIcon className="w-5 h-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="p-6">
        {user && (
          <div className="flex flex-col gap-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6">
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
                  size="xxl"
                  className={`border-2 ${
                    isMember
                      ? "border-purple-500 shadow-lg shadow-purple-500/30"
                      : isTopContributor
                        ? "border-amber-500 shadow-lg shadow-amber-500/30"
                        : "border-blue-500 shadow-lg shadow-blue-500/20"
                  }`}
                />
              </Badge>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Typography
                    variant="h4"
                    color={
                      isMember
                        ? "purple"
                        : isTopContributor
                          ? "amber"
                          : "blue-gray"
                    }
                  >
                    {user.username}
                  </Typography>
                  {isMember && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-bounce">
                      MEMBER
                    </span>
                  )}
                  {isTopContributor && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-bounce">
                      TOP CONTRIBUTOR
                    </span>
                  )}
                </div>
                <Typography variant="lead" color="gray" className="font-normal">
                  {user.fullName || "Không có tên hiển thị"}
                </Typography>
              </div>
            </div>

            {/* Joined Date */}
            <Typography
              variant="small"
              color={
                isMember ? "purple" : isTopContributor ? "amber" : "blue-gray"
              }
              className={`-mt-4 ${isMember || isTopContributor ? "font-bold" : ""}`}
            >
              Người dùng đã tạo tài khoản vào ngày{" "}
              {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              {(isMember || isTopContributor) && " 🎉"}
            </Typography>

            {/* Divider */}
            <div
              className={`border-t ${
                isMember
                  ? "border-purple-200"
                  : isTopContributor
                    ? "border-amber-200"
                    : "border-blue-gray-100"
              }`}
            ></div>

            {/* Personal Info - Horizontal Layout */}
            <div className="flex flex-row gap-8">
              <div className="space-y-1">
                <Typography
                  variant="small"
                  color={
                    isMember
                      ? "purple"
                      : isTopContributor
                        ? "amber"
                        : "blue-gray"
                  }
                  className="font-bold"
                >
                  Giới tính
                </Typography>
                <Typography variant="paragraph">
                  {user.gender === "male"
                    ? "Nam"
                    : user.gender === "female"
                      ? "Nữ"
                      : "Không xác định"}
                </Typography>
              </div>

              <div className="space-y-1">
                <Typography
                  variant="small"
                  color={
                    isMember
                      ? "purple"
                      : isTopContributor
                        ? "amber"
                        : "blue-gray"
                  }
                  className="font-bold"
                >
                  Địa chỉ
                </Typography>
                <Typography variant="paragraph">
                  {user.address || "Chưa cập nhật"}
                </Typography>
              </div>
            </div>

            {/* Bio - Below Personal Info */}
            {user.bio && (
              <div className="space-y-1">
                <Typography
                  variant="small"
                  color={
                    isMember
                      ? "purple"
                      : isTopContributor
                        ? "amber"
                        : "blue-gray"
                  }
                  className="font-bold"
                >
                  Giới thiệu
                </Typography>
                <Typography
                  variant="paragraph"
                  className={`${
                    isMember
                      ? "text-purple-900 bg-purple-50 px-3 py-2 rounded-lg"
                      : isTopContributor
                        ? "text-amber-900 bg-amber-50 px-3 py-2 rounded-lg"
                        : "text-gray-700"
                  }`}
                >
                  {user.bio}
                </Typography>
              </div>
            )}

            {/* Special Badges */}
            {isMember && (
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-center ">
                <Typography
                  variant="small"
                  color="purple"
                  className="font-bold"
                >
                  ✨ Thành viên câu lạc bộ với nhiều ưu đãi độc quyền ✨
                </Typography>
              </div>
            )}
            {isTopContributor && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 text-center ">
                <Typography variant="small" color="amber" className="font-bold">
                  🌟 Top Contributor với những đóng góp nổi bật 🌟
                </Typography>
              </div>
            )}
          </div>
        )}
      </DialogBody>

      <DialogFooter className="px-6 py-4 border-t">
        <Button
          variant="gradient"
          color={isMember ? "purple" : isTopContributor ? "amber" : "blue"}
          onClick={onClose}
          className="mr-2"
        >
          Đóng
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
