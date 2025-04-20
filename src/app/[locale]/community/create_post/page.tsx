// "use client";

// import Banner from "@/components/banner/banner";
// import Footer from "@/components/footer";
// import Navbar from "@/components/navbar";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@material-tailwind/react";
// import { toast } from "react-toastify";

// interface Tag {
//   tagId: number;
//   tagName: string;
// }

// export default function CreatePost() {
//   const router = useRouter();
//   const [title, setTitle] = useState("");
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
//   const [thumbnail, setThumbnail] = useState<File | null>(null);
//   const [previewImage, setPreviewImage] = useState("");
//   const [content, setContent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoadingTags, setIsLoadingTags] = useState(true);
//   const [error, setError] = useState("");
//   const [userId, setUserId] = useState<number | null>(null);
//   const { locale } = useParams();

//   const [touched, setTouched] = useState({
//     title: false,
//     tags: false,
//     thumbnail: false,
//     content: false,
//   });

//   useEffect(() => {
//     const authDataString = localStorage.getItem("authData");
//     if (!authDataString) {
//       alert("Vui lòng đăng nhập để tạo bài viết");
//       router.push("/login");
//       return;
//     }

//     try {
//       const authData = JSON.parse(authDataString);
//       if (authData && authData.userId) {
//         setUserId(authData.userId);
//       } else {
//         throw new Error("Invalid auth data");
//       }
//     } catch (error) {
//       console.error("Error parsing auth data:", error);
//       alert("Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.");
//       router.push(`/${locale}/login`);
//     }
//   }, [router]);

//   useEffect(() => {
//     const fetchTags = async () => {
//       try {
//         const response = await axios.get(
//           "https://backend-production-ac5e.up.railway.app/api/tags",
//           {
//             headers: {
//               accept: "*/*",
//             },
//           }
//         );

//         // Lọc bỏ các tag "quan trọng" (tagId: 9) và "thông báo" (tagId: 8)
//         const filteredTags = response.data.filter(
//           (tag: Tag) => tag.tagId !== 8 && tag.tagId !== 9
//         );

//         setTags(filteredTags);
//       } catch (err) {
//         console.error("Failed to fetch tags:", err);
//         setError("Không thể tải danh sách thể loại. Vui lòng thử lại.");
//       } finally {
//         setIsLoadingTags(false);
//       }
//     };

//     fetchTags();
//   }, []);

//   const handleTagSelect = (tagId: number) => {
//     setTouched((prev) => ({ ...prev, tags: true }));
//     setSelectedTagIds((prev) => {
//       if (prev.includes(tagId)) {
//         return prev.filter((id) => id !== tagId);
//       }
//       if (prev.length < 5) {
//         return [...prev, tagId];
//       }
//       return prev;
//     });
//   };

//   const handleThumbnailChange = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setTouched((prev) => ({ ...prev, thumbnail: true }));
//     setError("");

//     if (!e.target.files || !e.target.files[0]) return;

//     const file = e.target.files[0];

//     if (!file.type.match(/image\/(jpeg|png|webp|jpg)/)) {
//       setError("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setError("Ảnh không được vượt quá 5MB");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       if (event.target?.result) {
//         setPreviewImage(event.target.result as string);
//       }
//     };
//     reader.readAsDataURL(file);

//     setThumbnail(file);
//   };

//   const uploadImage = async (
//     threadId: number,
//     imageFile: File
//   ): Promise<string> => {
//     const formData = new FormData();
//     formData.append("Type", "thread");
//     formData.append("EntityId", threadId.toString());
//     formData.append("ImageFile", imageFile);
//     formData.append("Width", "1200");
//     formData.append("Height", "630");

//     const response = await axios.post(
//       "https://backend-production-ac5e.up.railway.app/api/images/upload",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//       }
//     );

//     if (!response.data.url) {
//       throw new Error("Không nhận được URL hình ảnh từ server");
//     }

//     return response.data.url;
//   };

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setIsSubmitting(true);
//   //   setError("");
//   //   setTouched({
//   //     title: true,
//   //     tags: true,
//   //     thumbnail: true,
//   //     content: true,
//   //   });

//   //   if (!title.trim()) {
//   //     setError("Vui lòng nhập tiêu đề bài viết");
//   //     setIsSubmitting(false);
//   //     return;
//   //   }

//   //   if (selectedTagIds.length === 0) {
//   //     setError("Vui lòng chọn ít nhất một thể loại");
//   //     setIsSubmitting(false);
//   //     return;
//   //   }

