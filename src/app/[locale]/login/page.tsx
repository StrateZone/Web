"use client";
import React, { useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Input, Button } from "@material-tailwind/react";
import axios from "axios";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const localActive = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email không được bỏ trống");
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async () => {
    if (!emailError && email) {
      setLoading(true);
      try {
        const response = await axios.post(
          `https://backend-production-ac5e.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email)}`,
        );

        if (
          response.data?.success === false ||
          response.data?.statusCode === 404
        ) {
          toast.error("Tài khoản không tồn tại. Vui lòng kiểm tra lại email.");
          return;
        }

        router.push(
          `/${localActive}/otp_verification?email=${encodeURIComponent(email)}`,
        );
      } catch (error) {
        console.log(error);
        toast.error("Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{ marginTop: "120px", marginBottom: "50px" }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold text-white">
                  Đăng nhập
                </h3>
                <p className="text-sm text-gray-300">
                  Chào mừng trở lại! Vui lòng nhập thông tin tài khoản của bạn.
                </p>
              </div>
              <div className="relative w-full">
                <Input
                  label={"Email"}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  icon={<User size={20} />}
                  maxLength={50}
                  crossOrigin="anonymous"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  error={!!emailError}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px] flex items-center justify-center min-h-12"
                onClick={handleLogin}
                disabled={loading || !!emailError || !email}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang gửi OTP...</span>
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              <p>
                Bạn chưa có tài khoản?{" "}
                <Link
                  href={`/${localActive}/register`}
                  className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
                >
                  Đăng ký miễn phí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
