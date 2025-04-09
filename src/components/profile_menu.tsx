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
  ClockIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { Wallet, Calendar, HelpCircle, User, Inbox, Send } from "lucide-react";
import { useLocale } from "next-intl";

const menuConfig = [
  {
    label: "Tài khoản",
    icon: UserCircleIcon,
    items: [
      { label: "Thông tin cá nhân", icon: User, path: "profile" },
      // { label: "Cài đặt tài khoản", icon: CogIcon, path: "settings" },
      { label: "Ví tiền", icon: Wallet, path: "wallet" },
    ],
  },
  {
    label: "Lời Mời Và Lịch Sử",
    icon: Calendar,
    items: [
      {
        label: "Lịch sử đặt bàn",
        icon: ClockIcon,
        path: "appointment_history",
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
  // {
  //   label: "Hỗ trợ",
  //   icon: LifebuoyIcon,
  //   items: [
  //     { label: "Trung tâm trợ giúp", icon: HelpCircle, path: "help-center" },
  //     { label: "Liên hệ hỗ trợ", icon: LifebuoyIcon, path: "contact-support" },
  //   ],
  // },
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

  const handleLogout = () => {
    ["accessToken", "refreshToken", "authData", "chessBookings"].forEach(
      (item) => localStorage.removeItem(item)
    );
    router.push("/");
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
            variant="small"
            className="font-normal"
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
  const avatarUrl =
    JSON.parse(localStorage.getItem("authData") || "{}")?.userInfo?.avatarUrl ||
    "/default-avatar.png";

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
            className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1 w-64 max-h-[80vh] overflow-y-auto">
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
