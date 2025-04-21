import React, { useState } from "react";
import {
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ChevronDownIcon,
  PowerIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Calendar,
  User,
  Inbox,
  Send,
  Newspaper,
  FileText,
  PlayCircleIcon,
} from "lucide-react";
import { useLocale } from "next-intl";

const menuConfig = [
  {
    label: "Tài khoản",
    icon: UserCircleIcon,
    items: [
      { label: "Thông Tin Cá Nhân", icon: User, path: "profile" },
      { label: "Ví Tiền", icon: Wallet, path: "wallet" },
    ],
  },
  {
    label: "Lời Mời Và Lịch Sử Đặt Bàn",
    icon: Calendar,
    items: [
      {
        label: "Lịch Sử Đặt Hẹn",
        icon: ClockIcon,
        path: "appointment_history",
      },
      {
        label: "Những Cuộc Hẹn Đang Chờ",
        icon: PlayCircleIcon,
        path: "appointment_ongoing",
      },
      {
        label: "Lời Mời Đã Nhận",
        icon: Inbox,
        path: "chess_appointment/invitation_list",
      },
      {
        label: "Lời Mời Đã Gửi",
        icon: Send,
        path: "chess_appointment/send_invitation_list",
      },
    ],
  },
  {
    label: "Quản Lí Bài Viết",
    icon: Newspaper,
    items: [
      {
        label: "Bài Viết Của Tôi",
        icon: FileText,
        path: "community/post_history",
      },
    ],
  },
  {
    label: "Đăng xuất",
    icon: PowerIcon,
    isLogout: true,
    path: "#",
  },
];

const useProfileMenu = () => {
  const router = useRouter();
  const localActive = useLocale();

  const handleLogout = async () => {
    ["accessToken", "refreshToken", "authData", "chessBookings"].forEach(
      (item) => localStorage.removeItem(item)
    );
    router.push("/en");
    window.location.reload(); // Tải lại trang sau khi chuyển hướng
  };

  const getMenuConfig = () =>
    menuConfig.map((item) => ({
      ...item,
      onClick: item.isLogout ? handleLogout : undefined,
      items: item.items?.map((subItem) => ({
        ...subItem,
        onClick: () => router.push(`/${localActive}/${subItem.path}`),
      })),
    }));

  return { getMenuConfig };
};

type SubMenuItemProps = {
  item: {
    label: string;
    icon?: React.ElementType;
    onClick?: () => void;
  };
  onClose: () => void;
};

const SubMenuItem = ({ item, onClose }: SubMenuItemProps) => {
  return (
    <MenuItem
      onClick={() => {
        onClose();
        item.onClick?.();
      }}
      className="flex items-center gap-2 rounded pl-8"
    >
      {item.icon &&
        React.createElement(item.icon, {
          className: "h-4 w-4",
          strokeWidth: 2,
        })}
      <Typography as="span" variant="small" className="font-normal">
        {item.label}
      </Typography>
    </MenuItem>
  );
};

type MenuItemType = {
  label: string;
  icon?: React.ElementType;
  isLogout?: boolean;
  onClick?: () => void;
  items?: {
    label: string;
    icon?: React.ElementType;
    onClick?: () => void;
  }[];
};

const SubMenu = ({
  menu,
  onClose,
}: {
  menu: MenuItemType;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MenuItem
        className={`flex items-center justify-between ${menu.isLogout ? "hover:bg-red-500/10" : ""}`}
        onClick={menu.isLogout ? menu.onClick : () => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {menu.icon &&
            React.createElement(menu.icon, {
              className: `h-4 w-4 ${menu.isLogout ? "text-red-500" : ""}`,
            })}
          <Typography
            as="span"
            className="font-bold"
            color={menu.isLogout ? "red" : "inherit"}
          >
            {menu.label}
          </Typography>
        </div>
        {!menu.isLogout && (
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </MenuItem>

      {open &&
        menu.items?.map((item) => (
          <SubMenuItem key={item.label} item={item} onClose={onClose} />
        ))}
    </>
  );
};

export default function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getMenuConfig } = useProfileMenu();
  const menuConfig = getMenuConfig();

  // Get authData and check if user is a member
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const isMember = authData?.userRole === "Member";
  const avatarUrl =
    authData?.userInfo?.avatarUrl ||
    "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg";

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Badge
            overlap="circular"
            placement="bottom-end"
            className={`border-1 border-white ${
              isMember
                ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse !h-5 !w-5"
                : "bg-blue-gray-100"
            }`}
            content={
              isMember ? (
                <Tooltip content="Thành viên câu lạc bộ">
                  <CheckBadgeIcon className="h-4 w-4 text-white" />
                </Tooltip>
              ) : null
            }
          >
            <Avatar
              variant="circular"
              size="sm"
              alt="user avatar"
              className={`p-0.5 ${
                isMember
                  ? "border-2 border-purple-500 shadow-lg shadow-purple-500/30 "
                  : "border border-gray-900"
              }`}
              src={avatarUrl}
            />
          </Badge>
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1 w-72 max-h-[80vh] overflow-y-auto">
        {menuConfig.map((menu) => (
          <SubMenu
            key={menu.label}
            menu={menu}
            onClose={() => setIsMenuOpen(false)}
          />
        ))}
      </MenuList>
    </Menu>
  );
}
