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
  const email = searchParams.get("email"); // ✅ Lấy email từ URL
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    if (!email) {
      router.push("/login"); // Nếu không có email, quay về login
    }

    // Đếm ngược khi trang load
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

  // Xử lý nhập OTP
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép nhập số
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Xử lý xác nhận OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số.");
      return;
    }

    try {
      const loginUrl =
        "https://backend-production-5bc5.up.railway.app/api/auth/verify-otp";

      console.log("Đang gửi API xác nhận OTP:", { email, otp: otpCode });

      const response = await axios.post(
        loginUrl,
        { email, otp: otpCode },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Phản hồi từ API:", response.data);

      // Kiểm tra nếu response có chứa "data"
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
          router.push("/chess_apponitment");
        } else {
          setError("OTP không hợp lệ, vui lòng thử lại!");
        }
      } else {
        setError("OTP không hợp lệ, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setError("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  // Xử lý gửi lại mã OTP
  const handleResendOTP = async () => {
<<<<<<< HEAD
<<<<<<< HEAD
    try {
      setIsResendDisabled(true);
      setTimer(30); // Reset bộ đếm về 30s

=======
    setIsResendDisabled(true);
    setTimer(30); // Reset bộ đếm về 30s

    try {
>>>>>>> f61d03a (Update login, OTP verification, and registration flow)
=======
    try {
      setIsResendDisabled(true);
      setTimer(30); // Reset bộ đếm về 30s

>>>>>>> dc47781 (add appoinment flow)
      const loginUrl = `https://backend-production-5bc5.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email || "")}`;

      console.log("Đang gửi API yêu cầu gửi lại OTP:", { email });

<<<<<<< HEAD
<<<<<<< HEAD
      const response = await axios.post(
        loginUrl,
        {},
        {
          // ✅ Để body rỗng vì API chỉ cần email trên URL
=======
      await axios.post(
=======
      const response = await axios.post(
>>>>>>> dc47781 (add appoinment flow)
        loginUrl,
        {},
        {
<<<<<<< HEAD
>>>>>>> f61d03a (Update login, OTP verification, and registration flow)
=======
          // ✅ Để body rỗng vì API chỉ cần email trên URL
>>>>>>> dc47781 (add appoinment flow)
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

<<<<<<< HEAD
<<<<<<< HEAD
      console.log("Gửi lại OTP thành công!", response.data);
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      setError("Không thể gửi lại mã OTP, vui lòng thử lại sau!");
      setIsResendDisabled(false); // ✅ Nếu lỗi thì mở lại nút "Gửi lại mã"
=======
      console.log("Gửi lại OTP thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      setError("Không thể gửi lại mã OTP, vui lòng thử lại sau!");
>>>>>>> f61d03a (Update login, OTP verification, and registration flow)
=======
      console.log("Gửi lại OTP thành công!", response.data);
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      setError("Không thể gửi lại mã OTP, vui lòng thử lại sau!");
      setIsResendDisabled(false); // ✅ Nếu lỗi thì mở lại nút "Gửi lại mã"
>>>>>>> dc47781 (add appoinment flow)
    }

    // Bắt đầu đếm ngược lại 30 giây
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
  };
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> f61d03a (Update login, OTP verification, and registration flow)
=======

>>>>>>> dc47781 (add appoinment flow)
  const inputsRef = useRef<HTMLInputElement[]>([]); // Khai báo useRef

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim(); // Lấy dữ liệu từ clipboard

    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      // Kiểm tra nếu chuỗi có đúng 6 ký tự số
      setOtp(pastedData.split("")); // Cập nhật toàn bộ OTP
      inputsRef.current[5]?.focus(); // Chuyển focus đến ô cuối cùng
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
                  onPaste={index === 0 ? handlePaste : undefined} // Chỉ lắng nghe paste ở ô đầu tiên
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Nút xác nhận OTP */}
            <Button
              onClick={handleVerifyOTP}
              className="w-full font-bold bg-black text-white py-2 rounded border border-gray-500 hover:bg-gray-800 transition duration-150 ease-in-out mt-3"
            >
              Xác nhận OTP
            </Button>

            {/* Gửi lại mã OTP */}
            <div className="text-center text-sm mt-3">
              <p>
                Bạn chưa nhận được mã OTP?
                {isResendDisabled ? (
                  <span className="ml-2 text-gray-400">
                    Gửi lại sau {timer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="ml-2 font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
                  >
                    Gửi lại mã
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
