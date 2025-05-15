"use client";

import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button, Typography } from "@material-tailwind/react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { InsufficientBalancePopup } from "../../chess_appointment/chess_appointment_order/InsufficientBalancePopup";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { MembershipUpgradeDialog } from "../MembershipUpgradeDialog ";

interface Tag {
  tagId: number;
  tagName: string;
  tagColor?: string;
}

interface MembershipPrice {
  id: number;
  price1: number;
  unit: string;
}

export default function CreatePost() {
  const router = useRouter();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [membershipPrice, setMembershipPrice] =
    useState<MembershipPrice | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [touched, setTouched] = useState({
    title: false,
    tags: false,
    thumbnail: false,
    content: false,
  });

  // Initialize Quill editor
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    },
    formats: [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "code-block",
      "list",
      "bullet",
      "link",
    ],
  });

  // Sync content with Quill editor
  useEffect(() => {
    if (quill) {
      // Ensure LTR direction
      quill.container.style.direction = "ltr";
      quill.container.style.textAlign = "left";

      // Sanitize and set content
      const sanitizedContent = DOMPurify.sanitize(content || "<p></p>", {
        ADD_TAGS: ["img", "iframe"],
        ADD_ATTR: ["src", "alt", "style"],
        FORCE_BODY: true,
      });
      console.log("Sanitized content:", sanitizedContent); // Debug

      // Only update if content differs
      if (quill.root.innerHTML !== sanitizedContent) {
        quill.root.innerHTML = sanitizedContent;
      }

      const handleTextChange = () => {
        const newContent = quill.root.innerHTML;
        console.log("Quill content on change:", newContent); // Debug
        if (newContent !== content) {
          setContent(newContent);
          setTouched((prev) => ({ ...prev, content: true }));
        }
      };

      quill.on("text-change", handleTextChange);

      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill, content]);
  const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

  // Hàm lấy màu chữ tương phản
  const getContrastColor = (hexColor: string) => {
    if (!hexColor || !hexColor.startsWith("#")) return "#FFFFFF";
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Lấy thông tin user từ localStorage
  const authDataString = localStorage.getItem("authData");
  const parsedAuthData = authDataString ? JSON.parse(authDataString) : {};
  const userInfo = parsedAuthData.userInfo || {};
  const currentUser = {
    userId: userInfo.userId,
    username: userInfo.username,
    fullName: userInfo.fullName,
    avatarUrl: userInfo.avatarUrl || "/default-avatar.jpg",
  };

  useEffect(() => {
    const checkUserMembership = async () => {
      try {
        setInitialLoading(true);
        setError("");

        // Lấy authData từ localStorage
        const authDataString = localStorage.getItem("authData");
        if (!authDataString) {
          router.push(`/${locale}/login`);
          return;
        }

        // Phân tích authData để lấy userId và thông tin người dùng
        const authData = JSON.parse(authDataString);
        const userId = authData.userId;
        if (!userId) {
          throw new Error("Không tìm thấy userId trong dữ liệu xác thực");
        }

        // Gọi API để lấy vai trò người dùng
        const response = await fetch(
          `${API_BASE_URL}/api/users/${userId}/role`,
          {
            method: "GET",
            headers: {
              Accept: "text/plain",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.status === 401) {
          // Show toast notification for token expiration
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Clear authentication data
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authData");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          document.cookie =
            "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

          // Redirect to login page after a short delay to allow toast to be visible
          setTimeout(() => {
            window.location.href = `/${locale}/login`;
          }, 2000);

          return null;
        }

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Không thể lấy vai trò người dùng");
        }

        const userRole = await response.text(); // Vai trò trả về dưới dạng text
        setUserId(userId);
        setUserRole(userRole);

        // Cập nhật thông tin người dùng
        // Remove or replace this block as `setCurrentUser` is not defined
        currentUser.userId = userId;
        currentUser.username = authData.userInfo?.username || "";
        currentUser.fullName = authData.userInfo?.fullName || "";
        currentUser.avatarUrl =
          authData.userInfo?.avatarUrl || "/default-avatar.jpg";

        // Nếu người dùng là RegisteredUser, hiển thị dialog nâng cấp
        if (userRole === "RegisteredUser") {
          fetchMembershipPrice();
          setShowMembershipDialog(true);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại."
        );
        toast.error(
          error instanceof Error
            ? error.message
            : "Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại."
        );
        router.push(`/${locale}/login`);
      } finally {
        setInitialLoading(false);
      }
    };

    checkUserMembership();
  }, [router, locale]);

  const fetchMembershipPrice = async () => {
    try {
      const response = await axios.get(
        "https://backend-production-ac5e.up.railway.app/api/prices/membership",
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${locale}/login`;
        }, 2000);

        return null;
      }
      setMembershipPrice(response.data);
    } catch (error) {
      console.error("Error fetching membership price:", error);
    }
  };

  const handleMembershipPayment = async () => {
    if (!userId) return;

    setPaymentProcessing(true);
    try {
      const response = await axios.post(
        `https://backend-production-ac5e.up.railway.app/api/payments/membership-payment/${userId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (response.status === 401) {
        // Show toast notification for token expiration
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Redirect to login page after a short delay to allow toast to be visible
        setTimeout(() => {
          window.location.href = `/${locale}/login`;
        }, 2000);

        return null;
      }
      if (!response.data.success) {
        throw new Error(response.data.message || "Payment failed");
      }

      const userData = localStorage.getItem("authData");
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          userRole: "Member",
          ...(user.userInfo && {
            userInfo: {
              ...user.userInfo,
              userRole: "Member",
            },
          }),
        };

        localStorage.setItem("authData", JSON.stringify(updatedUser));
        setUserRole("Member");
        setShowMembershipDialog(false);

        toast.success(
          <div>
            <h3 className="font-bold">Nâng cấp thành công!</h3>
            <p>Bạn đã có thể tạo bài viết và tham gia cộng đồng</p>
          </div>,
          {
            autoClose: 3000,
            closeButton: true,
          }
        );
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      if (error.message && error.message.includes("Balance is not enough")) {
        try {
          const shouldNavigate = await InsufficientBalancePopup({
            finalPrice: membershipPrice?.price1,
          });

          if (shouldNavigate) {
            router.push(`/${locale}/wallet`);
          }
        } catch (swalError) {
          console.error("Popup error:", swalError);
        }
      } else {
        Swal.fire({
          title: "Lỗi",
          text: error.message || "Đã xảy ra lỗi khi thanh toán",
          icon: "error",
          confirmButtonText: "Đóng",
        });
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCloseDialog = () => {
    setShowMembershipDialog(false);
  };

  useEffect(() => {
    const fetchTags = async () => {
      if (userRole !== "Member") return;

      try {
        const response = await axios.get(
          "https://backend-production-ac5e.up.railway.app/api/tags",
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (response.status === 401) {
          // Show toast notification for token expiration
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Clear authentication data
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authData");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          document.cookie =
            "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

          // Redirect to login page after a short delay to allow toast to be visible
          setTimeout(() => {
            window.location.href = `/${locale}/login`;
          }, 2000);

          return null;
        }
        const filteredTags = response.data.filter(
          (tag: Tag) => tag.tagId !== 8 && tag.tagId !== 9
        );

        const tagsWithColor = filteredTags.map((tag: Tag) => ({
          ...tag,
          tagColor: getTagColor(tag.tagName),
        }));

        setTags(tagsWithColor);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
        setError("Không thể tải danh sách thể loại. Vui lòng thử lại.");
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, [userRole]);

  useEffect(() => {
    const fetchDraftData = async () => {
      if (!draftId || !userId) return;

      try {
        const response = await axios.get(
          `https://backend-production-ac5e.up.railway.app/api/threads/${draftId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        const draft = response.data;
        console.log("Draft data:", draft); // Debug
        if (draft.createdBy !== userId) {
          toast.error("Bạn không có quyền truy cập vào nháp này.");
          router.push(`/${locale}/community/post_history`);
          return;
        }
        if (draft.status !== "drafted") {
          toast.error("Bài viết không phải bản nháp.");
          router.push(`/${locale}/community/post_history`);
          return;
        }
        setTitle(draft.title || "");
        const draftContent = draft.content
          ? DOMPurify.sanitize(draft.content, {
              ADD_TAGS: ["img", "iframe"],
              ADD_ATTR: ["src", "alt", "style"],
              FORCE_BODY: true,
            })
          : "<p></p>";
        setContent(draftContent);
        setSelectedTagIds(
          draft.threadsTags?.map((tag: { tagId: number }) => tag.tagId) || []
        );
        if (draft.thumbnailUrl) {
          setPreviewImage(draft.thumbnailUrl);
          try {
            const response = await fetch(draft.thumbnailUrl);
            if (!response.ok) throw new Error("Failed to fetch thumbnail");
            const blob = await response.blob();
            const file = new File([blob], "thumbnail.jpg", { type: blob.type });
            setThumbnail(file);
          } catch (error) {
            console.error("Error fetching thumbnail:", error);
            setPreviewImage("/default-thumbnail.jpg");
          }
        }
      } catch (error) {
        console.error("Error fetching draft:", error);
        toast.error(
          "Không thể tải dữ liệu nháp hoặc bạn không có quyền truy cập."
        );
        router.push(`/${locale}/community/post_history`);
      }
    };

    fetchDraftData();
  }, [draftId, userId, router, locale]);

  const getTagColor = (tagName: string): string => {
    const colorMap: Record<string, string> = {
      "cờ vua": "#000000",
      "cờ tướng": "#8B0000",
      "cờ vây": "#343434",
      "chiến thuật": "#6A0DAD",
      gambit: "#DC143C",
      mẹo: "#DAA520",
      "thảo luận": "#3CB371",
      "trò chuyện": "#87CEFA",
      "ngoài lề": "#A9A9A9",
      "thông báo": "#1E90FF",
      "quan trọng": "#ff2200",
    };
    return colorMap[tagName.toLowerCase()] || "#6B7280";
  };

  const handleTagSelect = (tagId: number) => {
    setTouched((prev) => ({ ...prev, tags: true }));
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      if (prev.length < 5) {
        return [...prev, tagId];
      }
      return prev;
    });
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTouched((prev) => ({ ...prev, thumbnail: true }));
    setError("");

    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    if (!file.type.match(/image\/(jpeg|png|webp|jpg)/)) {
      setError("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result as string;
        setPreviewImage(imageUrl);
      }
    };
    reader.readAsDataURL(file);

    setThumbnail(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setTouched({
      title: true,
      tags: true,
      thumbnail: true,
      content: true,
    });

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      setIsSubmitting(false);
      return;
    }

    if (selectedTagIds.length === 0) {
      setError("Vui lòng chọn ít nhất một thể loại");
      setIsSubmitting(false);
      return;
    }

    if (!thumbnail && !previewImage) {
      setError("Vui lòng chọn ảnh đại diện cho bài viết");
      setIsSubmitting(false);
      return;
    }

    const plainText = content.replace(/<[^>]+>/g, "");
    if (!plainText.trim() || plainText.length < 500) {
      setError("Nội dung bài viết phải có ít nhất 500 ký tự");
      setIsSubmitting(false);
      return;
    }

    try {
      let threadId;
      const threadData = {
        createdBy: userId,
        title: title,
        content: content,
        tagIds: selectedTagIds,
        isDrafted: false,
      };

      if (draftId) {
        const threadResponse = await axios.post(
          `https://backend-production-ac5e.up.railway.app/api/threads`,
          threadData,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        threadId = threadResponse.data.threadId;
      } else {
        const threadResponse = await axios.post(
          "https://backend-production-ac5e.up.railway.app/api/threads",
          threadData,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        threadId = threadResponse.data.threadId;
      }

      const formData = new FormData();
      formData.append("Type", "thread");
      formData.append("EntityId", threadId.toString());
      if (thumbnail) {
        formData.append("ImageFile", thumbnail);
      }
      formData.append("Width", "0");
      formData.append("Height", "0");

      await axios.post(
        "https://backend-production-ac5e.up.railway.app/api/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      toast.success("Bài viết đã được tạo thành công chờ Admin xét duyệt!");
      router.push(`/${locale}/community/post_history/`);
    } catch (err: unknown) {
      console.error("Lỗi khi đăng bài:", err);

      let errorMessage = "Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại.";

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 413) {
          errorMessage = "Kích thước ảnh quá lớn";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (axios.isAxiosError(err) && err.request) {
        errorMessage =
          "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setError("");
    setTouched({
      title: true,
      tags: true,
      thumbnail: true,
      content: true,
    });

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      setIsSubmitting(false);
      return;
    }

    try {
      let threadId;
      const threadData = {
        createdBy: userId,
        title: title,
        content: content || "<p></p>",
        tagIds: selectedTagIds,
        isDrafted: true,
      };

      if (draftId) {
        const threadResponse = await axios.post(
          `https://backend-production-ac5e.up.railway.app/api/threads`,
          threadData,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (threadResponse.status === 401) {
          // Show toast notification for token expiration
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Clear authentication data
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authData");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          document.cookie =
            "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

          // Redirect to login page after a short delay to allow toast to be visible
          setTimeout(() => {
            window.location.href = `/${locale}/login`;
          }, 2000);

          return null;
        }

        threadId = threadResponse.data.threadId;
      } else {
        const threadResponse = await axios.post(
          "https://backend-production-ac5e.up.railway.app/api/threads",
          threadData,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        threadId = threadResponse.data.threadId;
      }

      if (thumbnail) {
        const formData = new FormData();
        formData.append("Type", "thread");
        formData.append("EntityId", threadId.toString());
        formData.append("ImageFile", thumbnail);
        formData.append("Width", "0");
        formData.append("Height", "0");

        const response = await axios.post(
          "https://backend-production-ac5e.up.railway.app/api/images/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (response.status === 401) {
          // Show toast notification for token expiration
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Clear authentication data
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authData");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          document.cookie =
            "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

          // Redirect to login page after a short delay to allow toast to be visible
          setTimeout(() => {
            window.location.href = `/${locale}/login`;
          }, 2000);

          return null;
        }
      }
      toast.success("Lưu nháp thành công!");
      router.push(`/${locale}/community/post_history/`);
    } catch (err: unknown) {
      console.error("Lỗi khi lưu nháp:", err);

      let errorMessage = "Đã có lỗi xảy ra khi lưu nháp. Vui lòng thử lại.";

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 413) {
          errorMessage = "Kích thước ảnh quá lớn";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (axios.isAxiosError(err) && err.request) {
        errorMessage =
          "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    setError("");
    setTouched({
      title: true,
      tags: true,
      thumbnail: true,
      content: true,
    });

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (selectedTagIds.length === 0) {
      setError("Vui lòng chọn ít nhất một thể loại");
      return;
    }
    if (!thumbnail && !previewImage) {
      setError("Vui lòng chọn ảnh đại diện cho bài viết");
      return;
    }
    const plainText = content.replace(/<[^>]+>/g, "");
    if (!plainText.trim() || plainText.length < 500) {
      setError("Nội dung bài viết phải có ít nhất 500 ký tự");
      return;
    }

    // Save current Quill content
    if (quill) {
      const currentContent = quill.root.innerHTML;
      setContent(currentContent);
    }

    setIsPreview(true);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-black">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      <Banner
        title={draftId ? "Chỉnh Sửa Bản Nháp" : "Tạo Bài Viết"}
        subtitle={
          draftId
            ? "Chỉnh sửa nội dung bản nháp của bạn và đăng bài!"
            : "Thỏa sức sáng tạo nội dung của bạn và chia sẻ với cộng đồng!"
        }
      />

      <MembershipUpgradeDialog
        open={showMembershipDialog}
        onClose={handleCloseDialog}
        onUpgrade={handleMembershipPayment}
        membershipPrice={membershipPrice || undefined}
        paymentProcessing={paymentProcessing}
      />

      {userRole === "Member" ? (
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
          {draftId && (
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Đang chỉnh sửa bản nháp (ID: {draftId})
            </Typography>
          )}
          {isPreview ? (
            <div className="border rounded-lg p-6 bg-white shadow-md">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{currentUser.username}</p>
                  <p className="text-sm text-gray-500">Ngay sau khi đăng</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedTagIds.map((tagId) => {
                  const tag = tags.find((t) => t.tagId === tagId);
                  if (!tag) return null;

                  const isImportantTag = ["thông báo", "quan trọng"].includes(
                    tag.tagName
                  );
                  const textColor = getContrastColor(tag.tagColor || "#6B7280");

                  return (
                    <span
                      key={tag.tagId}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        isImportantTag ? "hover:scale-105" : "hover:opacity-90"
                      }`}
                      style={{
                        backgroundColor: tag.tagColor || "#6B7280",
                        color: textColor,
                        transform: isImportantTag ? "scale(1.02)" : "none",
                        border: isImportantTag ? "1px solid white" : "none",
                        boxShadow: isImportantTag
                          ? `0 0 5px ${tag.tagColor}`
                          : "none",
                      }}
                    >
                      {isImportantTag && (
                        <span className="mr-1">
                          {tag.tagName === "quan trọng" ? "⚠️" : "📢"}
                        </span>
                      )}
                      {tag.tagName}
                      {isImportantTag && tag.tagName === "quan trọng" && (
                        <span className="ml-1">⚠️</span>
                      )}
                    </span>
                  );
                })}
              </div>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full mb-6 rounded-lg object-cover max-h-96"
                  onError={() => setPreviewImage("/default-thumbnail.jpg")}
                />
              ) : (
                <p className="text-gray-500 mb-6">Không có ảnh đại diện</p>
              )}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content, {
                    ADD_TAGS: ["img", "iframe"],
                    ADD_ATTR: ["src", "alt", "style"],
                    FORCE_BODY: true,
                  }),
                }}
              />
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setIsPreview(false);
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                >
                  Quay lại chỉnh sửa
                </Button>
              </div>
            </div>
          ) : null}
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${isPreview ? "hidden" : ""}`}
          >
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-800">
                Tên bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTouched((prev) => ({ ...prev, title: true }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Nhập tiêu đề bài viết"
                maxLength={100}
                required
              />
              <p className="text-sm text-gray-500">{title.length}/100 ký tự</p>
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-800">
                Thể loại <span className="text-red-500">*</span>
                <span className="text-sm text-gray-500 ml-2">
                  (Tối đa 5 thể loại)
                </span>
              </label>
              {isLoadingTags ? (
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.tagId);
                    const isImportantTag = ["thông báo", "quan trọng"].includes(
                      tag.tagName
                    );
                    const textColor = getContrastColor(
                      tag.tagColor || "#6B7280"
                    );

                    return (
                      <button
                        key={tag.tagId}
                        type="button"
                        onClick={() => handleTagSelect(tag.tagId)}
                        disabled={!isSelected && selectedTagIds.length >= 5}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isSelected ? "shadow-md" : ""
                        } ${
                          !isSelected && selectedTagIds.length >= 5
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? tag.tagColor || "#6B7280"
                            : "#f3f4f6",
                          color: isSelected
                            ? textColor
                            : tag.tagColor || "#6B7280",
                          transform:
                            isSelected && isImportantTag
                              ? "scale(1.05)"
                              : "none",
                          border:
                            isSelected && isImportantTag
                              ? "1px solid white"
                              : "none",
                          boxShadow:
                            isSelected && isImportantTag
                              ? `0 0 8px ${tag.tagColor}`
                              : "none",
                        }}
                      >
                        {isSelected && isImportantTag && (
                          <span className="mr-1">
                            {tag.tagName === "quan trọng" ? "⚠️" : "📢"}
                          </span>
                        )}
                        {tag.tagName}
                        {isSelected &&
                          isImportantTag &&
                          tag.tagName === "quan trọng" && (
                            <span className="ml-1">⚠️</span>
                          )}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedTagIds.length > 0 && (
                <p className="text-sm text-gray-500">
                  Đã chọn {selectedTagIds.length}/5 thể loại
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-800">
                Thumbnails (Ảnh đại diện){" "}
                <span className="text-red-500">*</span>
                <span className="text-sm text-gray-500 ml-2">
                  (Tối đa 5MB, JPEG/PNG/WEBP)
                </span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-sm file:font-medium file:text-blue-600 file:hover:bg-blue-100"
              />
              {previewImage && (
                <div className="mt-4 relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    onError={() => setPreviewImage("/default-thumbnail.jpg")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setPreviewImage("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-800">
                Nội dung bài viết <span className="text-red-500">*</span>
                <span className="text-sm text-gray-500 ml-2">
                  (Tối thiểu 500 ký tự)
                </span>
              </label>
              <div
                ref={quillRef}
                className="h-64 bg-white border border-gray-300 rounded-lg direction-ltr text-left"
              />
              <p
                className={`text-sm mt-12 ${
                  content.replace(/<[^>]+>/g, "").length < 500
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {content.replace(/<[^>]+>/g, "").length}/500 ký tự{" "}
                {content.replace(/<[^>]+>/g, "").length < 500 && "(tối thiểu)"}
              </p>
            </div>

            <div className="flex justify-between gap-4">
              <Button
                type="button"
                onClick={handlePreview}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Xem trước
              </Button>

              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#004080",
                  color: "white",
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                className="px-6 py-3 rounded-lg font-medium hover:brightness-110"
              >
                {isSubmitting ? "Đang lưu nháp..." : "Lưu nháp"}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Đang đăng bài..." : "Đăng bài"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        !showMembershipDialog && (
          <div className="flex flex-col min-h-[calc(100vh-160px)]">
            <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 text-center">
              <div className="max-w-md mx-auto">
                <Typography
                  variant="h4"
                  className="mb-6 text-gray-800 font-bold"
                >
                  Bạn cần nâng cấp tài khoản để tạo bài viết
                </Typography>
                <Typography variant="paragraph" className="mb-8 text-gray-600">
                  Nâng cấp lên tài khoản Member để tạo bài viết và tham gia cộng
                  đồng
                </Typography>
                <Button
                  onClick={() => setShowMembershipDialog(true)}
                  color="blue"
                  size="lg"
                  className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Nâng cấp tài khoản
                </Button>
              </div>
            </div>
          </div>
        )
      )}
      <Footer />
      <style jsx>{`
        .ql-container,
        .ql-editor {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: embed !important;
          font-family: "Roboto", sans-serif !important;
        }
      `}</style>
    </div>
  );
}