//   //   if (!thumbnail) {
//   //     setError("Vui lòng chọn ảnh đại diện cho bài viết");
//   //     setIsSubmitting(false);
//   //     return;
//   //   }

//   //   if (!content.trim() || content.length < 500) {
//   //     setError("Nội dung bài viết phải có ít nhất 500 ký tự");
//   //     setIsSubmitting(false);
//   //     return;
//   //   }

//   //   try {
//   //     // 1. Create thread firstx
//   //     const threadResponse = await axios.post(
//   //       "https://backend-production-ac5e.up.railway.app/api/threads",
//   //       {
//   //         createdBy: userId,
//   //         title: title,
//   //         content: content,
//   //         tagIds: selectedTagIds,
//   //       },
//   //       {
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//   //         },
//   //       }
//   //     );

//   //     const threadId = threadResponse.data.threadId;

//   //     // 2. Upload image and update thread with image URL
//   //     const imageUrl = await uploadImage(threadId, thumbnail);

//   //     // 3. Update thread with the image URL
//   //     console.log(threadId);
//   //     await axios.post(
//   //       `https://backend-production-ac5e.up.railway.app/api/threads/${threadId}`,
//   //       {
//   //         thumbnailUrl: imageUrl,
//   //       },
//   //       {
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//   //         },
//   //       }
//   //     );

//   //     toast.success("Bài viết đã được đăng thành công!");
//   //   } catch (err: any) {
//   //     console.error("Lỗi khi đăng bài:", err);

//   //     let errorMessage = "Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại.";

//   //     if (err.response) {
//   //       errorMessage = err.response.data.message || errorMessage;
//   //     } else if (err.request) {
//   //       errorMessage =
//   //         "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.";
//   //     }

//   //     setError(errorMessage);
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError("");
//     setTouched({
//       title: true,
//       tags: true,
//       thumbnail: true,
//       content: true,
//     });

//     // Validate form data
//     if (!title.trim()) {
//       setError("Vui lòng nhập tiêu đề bài viết");
//       setIsSubmitting(false);
//       return;
//     }

//     if (selectedTagIds.length === 0) {
//       setError("Vui lòng chọn ít nhất một thể loại");
//       setIsSubmitting(false);
//       return;
//     }

//     if (!thumbnail) {
//       setError("Vui lòng chọn ảnh đại diện cho bài viết");
//       setIsSubmitting(false);
//       return;
//     }

//     if (!content.trim() || content.length < 500) {
//       setError("Nội dung bài viết phải có ít nhất 500 ký tự");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       // 1. Tạo thread trước
//       const threadResponse = await axios.post(
//         "https://backend-production-ac5e.up.railway.app/api/threads",
//         {
//           createdBy: userId,
//           title: title,
//           content: content,
//           tagIds: selectedTagIds,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       const threadId = threadResponse.data.threadId;

//       // 2. Upload hình ảnh (sử dụng API đặc biệt cho upload)
//       const formData = new FormData();
//       formData.append("Type", "thread");
//       formData.append("EntityId", threadId.toString());
//       formData.append("ImageFile", thumbnail);
//       formData.append("Width", "0");
//       formData.append("Height", "0");

//       const uploadResponse = await axios.post(
//         "https://backend-production-ac5e.up.railway.app/api/images/upload",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       // 3. KHÔNG cần update thread lại vì API upload đã tự động liên kết ảnh với thread
//       // (Dựa vào response trước đó của bạn cho thấy threadId đã được gán vào ảnh)

//       toast.success("Bài viết đã được tạo thành công chờ Admin xét duyệt!");
//       router.push(`/${locale}/community/post_history/`);

//       // Có thể thêm chuyển hướng sau khi thành công
//       // router.push(`/thread/${threadId}`);
//     } catch (err: any) {
//       console.error("Lỗi khi đăng bài:", err);

//       let errorMessage = "Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại.";

//       if (err.response) {
//         // Xử lý các loại lỗi cụ thể
//         if (err.response.status === 413) {
//           errorMessage = "Kích thước ảnh quá lớn";
//         } else if (err.response.data?.message) {
//           errorMessage = err.response.data.message;
//         }
//       } else if (err.request) {
//         errorMessage =
//           "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.";
//       }

//       setError(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   return (
//     <div className="min-h-screen flex flex-col text-black">
//       <Navbar />
//       <Banner
//         title="Tạo Bài Viết"
//         subtitle="Thỏa sức sáng tạo nội dung của bạn và chia sẻ với cộng đồng!"
//       />

