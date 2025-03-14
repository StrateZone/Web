"use client";
import React, { useEffect, useState, useTransition } from "react";
import {
  Navbar as MTNavbar,
  Collapse,
  Button,
  IconButton,
  Typography,
  Select,
  Option,
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
import { FaChessBoard } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

import ProfileMenu from "../profile_menu";

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

  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

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

  const handleOpen = () => setOpen((cur) => !cur);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false),
    );
  }, []);

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
      name: t("home"),
      icon: HomeIcon,
      href: "/",
    },
    {
      name: t("chessAppointment"),
      icon: FaChessBoard,
      href: `/${localActive}/chess_appointment`,
    },
    {
      name: t("courses"),
      icon: FaBookOpen,
      href: `/${localActive}/courses`,
    },
    {
      name: t("store"),
      icon: BuildingStorefrontIcon,
      href: `/${localActive}/store`,
    },
    {
      name: t("community"),
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
        <div className="hidden items-center gap-4 lg:flex">
          <Select
            value={localActive}
            onChange={onSelectChange}
            disabled={isPending}
            label={t("chooseLanguage")}
            color="amber"
          >
            <Option value="en">
              <div className="flex gap-2 justify-start">
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  className="h-5 w-6 rounded"
                />
                <div>{t("english")}</div>
              </div>
            </Option>
            <Option value="vi">
              <div className="flex gap-2 justify-start">
                <img
                  src="https://flagcdn.com/w40/vn.png"
                  alt="Vietnamese"
                  className="h-5 w-6 rounded"
                />
                <div> {t("vietnamese")}</div>
              </div>
            </Option>
          </Select>
          {session ? (
            <ProfileMenu />
          ) : (
            <>
              <Button
                onClick={() => router.push(`/${localActive}/login`)}
                color={isScrolling ? "gray" : "white"}
                variant="text"
              >
                {t("login")}
              </Button>
              <Button
                onClick={() => router.push(`/${localActive}/register`)}
                color={isScrolling ? "gray" : "white"}
                variant="text"
              >
                {t("register")}
              </Button>
            </>
          )}
        </div>
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
            {session ? (
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

            <Select
              value={localActive}
              onChange={onSelectChange}
              disabled={isPending}
              label={t("chooseLanguage")}
              className="text-black"
              color="amber"
            >
              <Option value="en">
                <div className="flex gap-2 justify-start">
                  <img
                    src="https://flagcdn.com/w40/gb.png"
                    alt="English"
                    className="h-5 w-6 rounded"
                  />
                  <div>{t("english")}</div>
                </div>
              </Option>
              <Option value="vi">
                <div className="flex gap-2 justify-start">
                  <img
                    src="https://flagcdn.com/w40/vn.png"
                    alt="Vietnamese"
                    className="h-5 w-6 rounded"
                  />
                  <div> {t("vietnamese")}</div>
                </div>
              </Option>
            </Select>
          </div>
        </div>
      </Collapse>
    </MTNavbar>
  );
}

export default Navbar;
