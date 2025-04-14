"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

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

      // Start countdown
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
      setError("Không thể gửi lại mã OTP, vui lòng thử lại sau!");
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
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{ marginTop: "80px" }}
          className="relative w-full max-w-screen-sm mx-auto border border-white bg-transparent bg-opacity-90 backdrop-blur-sm p-6 rounded-md shadow-md"
        >
          <div className="text-white text-center flex flex-col gap-3">
            <h3 className="text-3xl font-bold text-white">Nhập mã OTP</h3>
            <p className="text-sm text-gray-300">
              Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến email{" "}
              <b>{email}</b>.
            </p>

            {/* Input OTP */}
            <div className="flex justify-center space-x-4">
              {otp.map((num, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  className="bg-zinc-900 border border-zinc-700 w-12 h-12 text-center text-lg font-bold rounded-lg outline-none text-black"
                  value={num}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  maxLength={1}
                  onPaste={index === 0 ? handlePaste : undefined}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Verify OTP Button */}
            <Button
              onClick={handleVerifyOTP}
              disabled={verifyLoading || otp.join("").length !== 6}
              className="w-full font-bold bg-black text-white py-2 rounded border border-gray-500 hover:bg-gray-800 transition duration-150 ease-in-out mt-3 flex items-center justify-center min-h-12"
            >
              {verifyLoading ? (
                <div className="flex items-center gap-2">
                  <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xác thực...</span>
                </div>
              ) : (
                "Xác nhận OTP"
              )}
            </Button>

            {/* Resend OTP Section */}
            <div className="text-center text-sm mt-3">
              <p className="ml-28 flex items-center">
                Bạn chưa nhận được mã OTP?
                {isResendDisabled ? (
                  <span className="ml-2 text-gray-400">
                    Gửi lại sau {timer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="ml-2 font-semibold text-gray-200 hover:text-gray-400 inline-flex items-center text-light-blue-600"
                  >
                    {resendLoading ? (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      "Gửi lại mã"
                    )}
                  </button>
                )}
              </p>

              <p className="mt-2">
                Bạn đã có tài khoản?
                <Link
                  href="/login"
                  className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400 ml-1"
                >
                  Đăng nhập ngay
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
