"use client";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Badge, Tooltip, Avatar } from "@material-tailwind/react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

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
    userRole: "", // Added userRole to track member status
  });

  // State for edit mode and changes
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is a member
  const isMember = userData.userRole === "Member";

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");

      // If userInfo exists in localStorage
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
          userRole: authData.userInfo.userRole || "", // Added userRole
        });
        setPreviewImage(authData.userInfo.avatarUrl || null);
      } else {
        // If not, try to fetch from API
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

            // Update state and localStorage
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
              userRole: userInfo.userRole || "", // Added userRole
            });
            setPreviewImage(userInfo.avatarUrl || null);

            // Save to localStorage
            localStorage.setItem(
              "authData",
              JSON.stringify({
                ...authData,
                userInfo,
              })
            );
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
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

  const translateSkillLevel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Mới bắt đầu";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      case "expert":
        return "Chuyên gia";
      default:
        return level;
    }
  };

  // Hàm dịch giới tính
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

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  // Save changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Get userId and accessToken from localStorage
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");
      const userId = authData.userInfo?.userId;
      const accessToken = authData.accessToken;

      if (!userId || !accessToken) {
        throw new Error("User information not found");
      }

      let newAvatarUrl = userData.imageUrl;

      // If there's a new image (preview is a base64 string)
      if (previewImage && previewImage.startsWith("data:image")) {
        try {
          const formData = new FormData();
          formData.append("Type", "avatar");
          formData.append("EntityId", userId.toString());

          // Convert base64 to blob
          const blob = await fetch(previewImage).then((r) => r.blob());
          formData.append("ImageFile", blob, "avatar.jpg");

          // Upload image
          const uploadResponse = await axios.post(
            "https://backend-production-ac5e.up.railway.app/api/images/upload",
            formData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Assuming API returns the URL in data.url
          newAvatarUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Continue with profile update even if image upload fails
        }
      }

      // Prepare update data
      const updateData = {
        fullName: userData.fullName,
        phone: userData.phone,
        gender: userData.gender,
        bio: userData.bio,
        address: userData.address,
        avatarUrl: newAvatarUrl,
      };

      // Update user profile
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

      // Update localStorage with new data
      const updatedUserInfo = {
        ...authData.userInfo,
        ...updateData,
        avatarUrl: newAvatarUrl,
      };

      localStorage.setItem(
        "authData",
        JSON.stringify({
          ...authData,
          userInfo: updatedUserInfo,
        })
      );

      // Update state
      setUserData((prev) => ({
        ...prev,
        ...updateData,
        imageUrl: newAvatarUrl,
      }));

      setHasChanges(false);
      setIsEditing(false);
      toast.success("Cập nhật thông tin tài khoản thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
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
        userRole: authData.userInfo.userRole || "",
      });
      setPreviewImage(authData.userInfo.avatarUrl || null);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  return (
    <div>
      <Navbar />
      <Banner
        title="Hồ Sơ Cá Nhân"
        subtitle="Quản lý thông tin tài khoản của bạn"
      />

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto p-6 text-black">
        <div
          className={`bg-white rounded-lg shadow-md p-6 ${isMember ? "border-2 border-purple-500 shadow-purple-500/30" : ""}`}
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Profile Image */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                <Badge
                  overlap="circular"
                  placement="bottom-end"
                  className={`border-2 border-white ${isMember ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" : "bg-blue-gray-100"}`}
                  content={
                    isMember ? (
                      <Tooltip content="Thành viên câu lạc bộ">
                        <CheckBadgeIcon className="h-5 w-5 text-white" />
                      </Tooltip>
                    ) : null
                  }
                >
                  <Avatar
                    src={
                      previewImage ||
                      "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                    }
                    alt={userData.username}
                    size="xxl"
                    className={`border-2 ${isMember ? "border-purple-500 shadow-lg shadow-purple-500/30" : "border-blue-500 shadow-lg shadow-blue-500/20"}`}
                  />
                </Badge>
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
              <div className="flex items-center gap-2 mb-4">
                <h2
                  className={`text-2xl font-bold ${isMember ? "text-purple-700" : "text-gray-900"}`}
                >
                  {userData.username}
                </h2>
                {isMember && (
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-bounce">
                    MEMBER
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Các trường readonly */}
                {[
                  { field: "username", label: "Tên Tài Khoản" },
                  { field: "email", label: "Email" },
                  { field: "phone", label: "Số Điện Thoại" },
                  {
                    field: "skillLevel",
                    label: "Trình Độ",
                    transform: translateSkillLevel,
                  },
                ].map((item) => (
                  <div key={item.field} className="mb-4">
                    <label
                      className={`block text-base font-bold ${isMember ? "text-purple-700" : "text-gray-700"} mb-1`}
                    >
                      {item.label}
                    </label>
                    <input
                      name={item.field}
                      value={
                        item.transform
                          ? item.transform(
                              userData[
                                item.field as keyof typeof userData
                              ] as string
                            )
                          : (userData[
                              item.field as keyof typeof userData
                            ] as string)
                      }
                      readOnly
                      className={`w-full px-3 py-2 border ${isMember ? "border-purple-300 bg-purple-50" : "border-gray-300 bg-gray-100"} rounded-md shadow-sm cursor-not-allowed`}
                    />
                  </div>
                ))}

                {/* Các trường có thể chỉnh sửa */}
                <div className="mb-4">
                  <label
                    className={`block text-base font-bold ${isMember ? "text-purple-700" : "text-gray-700"} mb-1`}
                  >
                    Họ Và Tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${isMember ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-md shadow-sm focus:outline-none`}
                    />
                  ) : (
                    <p
                      className={`text-gray-900 py-2 px-3 ${isMember ? "bg-purple-50" : "bg-gray-50"} rounded-md`}
                    >
                      {userData.fullName}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-base font-bold ${isMember ? "text-purple-700" : "text-gray-700"} mb-1`}
                  >
                    Giới Tính
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={userData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${isMember ? "border-purple-300 focus:ring9644-purple-500 focus:border-purple-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-md shadow-sm focus:outline-none`}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  ) : (
                    <p
                      className={`text-gray-900 py-2 px-3 ${isMember ? "bg-purple-50" : "bg-gray-50"} rounded-md`}
                    >
                      {translateGender(userData.gender)}
                    </p>
                  )}
                </div>
              </div>

              {/* Address and Bio - Có thể chỉnh sửa */}
              <div className="mb-4">
                <label
                  className={`block text-base font-bold ${isMember ? "text-purple-700" : "text-gray-700"} mb-1`}
                >
                  Địa Chỉ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${isMember ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-md shadow-sm focus:outline-none`}
                  />
                ) : (
                  <p
                    className={`text-gray-900 py-2 px-3 ${isMember ? "bg-purple-50" : "bg-gray-50"} rounded-md`}
                  >
                    {userData.address || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className={`block text-base font-bold ${isMember ? "text-purple-700" : "text-gray-700"} mb-1`}
                >
                  Mô Tả Bản Thân
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border ${isMember ? "border-purple-300 focus:ring-purple-500 focus:border-purple-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-md shadow-sm focus:outline-none`}
                  />
                ) : (
                  <p
                    className={`text-gray-900 py-2 px-3 ${isMember ? "bg-purple-50" : "bg-gray-50"} rounded-md`}
                  >
                    {userData.bio || "Chưa có thông tin"}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`px-4 py-2 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium ${isMember ? "bg-purple-600 text-white focus:ring-purple-500" : "bg-blue-600 text-white focus:ring-blue-500"}`}
                  >
                    Chỉnh Sửa
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isLoading}
                      className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium ${
                        hasChanges && !isLoading
                          ? isMember
                            ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                            : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
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
  );
}

export default ProfilePage;
