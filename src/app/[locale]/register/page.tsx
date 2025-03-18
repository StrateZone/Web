"use client";
import React, { useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button, Input, Select, Option } from "@material-tailwind/react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RegisterPage() {
  const localActive = useLocale();
  const t = useTranslations("signupPage");

  // State lưu trữ dữ liệu input
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");

  // State lưu trữ lỗi input
  const [emailError, setEmailError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [genderError, setGenderError] = useState("");

  // Regex kiểm tra định dạng email & số điện thoại
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const phoneRegex = /^[0-9]{10}$/;

  // Xử lý nhập email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(emailRegex.test(e.target.value) ? "" : "Email không hợp lệ");
  };

  // Xử lý nhập tên hiển thị
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    setDisplayNameError(
      e.target.value ? "" : "Tên hiển thị không được để trống",
    );
  };

  // Xử lý nhập số điện thoại
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(input)) return;

    setPhoneNumber(input);
    setPhoneNumberError(
      phoneRegex.test(input) ? "" : "Số điện thoại phải có 10 chữ số",
    );
  };

  // Xử lý nhập họ và tên
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setFullNameError(e.target.value ? "" : "Họ và tên không được để trống");
  };

  // Xử lý chọn giới tính
  const handleGenderChange = (value: string) => {
    setGender(value);
    setGenderError(value ? "" : "Vui lòng chọn giới tính");
  };

  // Xử lý khi nhấn nút Đăng ký
  const handleSubmit = () => {
    if (!email || !displayName || !phoneNumber || !fullName || !gender) {
      setEmailError(email ? "" : "Email không được để trống");
      setDisplayNameError(
        displayName ? "" : "Tên hiển thị không được để trống",
      );
      setPhoneNumberError(
        phoneNumber ? "" : "Số điện thoại không được để trống",
      );
      setFullNameError(fullName ? "" : "Họ và tên không được để trống");
      setGenderError(gender ? "" : "Vui lòng chọn giới tính");
      return;
    }

    alert("Đăng ký thành công!");
  };

  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{
            marginTop: "120px",
            maxHeight: "1000px",
            minWidth: "300px",
            width: "100%",
            marginBottom: "50px",
          }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <h3 className="text-4xl font-extrabold text-white">{t("title")}</h3>
            <p className="text-sm text-gray-300">{t("description")}</p>

            {/* Email */}
            <div className="relative w-full">
              <Input
                label="Email"
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                icon={<User size={20} />}
                maxLength={50}
                value={email}
                onChange={handleEmailChange}
                crossOrigin="anonymous"
                placeholder="abc@gmail.com"
                error={!!emailError}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Tên hiển thị */}
            <div className="relative w-full">
              <Input
                label="Tên hiển thị"
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                maxLength={50}
                value={displayName}
                onChange={handleDisplayNameChange}
                crossOrigin="anonymous"
              />
              {displayNameError && (
                <p className="text-red-500 text-sm mt-1">{displayNameError}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="relative w-full">
              <Input
                label="Số điện thoại"
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                maxLength={10}
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                crossOrigin="anonymous"
              />
              {phoneNumberError && (
                <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>
              )}
            </div>

            {/* Họ và tên */}
            <div className="relative w-full">
              <Input
                label="Họ và tên"
                color="white"
                variant="standard"
                size="lg"
                className="text-white"
                maxLength={50}
                value={fullName}
                onChange={handleFullNameChange}
                crossOrigin="anonymous"
              />
              {fullNameError && (
                <p className="text-red-500 text-sm mt-1">{fullNameError}</p>
              )}
            </div>

            {/* Giới tính */}
            <div className="relative w-full">
              <Select
                label="Chọn giới tính"
                variant="standard"
                size="lg"
                className="text-white"
                value={gender}
                onChange={(value) => handleGenderChange(value || "")}
              >
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
              {genderError && (
                <p className="text-red-500 text-sm mt-1">{genderError}</p>
              )}
            </div>

            {/* Nút đăng ký */}
            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px]"
                onClick={handleSubmit}
              >
                {t("buttonSignUp")}
              </Button>
            </div>

            {/* Đã có tài khoản */}
            <p className="text-center text-sm mt-4">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href={`/${localActive}/login`}
                className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
              >
                {t("linkLogIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
