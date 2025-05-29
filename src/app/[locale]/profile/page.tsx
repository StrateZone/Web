"use client";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Badge,
  Tooltip,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
} from "@material-tailwind/react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

// Define TypeScript interface for user data
interface UserData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  bio: string;
  address: string;
  ranking: string;
  status: string;
  imageUrl: string | null;
  userRole: string;
  userLabel: string;
  membershipExpiry: string | null; // Assuming it's a string (e.g., ISO date or null)
}

function ProfilePage() {
  // State for user data
  const [userData, setUserData] = useState<UserData>({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    bio: "",
    address: "",
    ranking: "basic",
    status: "Active",
    imageUrl: null,
    userRole: "",
    userLabel: "",
    membershipExpiry: null, // Initialize new field
  });

  // Store original user data for cancel functionality
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(
    null
  );

  // State for edit mode and changes
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Check if user is a member or top contributor
  const isMember = userData.userRole === "Member";
  const isTopContributor = userData.userLabel === "top_contributor";

  // Password regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  // Toggle password visibility
  const toggleOldPasswordVisibility = () =>
    setShowOldPassword(!showOldPassword);
  const toggleNewPasswordVisibility = () =>
    setShowNewPassword(!showNewPassword);
  const toggleConfirmNewPasswordVisibility = () =>
    setShowConfirmNewPassword(!showConfirmNewPassword);

  // Helper function to get user ID
  const getUserId = () => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    return authData.userId;
  };

  // Singleton for refresh token
  let isRefreshing = false;
  let refreshPromise: Promise<void> | null = null;

  // Handle token expiration with axios
  const handleTokenExpiration = async (retryCallback: () => Promise<void>) => {
    if (isRefreshing) {
      await refreshPromise;
      await retryCallback();
      return;
    }

    isRefreshing = true;
    refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Không có refresh token, vui lòng đăng nhập lại");
        }

        console.log("Sending refreshToken:", refreshToken);
        const response = await fetch(
          `${API_BASE_URL}/api/auth/refresh-token?refreshToken=${encodeURIComponent(
            refreshToken
          )}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Lỗi refresh token:", errorData);
          throw new Error(errorData || "Không thể làm mới token");
        }

        const data = await response.json();
        if (!data.data?.newToken) {
          throw new Error("Không có token mới trong phản hồi");
        }

        localStorage.setItem("accessToken", data.data.newToken);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }

        console.log("Refresh token thành công:", {
          newToken: data.data.newToken,
          newRefreshToken: data.data.refreshToken,
        });

        await retryCallback();
        resolve();
      } catch (error) {
        console.error("Refresh token thất bại:", error);
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("refreshToken");
        // localStorage.removeItem("authData");
        // document.cookie =
        //   "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        // document.cookie =
        //   "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        // window.location.href = "/login";
        reject(error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    });

    await refreshPromise;
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          toast.error("Vui lòng đăng nhập để xem thông tin!");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/users/${userId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const userInfo = response.data;
        const newUserData: UserData = {
          username: userInfo.username || "",
          fullName: userInfo.fullName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          gender: userInfo.gender || "male",
          bio: userInfo.bio || "",
          address: userInfo.address || "",
          ranking: userInfo.ranking || "basic",
          status: userInfo.status || "Active",
          imageUrl: userInfo.avatarUrl || null,
          userRole: userInfo.userRole || "",
          userLabel: userInfo.userLabel || "",
          membershipExpiry: userInfo.membershipExpiry || null, // Add new field
        };

        setUserData(newUserData);
        setOriginalUserData(newUserData);
        setPreviewImage(userInfo.avatarUrl || null);
      } catch (error: any) {
        if (error.response?.status === 401) {
          await handleTokenExpiration(loadUserData);
          return;
        }
        console.error("Lỗi tải thông tin người dùng:", error);
        toast.error("Không thể tải thông tin người dùng!");
      }
    };

    loadUserData();
  }, []);

  // Handle input changes for profile
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new password change with regex validation
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);

    setNewPasswordError(
      !value
        ? "Mật khẩu mới không được bỏ trống"
        : !passwordRegex.test(value)
          ? "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
          : ""
    );

    if (confirmNewPassword) {
      setConfirmNewPasswordError(
        value !== confirmNewPassword ? "Mật khẩu xác nhận không khớp" : ""
      );
    }
  };

  // Handle confirm new password change
  const handleConfirmNewPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmNewPassword(value);
    setConfirmNewPasswordError(
      value !== newPassword ? "Mật khẩu xác nhận không khớp" : ""
    );
  };

  const translateGender = (gender: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      default:
        return gender;
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error("Vui lòng đăng nhập để cập nhật hồ sơ!");
        return;
      }

      let newAvatarUrl = userData.imageUrl;

      if (previewImage && previewImage.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("Type", "avatar");
        formData.append("EntityId", userId.toString());

        const blob = await fetch(previewImage).then((r) => r.blob());
        formData.append("ImageFile", blob, "avatar.jpg");

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/images/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.status === 401) {
          await handleTokenExpiration(handleSaveProfile);
          return;
        }
        newAvatarUrl = uploadResponse.data.url;
      }

      const updateData = {
        fullName: userData.fullName,
        phone: userData.phone,
        gender: userData.gender,
        bio: userData.bio,
        address: userData.address,
        avatarUrl: newAvatarUrl,
        userRole: userData.userRole,
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userId}`,
        updateData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(handleSaveProfile);
        return;
      }

      const updatedUserData: UserData = {
        ...userData,
        ...updateData,
        imageUrl: newAvatarUrl,
      };

      setUserData(updatedUserData);
      setOriginalUserData(updatedUserData);
      setIsEditing(false);
      toast.success("Cập nhật thông tin tài khoản thành công");
    } catch (error: any) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật hồ sơ. Vui lòng thử lại!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save password changes
  const handleSavePassword = async () => {
    setPasswordChangeError("");
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError("Vui lòng nhập đầy đủ các trường mật khẩu!");
      return;
    }
    if (newPasswordError || confirmNewPasswordError) {
      setPasswordChangeError("Vui lòng sửa các lỗi trong mật khẩu!");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error("Vui lòng đăng nhập để đổi mật khẩu!");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/password/${userId}`,
        {
          oldPassword,
          newPassword,
          ConfirmPassword: confirmNewPassword,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        await handleTokenExpiration(handleSavePassword);
        return;
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setNewPasswordError("");
      setConfirmNewPasswordError("");
      setIsPasswordModalOpen(false);
      toast.success("Đổi mật khẩu thành công!");
    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu:", error);
      if (error.response?.status === 401) {
        await handleTokenExpiration(handleSavePassword);
        return;
      }

      const errorMap: { [key: string]: string } = {
        "Incorrect password": "Mật khẩu cũ không chính xác!",
        "Password too weak": "Mật khẩu mới quá yếu!",
      };
      setPasswordChangeError(
        errorMap[error.response?.data?.message] ||
          error.response?.data?.message ||
          "Đổi mật khẩu không thành công!"
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (originalUserData) {
      setUserData(originalUserData);
      setPreviewImage(originalUserData.imageUrl);
    }
    setIsEditing(false);
  };

  // Cancel password modal
  const handleCancelPassword = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setNewPasswordError("");
    setConfirmNewPasswordError("");
    setPasswordChangeError("");
    setIsPasswordModalOpen(false);
  };

  return (
    <div>
      <Navbar />
      <Banner
        title="Hồ Sơ Cá Nhân"
        subtitle="Quản lý thông tin tài khoản của bạn"
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-[9999]"
      />

      <div className="max-w-6xl mx-auto p-6 text-black">
        <div
          className={`bg-white rounded-lg shadow-md p-6 ${
            isMember ? "border-2 border-purple-500 shadow-purple-500/30" : ""
          }`}
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                <Badge
                  overlap="circular"
                  placement="bottom-end"
                  className={`border-2 border-white ${
                    isMember
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"
                      : "bg-blue-gray-100"
                  } !h-5 !w-5`}
                >
                  <Avatar
                    src={
                      previewImage ||
                      "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                    }
                    alt={userData.username}
                    size="xxl"
                    className={`border-2 ${
                      isMember
                        ? "border-purple-500 shadow-lg shadow-purple-500/30"
                        : "border-blue-500 shadow-lg shadow-blue-500/20"
                    }`}
                  />
                </Badge>
                {(isMember || isTopContributor) && (
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    {isMember && (
                      <Tooltip content="Thành viên câu lạc bộ">
                        <CheckBadgeIcon className="h-4 w-4 text-white" />
                      </Tooltip>
                    )}
                  </div>
                )}
                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Thay đổi ảnh đại diện
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-2 mb-4">
                <h2
                  className={`text-2xl font-bold ${
                    isMember ? "text-purple-700" : "text-gray-900"
                  }`}
                >
                  {userData.username}
                </h2>
                <div className="flex gap-2">
                  {isMember && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-bounce">
                      MEMBER
                    </span>
                  )}
                  {isTopContributor && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-bounce">
                      TOP CONTRIBUTOR
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { field: "username", label: "Tên Tài Khoản" },
                  { field: "email", label: "Email" },
                  { field: "phone", label: "Số Điện Thoại" },
                ].map((item) => (
                  <div key={item.field} className="mb-4">
                    <label
                      className={`block text-base font-bold ${
                        isMember ? "text-purple-700" : "text-gray-700"
                      } mb-1`}
                    >
                      {item.label}
                    </label>
                    <input
                      name={item.field}
                      value={userData[item.field as keyof UserData] as string}
                      readOnly
                      className={`w-full px-3 py-2 border ${
                        isMember
                          ? "border-purple-300 bg-purple-50"
                          : "border-gray-300 bg-gray-100"
                      } rounded-md shadow-sm cursor-not-allowed`}
                    />
                  </div>
                ))}

                {/* Add Membership Expiry Field */}
                {isMember && (
                  <div className="mb-4">
                    <label
                      className={`block text-base font-bold ${
                        isMember ? "text-purple-700" : "text-gray-700"
                      } mb-1`}
                    >
                      Ngày Hết Hạn Thành Viên
                    </label>
                    <p
                      className={`text-gray-900 py-2 px-3 ${
                        isMember ? "bg-purple-50" : "bg-gray-50"
                      } rounded-md`}
                    >
                      {userData.membershipExpiry
                        ? new Date(
                            userData.membershipExpiry
                          ).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Không có thông tin"}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label
                    className={`block text-base font-bold ${
                      isMember ? "text-purple-700" : "text-gray-700"
                    } mb-1`}
                  >
                    Họ Và Tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        isMember
                          ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } rounded-md shadow-sm focus:outline-none`}
                    />
                  ) : (
                    <p
                      className={`text-gray-900 py-2 px-3 ${
                        isMember ? "bg-purple-50" : "bg-gray-50"
                      } rounded-md`}
                    >
                      {userData.fullName || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-base font-bold ${
                      isMember ? "text-purple-700" : "text-gray-700"
                    } mb-1`}
                  >
                    Giới Tính
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={userData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        isMember
                          ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } rounded-md shadow-sm focus:outline-none`}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  ) : (
                    <p
                      className={`text-gray-900 py-2 px-3 ${
                        isMember ? "bg-purple-50" : "bg-gray-50"
                      } rounded-md`}
                    >
                      {translateGender(userData.gender)}
                    </p>
                  )}
                </div>
              </div>

              {/* Rest of the fields (address, bio, etc.) remain unchanged */}
              <div className="mb-4">
                <label
                  className={`block text-base font-bold ${
                    isMember ? "text-purple-700" : "text-gray-700"
                  } mb-1`}
                >
                  Địa Chỉ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      isMember
                        ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm focus:outline-none`}
                  />
                ) : (
                  <p
                    className={`text-gray-900 py-2 px-3 ${
                      isMember ? "bg-purple-50" : "bg-gray-50"
                    } rounded-md`}
                  >
                    {userData.address || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className={`block text-base font-bold ${
                    isMember ? "text-purple-700" : "text-gray-700"
                  } mb-1`}
                >
                  Mô Tả Bản Thân
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border ${
                      isMember
                        ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm focus:outline-none`}
                  />
                ) : (
                  <p
                    className={`text-gray-900 py-2 px-3 ${
                      isMember ? "bg-purple-50" : "bg-gray-50"
                    } rounded-md`}
                  >
                    {userData.bio || "Chưa có thông tin"}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className={`px-4 py-2 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium ${
                    isMember
                      ? "bg-blue-600 text-white focus:ring-blue-500"
                      : "bg-gray-600 text-white focus:ring-gray-500"
                  }`}
                >
                  Đổi Mật Khẩu
                </Button>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className={`px-4 py-2 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium ${
                      isMember
                        ? "bg-purple-600 text-white focus:ring-purple-500"
                        : "bg-blue-600 text-white focus:ring-blue-500"
                    }`}
                  >
                    Chỉnh Sửa
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium ${
                        !isLoading
                          ? isMember
                            ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                            : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPasswordModalOpen} handler={setIsPasswordModalOpen}>
        <DialogHeader>Đổi Mật Khẩu</DialogHeader>
        <DialogBody divider>
          <div className="grid gap-6">
            <div>
              <label
                className={`block text-base font-bold ${
                  isMember ? "text-purple-700" : "text-gray-700"
                } mb-1`}
              >
                Mật Khẩu Cũ
              </label>
              <Input
                type={showOldPassword ? "text" : "password"}
                crossOrigin="anonymous"
                icon={
                  <button
                    type="button"
                    onClick={toggleOldPasswordVisibility}
                    className="focus:outline-none"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`w-full px-3 py-2 border ${
                  isMember
                    ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } rounded-md shadow-sm focus:outline-none`}
              />
            </div>
            <div>
              <label
                className={`block text-base font-bold ${
                  isMember ? "text-purple-700" : "text-gray-700"
                } mb-1`}
              >
                Mật Khẩu Mới
              </label>
              <Input
                type={showNewPassword ? "text" : "password"}
                crossOrigin="anonymous"
                icon={
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={`w-full px-3 py-2 border ${
                  isMember
                    ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } rounded-md shadow-sm focus:outline-none ${
                  newPasswordError ? "border-red-500" : ""
                }`}
              />
              {newPasswordError && (
                <p className="text-red-500 text-xs mt-1">{newPasswordError}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-base font-bold ${
                  isMember ? "text-purple-700" : "text-gray-700"
                } mb-1`}
              >
                Xác Nhận Mật Khẩu Mới
              </label>
              <Input
                type={showConfirmNewPassword ? "text" : "password"}
                crossOrigin="anonymous"
                icon={
                  <button
                    type="button"
                    onClick={toggleConfirmNewPasswordVisibility}
                    className="focus:outline-none"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                }
                value={confirmNewPassword}
                onChange={handleConfirmNewPasswordChange}
                className={`w-full px-3 py-2 border ${
                  isMember
                    ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } rounded-md shadow-sm focus:outline-none ${
                  confirmNewPasswordError ? "border-red-500" : ""
                }`}
              />
              {confirmNewPasswordError && (
                <p className="text-red-500 text-xs mt-1">
                  {confirmNewPasswordError}
                </p>
              )}
            </div>
            {passwordChangeError && (
              <p className="text-red-500 text-sm">{passwordChangeError}</p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleCancelPassword}
            className="mr-1"
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            color={isMember ? "purple" : "green"}
            onClick={handleSavePassword}
            disabled={
              isPasswordLoading ||
              !!newPasswordError ||
              !!confirmNewPasswordError
            }
          >
            {isPasswordLoading ? "Đang lưu..." : "Lưu Mật Khẩu"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Footer />
    </div>
  );
}

export default ProfilePage;
