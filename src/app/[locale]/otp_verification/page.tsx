"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";

export default function OTPVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [email, router]);

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số.");
      return;
    }

    try {
      setVerifyLoading(true);
      setError("");

      const verifyUrl =
        "https://backend-production-ac5e.up.railway.app/api/auth/verify-otp";
      const verifyResponse = await axios.post(
        verifyUrl,
        { email, otp: otpCode },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || "Xác thực OTP thất bại");
      }

      const userUrl = `https://backend-production-ac5e.up.railway.app/api/users/email/${encodeURIComponent(email || "")}`;
      const userResponse = await axios.get(userUrl, {
        headers: {
          Authorization: `Bearer ${verifyResponse.data.data.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const userData = {
        ...verifyResponse.data.data,
        userInfo: userResponse.data,
      };

      localStorage.setItem("authData", JSON.stringify(userData));
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);

      // Save cookies to match handleLogin, without HttpOnly

      document.cookie = `accessToken=${encodeURIComponent(userData.accessToken)}; path=/; max-age=604800; SameSite=Strict`;
      document.cookie = `refreshToken=${encodeURIComponent(userData.refreshToken)}; path=/; max-age=604800; SameSite=Strict`;

      router.push("/chess_appointment");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid or expired OTP")) {
          setError("Mã OTP không đúng hoặc đã hết hạn, vui lòng gửi lại.");
        }
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setIsResendDisabled(true);
      setTimer(30);

      const loginUrl = `https://backend-production-ac5e.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email || "")}`;
      await axios.post(
        loginUrl,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Mã OTP mới đã được gửi!");

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      toast.error("Không thể gửi lại mã OTP, vui lòng thử lại sau!");
      setIsResendDisabled(false);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const inputsRef = useRef<HTMLInputElement[]>([]);
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative flex-grow w-full h-[800px] bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div className="relative w-full max-w-md mx-auto my-32 px-4 sm:px-0">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl p-8 border border-white border-opacity-20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                Xác thực OTP
              </h3>
              <p className="text-gray-300">
                Mã OTP đã được gửi đến{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center space-x-4">
                {otp.map((num, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    className="bg-transparent border-b-2 border-white w-10 h-12 text-center text-xl font-bold text-white outline-none focus:border-blue-500"
                    value={num}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    maxLength={1}
                    onPaste={index === 0 ? handlePaste : undefined}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}

              <div className="pt-2">
                <Button
                  className="w-full font-bold bg-black text-white py-3 rounded-lg border border-gray-300 flex items-center justify-center min-h-12 hover:bg-gray-900 transition-colors"
                  onClick={handleVerifyOTP}
                  disabled={verifyLoading || otp.join("").length !== 6}
                >
                  {verifyLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang xác thực...</span>
                    </div>
                  ) : (
                    "Xác nhận OTP"
                  )}
                </Button>
              </div>

              <div className="text-center text-sm mt-4">
                <p className="text-gray-300">
                  {isResendDisabled ? (
                    <span>Gửi lại mã sau {timer}s</span>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="font-semibold text-white hover:underline cursor-pointer"
                    >
                      {resendLoading ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Đang gửi...
                        </span>
                      ) : (
                        "Gửi lại mã OTP"
                      )}
                    </button>
                  )}
                </p>
              </div>

              <div className="text-center text-sm">
                <p className="text-gray-300">
                  Quay lại{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-white hover:underline cursor-pointer"
                  >
                    Đăng nhập
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
