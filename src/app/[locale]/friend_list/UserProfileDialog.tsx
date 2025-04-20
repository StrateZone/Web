// components/friends/UserProfileDialog.tsx
"use client";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Avatar,
  Button,
} from "@material-tailwind/react";
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
  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Thông tin người dùng</DialogHeader>
      <DialogBody divider>
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={
                  user.avatarUrl ||
                  "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                }
                alt={user.username}
                size="xl"
                className="border-2 border-blue-100"
              />
              <div>
                <Typography variant="h5">{user.username}</Typography>
                <Typography variant="small" color="gray">
                  {user.fullName || "Không có tên hiển thị"}
                </Typography>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray">
                  Địa chỉ
                </Typography>
                <Typography variant="paragraph">
                  {user.address || "Không có"}
                </Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray">
                  Giới tính
                </Typography>
                <Typography variant="paragraph">
                  {user.gender === "male"
                    ? "Nam"
                    : user.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="blue-gray">
                  Ngày tham gia
                </Typography>
                <Typography variant="paragraph">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </div>
            </div>
            {user.bio && (
              <div>
                <Typography variant="small" color="blue-gray">
                  Giới thiệu
                </Typography>
                <Typography variant="paragraph">{user.bio}</Typography>
              </div>
            )}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose} className="mr-1">
          <span>Đóng</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
