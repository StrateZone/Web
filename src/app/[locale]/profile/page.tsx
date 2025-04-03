"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import axios from "axios";
import React, { useState, useEffect } from "react";

function ProfilePage() {
  // State for user data
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    bio: "",
    address: "",
    skillLevel: "",
    ranking: "",
    status: "",
    imageUrl: null as string | null,
  });

  // State for edit mode and changes
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");

      // Nếu có userInfo trong localStorage
      if (authData.userInfo) {
        setUserData({
          username: authData.userInfo.username || "",
          fullName: authData.userInfo.fullName || "",
          email: authData.userInfo.email || "",
          phone: authData.userInfo.phone || "",
          gender: authData.userInfo.gender || "male",
          bio: authData.userInfo.bio || "",
          address: authData.userInfo.address || "",
          skillLevel: authData.userInfo.skillLevel || "beginner",
          ranking: authData.userInfo.ranking || "basic",
          status: authData.userInfo.status || "Active",
          imageUrl: authData.userInfo.avatarUrl || null,
        });
        setPreviewImage(authData.userInfo.avatarUrl || null);
      } else {
        // Nếu không có, thử gọi API để lấy thông tin
        try {
          const userId = authData.userId;
          const accessToken = authData.accessToken;

          if (userId && accessToken) {
            const response = await axios.get(
              `https://backend-production-ac5e.up.railway.app/api/users/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            // Cập nhật state và localStorage
            const userInfo = response.data;
            setUserData({
              username: userInfo.username || "",
              fullName: userInfo.fullName || "",
              email: userInfo.email || "",
              phone: userInfo.phone || "",
              gender: userInfo.gender || "male",
              bio: userInfo.bio || "",
              address: userInfo.address || "",
              skillLevel: userInfo.skillLevel || "beginner",
              ranking: userInfo.ranking || "basic",
              status: userInfo.status || "Active",
              imageUrl: userInfo.avatarUrl || null,
            });
            setPreviewImage(userInfo.avatarUrl || null);

            // Lưu vào localStorage
            localStorage.setItem(
              "authData",
              JSON.stringify({
                ...authData,
                userInfo,
              })
            );
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error);
        }
      }
    };

    loadUserData();
  }, []);

  // Handle input changes
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
    setHasChanges(true);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Hiển thị preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setUserData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);

      // Nếu bạn cần upload ảnh lên server trước
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const uploadResponse = await axios.post('/api/upload', formData);
      // setUserData(prev => ({
      //   ...prev,
      //   imageUrl: uploadResponse.data.url
      // }));
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
    }
  };

  // Save changes
  const handleSave = async () => {
    try {
      // Lấy userId và accessToken từ localStorage
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");
      const userId = authData.userInfo?.userId;
      const accessToken = authData.accessToken;

      if (!userId || !accessToken) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Chỉ gửi những trường có thể chỉnh sửa
      const updateData = {
        fullName: userData.fullName,
        phone: userData.phone,
        gender: userData.gender,
        bio: userData.bio,
        address: userData.address,
        avatarUrl: userData.imageUrl, // map từ imageUrl trong state sang avatarUrl trong API
      };

      // Gọi API cập nhật
      const response = await axios.put(
        `https://backend-production-ac5e.up.railway.app/api/users/${userId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật localStorage với dữ liệu mới
      const updatedAuthData = {
        ...authData,
        userInfo: {
          ...authData.userInfo,
          ...updateData,
        },
      };
      localStorage.setItem("authData", JSON.stringify(updatedAuthData));

      setHasChanges(false);
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
      setPreviewImage(parsedData.imageUrl || null);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  return (
    <div>
      <div>
        <Navbar />
        {/* Banner */}
        <div className="relative font-sans">
          <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
          <img
            src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
            alt="Banner Image"
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
          <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
            <h2 className="sm:text-4xl text-2xl font-bold mb-6">
              Hồ Sơ Cá Nhân
            </h2>
            <p className="sm:text-lg text-base text-center text-gray-200">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto p-6 text-black">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column - Profile Image */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden border-4 border-gray-300">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Thay đổi ảnh đại diện
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Profile Info */}
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username - Read Only */}
                  <div className="mb-4">
                    <label className="block text-base font-bold text-gray-700 mb-1">
                      Tên Tài Khoản
                    </label>
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {userData.username}
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="block text-base font-bold text-gray-700 mb-1">
                      Họ Và Tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={userData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {userData.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email - Read Only */}
                  <div className="mb-4">
                    <label className="block text-base font-bold text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {userData.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-base font-bold text-gray-700 mb-1">
                      Số Điện Thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {userData.phone}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="mb-4">
                    <label className="block text-base font-bold text-gray-700 mb-1">
                      Giới Tính
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={userData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                        {userData.gender === "male" ? "Nam" : "Nữ"}
                      </p>
                    )}
                  </div>

                  {/* Skill Level - Read Only */}
                  <div className="mb-4">
                    <label className="block text-base font-bold text-gray-700 mb-1">
                      Trình Độ
                    </label>
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md capitalize">
                      {userData.skillLevel === "beginner" && "Mới bắt đầu"}
                      {userData.skillLevel === "intermediate" && "Trung cấp"}
                      {userData.skillLevel === "advanced" && "Nâng cao"}
                      {userData.skillLevel === "expert" && "Chuyên gia"}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="block text-base font-bold text-gray-700 mb-1">
                    Địa Chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {userData.address || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <label className="block text-base font-bold text-gray-700 mb-1">
                    Giới Thiệu Bản Thân
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={userData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {userData.bio || "Chưa có thông tin giới thiệu"}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                      Chỉnh Sửa Hồ Sơ
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium ${
                          hasChanges
                            ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                            : "bg-gray-400 text-gray-700 cursor-not-allowed"
                        }`}
                      >
                        Lưu Thay Đổi
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default ProfilePage;
