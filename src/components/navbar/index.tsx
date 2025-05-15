"use client";
import React, { useEffect, useState } from "react";
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
} from "@heroicons/react/24/solid";
import { FaChessBoard, FaWallet, FaUserFriends } from "react-icons/fa";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import ProfileMenu from "../profile_menu";
import { FaChess } from "react-icons/fa";
import { fetchWallet } from "@/app/[locale]/wallet/walletSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import NotificationDropdown from "./notification_dropdown";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

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
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();
  const { locale } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { balance, loading: walletLoading } = useSelector(
    (state: RootState) => state.wallet
  );

  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

  const checkUserRole = async (userId: number): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5 seconds
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
        method: "GET",
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return null;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch user role");
      }

      return await response.text();
    } catch (error) {
      console.error("Error fetching user role:", error);
      throw error;
    }
  };

  const fetchUserData = async (userId: number) => {
    try {
      const [roleResult] = await Promise.all([
        checkUserRole(userId),
        dispatch(fetchWallet(userId)).unwrap(),
      ]);

      if (roleResult) {
        setUserRole(roleResult);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);
      router.push(`/${locale}/login`);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const storedAuthData = localStorage.getItem("authData");
        if (!token || !storedAuthData) {
          setIsLoggedIn(false);
          return;
        }

        let parsedData;
        try {
          parsedData = JSON.parse(storedAuthData);
        } catch (e) {
          console.error("Invalid authData format:", e);
          setIsLoggedIn(false);
          return;
        }

        const userId = parsedData.userId;
        if (!userId) {
          console.error("No userId found in authData");
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
        setUserId(userId);
        await fetchUserData(userId);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoggedIn(false);
        setUserRole(null);
        setUserId(null);
      }
    };

    const handleStorageChange = () => {
      checkAuth();
    };

    const handleAuthDataUpdate = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authDataUpdated", handleAuthDataUpdate);
    checkAuth();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authDataUpdated", handleAuthDataUpdate);
    };
  }, [dispatch, locale, router]);

  useEffect(() => {
    if (pathname.includes("/friend_list") && userRole !== null) {
      const canAccessFriendList = userRole === "Member";
      if (!canAccessFriendList) {
        router.replace(`/${locale}`);
      }
    }
  }, [userRole, pathname, router, locale]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showBalance");
      setShowBalance(saved !== null ? JSON.parse(saved) : true);
    }
  }, []);

  const toggleShowBalance = () => {
    setShowBalance((prev) => {
      const newValue = !prev;
      localStorage.setItem("showBalance", JSON.stringify(newValue));
      return newValue;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleOpen = () => setOpen((cur) => !cur);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false)
    );
    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolling(window.scrollY > 0);
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
      name: "Cộng đồng",
      icon: UserCircleIcon,
      href: `/${localActive}/community`,
    },
  ];

  const canAccessFriendList = userRole === "Member";

  return (
    <>
      <MTNavbar
        shadow={false}
        fullWidth
        blurred={false}
        className={`fixed top-0 z-50 border-0 ${
          isScrolling ? "bg-white" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Typography
            color={isScrolling ? "blue-gray" : "white"}
            className="text-lg font-bold"
          >
            {t("siteTitle")}
          </Typography>
          <ul
            className={`ml-40 hidden items-center gap-14 lg:flex ${
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
            <div className="hidden items-center gap-8 lg:flex">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                  <FaWallet
                    onClick={() => router.push(`/${locale}/wallet`)}
                    className="text-blue-500 mr-2 cursor-pointer"
                    size={16}
                  />
                  {walletLoading ? (
                    <div className="animate-pulse h-4 w-20 bg-gray-300 rounded"></div>
                  ) : (
                    <span className="text-gray-800 font-semibold">
                      {showBalance ? formatCurrency(balance) : "******"}
                    </span>
                  )}
                  <button
                    onClick={toggleShowBalance}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                    disabled={walletLoading}
                  >
                    {showBalance ? (
                      <AiFillEyeInvisible size={18} />
                    ) : (
                      <AiFillEye size={18} />
                    )}
                  </button>
                </div>
              </div>
              {canAccessFriendList && (
                <div className="hover:bg-gray-200 focus:outline-none relative p-2 rounded-full">
                  <FaUserFriends
                    className="h-6 w-6 text-blue-700 cursor-pointer"
                    onClick={() => router.push(`/${locale}/friend_list`)}
                  />
                </div>
              )}
              <NotificationDropdown />
              <div className="hover:bg-gray-200 focus:outline-none relative p-2 rounded-full">
                <FaChess
                  onClick={() =>
                    router.push(
                      `/${locale}/chess_appointment/chess_appointment_order`
                    )
                  }
                  className="h-6 w-6 text-yellow-700 cursor-pointer"
                />
              </div>
              <ProfileMenu />
            </div>
          ) : (
            <div className="flex items-center gap-x-2">
              <FaChess
                onClick={() =>
                  router.push(
                    `/${locale}/chess_appointment/chess_appointment_order`
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
                    onClick={() => router.push(`/${localActive}/-register`)}
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
    </>
  );
}

export default Navbar;
