"use client";
import React, { useEffect, useState, useTransition } from "react";
import {
  Navbar as MTNavbar,
  Collapse,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useTranslations } from "next-intl";
import {
  HomeIcon,
  UserCircleIcon,
  XMarkIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { FaChessBoard, FaBookOpen, FaWallet } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Calendar, ShoppingCart } from "lucide-react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import ProfileMenu from "../profile_menu";
import { FaChess } from "react-icons/fa";

interface NavItemProps {
  children: React.ReactNode;
  href?: string;
}

function NavItem({ children, href }: NavItemProps) {
  return (
    <li>
      <Link href={href || "#"}>
        <Typography
          variant="paragraph"
          className="flex items-center gap-2 font-medium transition-colors duration-300 hover:text-gray-500"
        >
          {children}
        </Typography>
      </Link>
    </li>
  );
}

export function Navbar() {
  const t = useTranslations("NavBar");
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const router = useRouter();
  const localActive = useLocale();
  const [showBalance, setShowBalance] = useState(true);
  const { locale } = useParams();

  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onSelectChange = (value: string | undefined) => {
    const currentPath = window.location.pathname.split("/")[2];
    if (value && currentPath) {
      startTransition(() => {
        router.replace(`/${value}/${currentPath}`);
      });
    } else {
      startTransition(() => {
        router.replace(`/${value}`);
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleOpen = () => setOpen((cur) => !cur);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false),
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    router.push("/");
  };

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NAV_MENU = [
    {
      name: "Trang chủ",
      icon: HomeIcon,
      href: "/",
    },
    {
      name: "Hẹn cờ",
      icon: FaChessBoard,
      href: `/${localActive}/chess_appointment/chess_category`,
    },
    {
      name: "Giải đấu",
      icon: FaBookOpen,
      href: `/${localActive}/tournament`,
    },
    {
      name: "Cửa Hàng",
      icon: BuildingStorefrontIcon,
      href: `/${localActive}/store`,
    },
    {
      name: "Cộng đồng",
      icon: UserCircleIcon,
      href: `/${localActive}/community`,
    },
  ];

  return (
    <MTNavbar
      shadow={false}
      fullWidth
      blurred={false}
      color={isScrolling ? "white" : "transparent"}
      className="fixed top-0 z-50 border-0"
    >
      <div className="container mx-auto flex items-center justify-between">
        <Typography
          color={isScrolling ? "blue-gray" : "white"}
          className="text-lg font-bold"
        >
          {t("siteTitle")}
        </Typography>
        <ul
          className={`ml-10 hidden items-center gap-6 lg:flex ${
            isScrolling ? "text-gray-900" : "text-white"
          }`}
        >
          {NAV_MENU.map(({ name, icon: Icon, href }) => (
            <NavItem key={name} href={href}>
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </NavItem>
          ))}
        </ul>
        {isLoggedIn ? (
          <div className="hidden items-center gap-6 lg:flex">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                <FaWallet className="text-blue-500 mr-2" size={16} />
                <span className="text-gray-800 font-semibold">
                  {showBalance ? "100.000 VNĐ" : "******"}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  {showBalance ? (
                    <AiFillEyeInvisible size={18} />
                  ) : (
                    <AiFillEye size={18} />
                  )}
                </button>
              </div>
            </div>

            <FaChess
              onClick={() =>
                router.push(
                  `/${locale}/chess_appointment/chess_appointment_order`,
                )
              }
              className="h-6 w-6 text-yellow-700 cursor-pointer hover:text-yellow-200 mr-2"
            />

            <ShoppingCart className="h-6 w-6 text-blue-700 cursor-pointer hover:text-blue-200 mr-2" />

            <ProfileMenu />
          </div>
        ) : (
          <div className="flex items-center gap-x-2">
            <FaChess
              onClick={() =>
                router.push(
                  `/${locale}/chess_appointment/chess_appointment_order`,
                )
              }
              className="h-6 w-6 text-yellow-700 cursor-pointer hover:text-yellow-200 mr-2"
            />
            <Button
              onClick={() => router.push(`/${localActive}/login`)}
              color={isScrolling ? "gray" : "white"}
              variant="text"
            >
              Đăng nhập
            </Button>
            <Button
              onClick={() => router.push(`/${localActive}/register`)}
              color={isScrolling ? "gray" : "white"}
              variant="text"
            >
              Đăng kí
            </Button>
          </div>
        )}

        <IconButton
          variant="text"
          color={isScrolling ? "gray" : "white"}
          onClick={handleOpen}
          className="ml-auto inline-block lg:hidden"
        >
          {open ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      <Collapse open={open}>
        <div className="container mx-auto mt-4 rounded-lg bg-white px-6 py-5">
          <ul className="flex flex-col gap-4 text-gray-900">
            {NAV_MENU.map(({ name, icon: Icon, href }) => (
              <NavItem key={name} href={href}>
                <Icon className="h-5 w-5" />
                {name}
              </NavItem>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-4">
            {isLoggedIn ? (
              <ProfileMenu />
            ) : (
              <>
                <Button
                  onClick={() => router.push(`/${localActive}/login`)}
                  variant="text"
                >
                  {t("login")}
                </Button>
                <Button
                  onClick={() => router.push(`/${localActive}/register`)}
                  variant="text"
                >
                  {t("register")}
                </Button>
              </>
            )}
          </div>
        </div>
      </Collapse>
    </MTNavbar>
  );
}

export default Navbar;