//       <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {error && (
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
//               <div className="flex items-center">
//                 <svg
//                   className="w-5 h-5 mr-2"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <span className="font-medium">{error}</span>
//               </div>
//             </div>
//           )}

//           <div className="space-y-2">
//             <label className="block text-lg font-medium text-gray-800">
//               Tên bài viết <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => {
//                 setTitle(e.target.value);
//                 setTouched((prev) => ({ ...prev, title: true }));
//               }}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               placeholder="Nhập tiêu đề bài viết"
//               maxLength={100}
//               required
//             />
//             <p className="text-sm text-gray-500">{title.length}/100 ký tự</p>
//           </div>

//           <div className="space-y-2">
//             <label className="block text-lg font-medium text-gray-800">
//               Thể loại <span className="text-red-500">*</span>
//               <span className="text-sm text-gray-500 ml-2">
//                 (Tối đa 5 thể loại)
//               </span>
//             </label>
//             {isLoadingTags ? (
//               <div className="flex space-x-2">
//                 {[...Array(4)].map((_, i) => (
//                   <div
//                     key={i}
//                     className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"
//                   ></div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {tags.map((tag) => (
//                   <button
//                     key={tag.tagId}
//                     type="button"
//                     onClick={() => handleTagSelect(tag.tagId)}
//                     disabled={
//                       !selectedTagIds.includes(tag.tagId) &&
//                       selectedTagIds.length >= 5
//                     }
//                     className={`px-4 py-2 rounded-full text-sm font-medium transition ${
//                       selectedTagIds.includes(tag.tagId)
//                         ? "bg-green-600 text-white shadow-md"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     } ${
//                       !selectedTagIds.includes(tag.tagId) &&
//                       selectedTagIds.length >= 5
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                   >
//                     {tag.tagName}
//                   </button>
//                 ))}
//               </div>
//             )}
//             {selectedTagIds.length > 0 && (
//               <p className="text-sm text-gray-500">
//                 Đã chọn {selectedTagIds.length}/5 thể loại
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-lg font-medium text-gray-800">
//               Thumbnails (Ảnh đại diện) <span className="text-red-500">*</span>
//               <span className="text-sm text-gray-500 ml-2">
//                 (Tối đa 5MB, JPEG/PNG/WEBP)
//               </span>
//             </label>
//             <input
//               type="file"
//               onChange={handleThumbnailChange}
//               accept="image/*"
//               className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-sm file:font-medium file:text-blue-600 file:hover:bg-blue-100"
//               required
//             />
//             {previewImage && (
//               <div className="mt-4">
//                 <img
//                   src={previewImage}
//                   alt="Preview"
//                   className="w-full max-w-md mx-auto rounded-lg shadow-lg"
//                 />
//               </div>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-lg font-medium text-gray-800">
//               Nội dung bài viết <span className="text-red-500">*</span>
//               <span className="text-sm text-gray-500 ml-2">
//                 (Tối thiểu 500 ký tự)
//               </span>
//             </label>
//             <textarea
//               value={content}
//               onChange={(e) => {
//                 setContent(e.target.value);
//                 setTouched((prev) => ({ ...prev, content: true }));
//               }}
//               className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               placeholder="Nhập nội dung bài viết"
//               minLength={500}
//               required
//             />
//             <p
//               className={`text-sm ${content.length < 500 ? "text-red-500" : "text-gray-500"}`}
//             >
//               {content.length}/500 ký tự {content.length < 500 && "(tối thiểu)"}
//             </p>
//           </div>

//           <div className="text-center">
//             <Button
//               type="submit"
//               disabled={isSubmitting}
//               className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium focus:outline-none focus:ring-2 ${
//                 isSubmitting
//                   ? "opacity-50 cursor-not-allowed"
//                   : "hover:bg-blue-700"
//               }`}
//             >
//               {isSubmitting ? "Đang đăng bài..." : "Đăng bài"}
//             </Button>
//           </div>
//         </form>
//       </div>

//       <Footer />
//     </div>
//   );
// }
"use client";

import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@material-tailwind/react";
import { toast } from "react-toastify";

interface Tag {
  tagId: number;
  tagName: string;
  tagColor?: string; // Thêm trường tagColor
}

