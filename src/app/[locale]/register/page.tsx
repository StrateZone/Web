"use client";
import React, { useState, useEffect } from "react";
import { User, Eye, EyeOff, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button, Input, Select, Option } from "@material-tailwind/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const localActive = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [addressError, setAddressError] = useState("");

  const router = useRouter();

  // Regex patterns
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const phoneRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  // Validate form
  useEffect(() => {
    const isValid =
      emailRegex.test(email) &&
      passwordRegex.test(password) &&
      password === confirmPassword &&
      displayName.trim() !== "" &&
      phoneRegex.test(phoneNumber) &&
      fullName.trim() !== "" &&
      gender !== "" &&
      address.trim() !== "" &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError &&
      !displayNameError &&
      !phoneNumberError &&
      !fullNameError &&
      !genderError &&
      !addressError;
    setIsFormValid(isValid);
  }, [
    email,
    password,
    confirmPassword,
    displayName,
    phoneNumber,
    fullName,
    gender,
    address,
    emailError,
    passwordError,
    confirmPasswordError,
    displayNameError,
    phoneNumberError,
    fullNameError,
    genderError,
    addressError,
  ]);

  // Field handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      !value
        ? "Email không được bỏ trống"
        : !emailRegex.test(value)
          ? "Email không hợp lệ"
          : "",
    );
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    setPasswordError(
      !value
        ? "Mật khẩu không được bỏ trống"
        : value.length < 8
          ? "Mật khẩu phải có ít nhất 8 ký tự"
          : !/[A-Z]/.test(value)
            ? "Mật khẩu phải chứa ít nhất 1 ký tự in hoa"
            : !/[a-z]/.test(value)
              ? "Mật khẩu phải chứa ít nhất 1 ký tự thường"
              : !/\d/.test(value)
                ? "Mật khẩu phải chứa ít nhất 1 chữ số"
                : !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
                  ? "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"
                  : "",
    );

    // Validate confirm password when password changes
    if (confirmPassword) {
      setConfirmPasswordError(
        value !== confirmPassword ? "Mật khẩu không khớp" : "",
      );
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(
      !value
        ? "Vui lòng nhập lại mật khẩu"
        : value !== password
          ? "Mật khẩu không khớp"
          : "",
    );
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    setDisplayNameError(!value ? "Tên tài khoản không được để trống" : "");
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (!/^\d*$/.test(input)) return;
    setPhoneNumber(input);
    setPhoneNumberError(
      !input
        ? "Số điện thoại không được để trống"
        : input.length !== 10
          ? "Số điện thoại phải có 10 chữ số"
          : "",
    );
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setFullNameError(!value ? "Họ và tên không được để trống" : "");
  };

  const handleGenderChange = (value: string) => {
    setGender(value);
    setGenderError(!value ? "Vui lòng chọn giới tính" : "");
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setAddressError(!value ? "Địa chỉ không được để trống" : "");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFormSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://backend-production-ac5e.up.railway.app/api/auth/register",
        {
          email,
          password,
          userName: displayName,
          phoneNumber,
          fullname: fullName,
          gender,
          address,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
        );
        router.push(
          `/${localActive}/otp_verification?email=${encodeURIComponent(email)}`,
        );
      }
    } catch (error: any) {
      if (error.response?.data) {
        // Handle validation errors
        if (error.response.data.errors?.Password) {
          toast.error(error.response.data.errors.Password[0]);
        } else if (error.response.data.errors) {
          // Handle other field validation errors
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((key) => {
            if (errors[key][0]) {
              toast.error(errors[key][0]);
            }
          });
        }
        // Handle other error cases
        else {
          const errorMessage = error.response.data.message;

          if (errorMessage.includes("This username already exists.")) {
            toast.error("Tên tài khoản đã tồn tại!");
          } else if (errorMessage.includes("This email already exists.")) {
            toast.error("Email đã tồn tại!");
          } else if (
            errorMessage.includes("This phone number already exists.")
          ) {
            toast.error("Số điện thoại đã tồn tại!");
          } else {
            toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
          }
        }
      } else {
        toast.error("Lỗi máy chủ! Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative flex-grow w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <Navbar />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div className="relative w-full max-w-4xl mx-auto my-32 px-4 sm:px-0">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl p-8 border border-white border-opacity-20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">Đăng ký</h3>
              <p className="text-gray-300">
                Tạo tài khoản của bạn bằng cách điền thông tin bên dưới.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <Input
                    label="Email"
                    color="white"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    icon={<Mail size={20} />}
                    value={email}
                    onChange={handleEmailChange}
                    crossOrigin="anonymous"
                    placeholder="example@gmail.com"
                    error={!!emailError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {emailError && (
                    <p className="text-red-400 text-xs mt-1">{emailError}</p>
                  )}
                </div>

                {/* Password */}
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
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    }
                    value={password}
                    onChange={handlePasswordChange}
                    crossOrigin="anonymous"
                    error={!!passwordError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {passwordError && (
                    <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Input
                    label="Nhập lại mật khẩu"
                    type={showConfirmPassword ? "text" : "password"}
                    color="white"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    icon={
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    }
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    crossOrigin="anonymous"
                    error={!!confirmPasswordError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {confirmPasswordError && (
                    <p className="text-red-400 text-xs mt-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <Input
                    label="Tên tài khoản"
                    color="white"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    crossOrigin="anonymous"
                    error={!!displayNameError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {displayNameError && (
                    <p className="text-red-400 text-xs mt-1">
                      {displayNameError}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <Input
                    label="Số điện thoại"
                    color="white"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    crossOrigin="anonymous"
                    maxLength={10}
                    error={!!phoneNumberError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {phoneNumberError && (
                    <p className="text-red-400 text-xs mt-1">
                      {phoneNumberError}
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <Input
                    label="Họ và tên"
                    color="white"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    value={fullName}
                    onChange={handleFullNameChange}
                    crossOrigin="anonymous"
                    error={!!fullNameError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {fullNameError && (
                    <p className="text-red-400 text-xs mt-1">{fullNameError}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Select
                    label="Giới tính"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    value={gender}
                    onChange={(value) => handleGenderChange(value || "")}
                    error={!!genderError}
                  >
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                  {genderError && (
                    <p className="text-red-400 text-xs mt-1">{genderError}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <Input
                    label="Địa chỉ"
                    color="white"
                    variant="standard"
                    size="lg"
                    className="text-white"
                    icon={<MapPin size={20} />}
                    value={address}
                    onChange={handleAddressChange}
                    crossOrigin="anonymous"
                    error={!!addressError}
                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                  />
                  {addressError && (
                    <p className="text-red-400 text-xs mt-1">{addressError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 col-span-2">
              <Button
                className="w-full font-bold bg-black text-white py-3 rounded-lg border border-gray-300 flex items-center justify-center min-h-12 hover:bg-gray-900 transition-colors"
                onClick={handleFormSubmit}
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm mt-4 col-span-2">
              <p className="text-gray-300">
                Đã có tài khoản?{" "}
                <Link
                  href={`/${localActive}/login`}
                  className="font-semibold text-white hover:underline cursor-pointer"
                >
                  Đăng nhập
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
