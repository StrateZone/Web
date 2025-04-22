"use client";
import React, { useState } from "react";
import { User, Eye, EyeOff, Mail } from "lucide-react";
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
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    validatePassword(e.target.value);
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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Mật khẩu không được bỏ trống");
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
    } else {
      setPasswordError("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    validateEmail(email);
    validatePassword(password);

    if (!emailError && !passwordError && email && password) {
      setLoading(true);
      try {
        const response = await axios.post(
          "https://backend-production-ac5e.up.railway.app/api/auth/login",
          {
            email: email,
            password: password,
          },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "*/*",
            },
          }
        );

        // Xử lý khi login thành công
        if (response.data?.success === true) {
          // Lấy data từ response
          const responseData = response.data.data;

          // Chuẩn bị dữ liệu user để lưu trữ
          const authData = {
            userId: responseData.userId,
            username: responseData.username,
            email: responseData.email,
            fullName: responseData.fullName,
            phone: responseData.phone,
            gender: responseData.gender,
            userRole: responseData.userRole,
            status: responseData.status,
            wallet: responseData.wallet,
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            imageUrl: responseData.imageUrl,
            skillLevel: responseData.skillLevel,
            ranking: responseData.ranking,
          };

          // Lưu vào localStorage
          localStorage.setItem("authData", JSON.stringify(authData));
          localStorage.setItem("accessToken", responseData.accessToken);
          localStorage.setItem("refreshToken", responseData.refreshToken);

          // Thông báo và chuyển hướng
          toast.success(response.data.message || "Đăng nhập thành công!");
          router.push("/chess_appointment");
        } else if (response.data?.success === false) {
          // Xử lý các trường hợp thất bại
          if (
            response.data?.message === "Tài khoản chưa được xác thực email."
          ) {
            router.push(
              `/${localActive}/otp_verification?email=${encodeURIComponent(email)}`
            );
            toast.warning(
              "Tài Khoản Vẫn Chưa Được Kích Hoạt, Vui lòng xác thực email trước khi đăng nhập"
            );
          } else if (response.data?.message === "User doesnt exist") {
            toast.error(
              "Tài khoản không tồn tại. Vui lòng kiểm tra lại email."
            );
          } else if (response.data?.message === "Invalid email or password") {
            toast.error(
              "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại."
            );
          } else {
            toast.error(response.data?.message || "Đăng nhập thất bại");
          }
        }
      } catch (error: any) {
        console.error("Login error:", error);
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpLogin = async () => {
    router.push(`/${localActive}/login_otp`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative flex-grow w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div className="relative w-full max-w-md mx-auto my-32 px-4 sm:px-0">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl p-8 border border-white border-opacity-20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">Đăng nhập</h3>
              <p className="text-gray-300">
                Chào mừng trở lại! Vui lòng nhập thông tin tài khoản của bạn.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Input
                  label="Email"
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  icon={<Mail size={20} />}
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
                  <p className="text-red-400 text-xs mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <Input
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  color="white"
                  variant="standard"
                  size="lg"
                  className="text-white"
                  icon={
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                  maxLength={50}
                  crossOrigin="anonymous"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  error={!!passwordError}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
                {passwordError && (
                  <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  className="w-full font-bold bg-black text-white py-3 rounded-lg border border-gray-300 flex items-center justify-center min-h-12 hover:bg-gray-900 transition-colors"
                  onClick={handleLogin}
                  disabled={
                    loading ||
                    !!emailError ||
                    !!passwordError ||
                    !email ||
                    !password
                  }
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-300">hoặc</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <Button
                className="w-full font-bold bg-white text-gray-800 py-3 rounded-lg border border-gray-300 flex items-center justify-center min-h-12 hover:bg-gray-100 transition-colors"
                onClick={handleOtpLogin}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mail size={20} />
                  <span>Đăng nhập với OTP</span>
                </div>
              </Button>

              <div className="text-center text-sm mt-6">
                <p className="text-gray-300">
                  Bạn chưa có tài khoản?{" "}
                  <Link
                    href={`/${localActive}/register`}
                    className="font-semibold text-white hover:underline cursor-pointer"
                  >
                    Đăng ký miễn phí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