export default function CreatePost() {
  const router = useRouter();
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
  const [isPreview, setIsPreview] = useState(false);
  const { locale } = useParams();

  const [touched, setTouched] = useState({
    title: false,
    tags: false,
    thumbnail: false,
    content: false,
  });

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
    if (!authDataString) {
      alert("Vui lòng đăng nhập để tạo bài viết");
      router.push("/login");
      return;
    }

    try {
      const authData = JSON.parse(authDataString);
      if (authData && authData.userId) {
        setUserId(authData.userId);
      } else {
        throw new Error("Invalid auth data");
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      alert("Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.");
      router.push(`/${locale}/login`);
    }
  }, [router, authDataString, locale]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(
          "https://backend-production-ac5e.up.railway.app/api/tags",
          {
            headers: {
              accept: "*/*",
            },
          }
        );

        // Lọc bỏ các tag "quan trọng" (tagId: 9) và "thông báo" (tagId: 8)
        const filteredTags = response.data.filter(
          (tag: Tag) => tag.tagId !== 8 && tag.tagId !== 9
        );

        // Thêm màu sắc mặc định nếu API không trả về
        const tagsWithColor = filteredTags.map((tag) => ({
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
  }, []);

  // Hàm mapping màu sắc cho tag
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
        setPreviewImage(event.target.result as string);
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

    // Validate form data
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

    if (!thumbnail) {
      setError("Vui lòng chọn ảnh đại diện cho bài viết");
      setIsSubmitting(false);
      return;
    }

    if (!content.trim() || content.length < 500) {
      setError("Nội dung bài viết phải có ít nhất 500 ký tự");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Tạo thread trước
      const threadResponse = await axios.post(
        "https://backend-production-ac5e.up.railway.app/api/threads",
        {
          createdBy: userId,
          title: title,
          content: content,
          tagIds: selectedTagIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const threadId = threadResponse.data.threadId;

      // 2. Upload hình ảnh
      const formData = new FormData();
      formData.append("Type", "thread");
      formData.append("EntityId", threadId.toString());
      formData.append("ImageFile", thumbnail);
      formData.append("Width", "0");
      formData.append("Height", "0");

      const uploadResponse = await axios.post(
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
    } catch (err: any) {
      console.error("Lỗi khi đăng bài:", err);

      let errorMessage = "Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại.";

      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = "Kích thước ảnh quá lớn";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage =
          "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-black">
      <Navbar />
      <Banner
        title="Tạo Bài Viết"
        subtitle="Thỏa sức sáng tạo nội dung của bạn và chia sẻ với cộng đồng!"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
        {isPreview ? (
          <div className="border rounded-lg p-6 bg-white shadow-md">
            {/* Preview Title */}
            <h1 className="text-3xl font-bold mb-4">{title}</h1>

            {/* Preview Author Info */}
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

            {/* Preview Tags */}
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

            {/* Preview Thumbnail */}
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full mb-6 rounded-lg object-cover max-h-96"
              />
            )}

            {/* Preview Content */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: content.replace(/\n/g, "<br>"),
              }}
            />

            {/* Back to Edit Button */}
            <div className="mt-6">
              <Button
                onClick={() => setIsPreview(false)}
                className="w-full bg-gray-600 hover:bg-gray-700"
              >
                Quay lại chỉnh sửa
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={handleThumbnailChange}
                accept="image/*"
                className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-sm file:font-medium file:text-blue-600 file:hover:bg-blue-100"
                required
              />
              {previewImage && (
                <div className="mt-4">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
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
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setTouched((prev) => ({ ...prev, content: true }));
                }}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Nhập nội dung bài viết"
                minLength={500}
                required
              />
              <p
                className={`text-sm ${
                  content.length < 500 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {content.length}/500 ký tự{" "}
                {content.length < 500 && "(tối thiểu)"}
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                onClick={() => {
                  // Validate before showing preview
                  if (!title.trim()) {
                    setError("Vui lòng nhập tiêu đề bài viết");
                    return;
                  }
                  if (selectedTagIds.length === 0) {
                    setError("Vui lòng chọn ít nhất một thể loại");
                    return;
                  }
                  if (!thumbnail) {
                    setError("Vui lòng chọn ảnh đại diện cho bài viết");
                    return;
                  }
                  if (!content.trim() || content.length < 500) {
                    setError("Nội dung bài viết phải có ít nhất 500 ký tự");
                    return;
                  }
                  setIsPreview(true);
                  setError("");
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Xem trước
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
        )}
      </div>

      <Footer />
    </div>
  );
}
