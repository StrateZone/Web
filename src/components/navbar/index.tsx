"use client";
import React, { useEffect, useState } from "react";
import {
  Navbar as MTNavbar,
  Collapse,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
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
import ProfileMenu from "../profile_menu";
import Link from "next/link"; // Import Link từ Next.js

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
          className="flex items-center gap-2 font-medium"
        >
          {children}
        </Typography>
      </Link>
    </li>
  );
}

const NAV_MENU = [
  {
    name: "Home",
    icon: HomeIcon,
    href: "/",
  },
  {
    name: "Chess Appointment",
    icon: FaChessBoard,
    href: "/chess_appointment",
  },
  {
    name: "Courses",
    icon: FaBookOpen,
    href: "/courses",
  },
  {
    name: "Store",
    icon: BuildingStorefrontIcon,
    href: "/store",
  },
  {
    name: "Community",
    icon: UserCircleIcon,
    href: "/community",
  },
];

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleOpen = () => setOpen((cur) => !cur);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false)
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
          StrateZone
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
          {session ? (
            <ProfileMenu />
          ) : (
            <>
              <Button
                onClick={() => router.push("/login")}
                color={isScrolling ? "gray" : "white"}
                variant="text"
              >
                Log in
              </Button>
              <Button
                onClick={() => router.push("/register")}
                color={isScrolling ? "gray" : "white"}
                variant="text"
              >
                Register
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
            <Button onClick={() => router.push("/login")} variant="text">
              Log in
            </Button>

            <Button
              onClick={() => router.push("/register")}
              color={isScrolling ? "gray" : "white"}
              variant="text"
            >
              Register
            </Button>
          </div>
        </div>
      </Collapse>
    </MTNavbar>
  );
}

export default Navbar;
