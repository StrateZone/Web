import React, { useState } from "react";
import {
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ChevronDownIcon,
  LifebuoyIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { Wallet, Calendar, Mail } from "lucide-react";
import { useLocale } from "next-intl";

export default function ProfileMenu() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const localActive = useLocale();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authData");
    localStorage.removeItem("chessBookings");

    router.push("/"); // Điều hướng về trang chủ sau khi logout
  };

  const profileMenuItems = [
    {
      label: "Thông Tin Cá Nhân",
      icon: UserCircleIcon,
      onClick: () => router.push(`/${localActive}/profile`),
    },
    {
      label: "Ví Tiền",
      icon: Wallet,
      onClick: () => router.push(`/${localActive}/wallet`),
    },
    {
      label: "Lịch Sử Đặt Bàn",
      icon: Calendar,
      onClick: () => router.push(`/${localActive}/appointment_history`),
    },

    {
      label: "Lời Mởi Đánh Cờ",
      icon: Mail,
      onClick: () =>
        router.push(`/${localActive}/chess_appointment/invitation_list`),
    },
    {
      label: "Help",
      icon: LifebuoyIcon,
    },
    {
      label: "Đăng Xuất",
      icon: PowerIcon,
      onClick: handleLogout,
    },
  ];
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const userInfo = authData.userInfo || {}; // Fallback to empty object

  // Safe access to avatarUrl with fallback
  const avatarUrl = userInfo.avatarUrl || "/default-avatar.png";
  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Avatar
            variant="circular"
            size="sm"
            alt="user avatar"
            className="border border-gray-900 p-0.5"
            src={avatarUrl}
          />
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {profileMenuItems.map(({ label, icon, onClick }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <MenuItem
              key={label}
              onClick={() => {
                closeMenu();
                if (onClick) onClick(); // Gọi hàm xử lý
              }}
              className={`flex items-center gap-2 rounded ${
                isLastItem
                  ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                  : ""
              }`}
            >
              {React.createElement(icon, {
                className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                strokeWidth: 2,
              })}
              <Typography
                as="span"
                variant="small"
                className="font-normal"
                color={isLastItem ? "red" : "inherit"}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
