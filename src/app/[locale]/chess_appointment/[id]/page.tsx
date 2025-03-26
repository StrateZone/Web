"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";

interface ChessBooking {
  id: number;
  name: string; // Loại cờ
  price: number; // Giá loại cờ
  room: string; // Phòng
  roomPrice: number; // Giá phòng
  tableNumber: number; // Số bàn
  date: string; // Ngày
  time: string; // Giờ
  totalPrice: number; // Tổng tiền
  url: string; // Ảnh sản phẩm
}
interface TableDetails {
  id: number;
  chessType: string;
  chessPrice: number;
  room: string;
  roomPrice: number;
  tableNumber: number;
  price: number;
  date: string;
  time: string;
  privileges: string[];
  imageUrl?: string;
}

const TableDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const { locale } = useParams(); // Lấy locale từ URL
  const searchParams = useSearchParams();
  const chessBookings: ChessBooking[] = [
    {
      id: 1,
      name: "Cờ vua",
      price: 10000,
      room: "Premium",
      roomPrice: 40000,
      tableNumber: 11,
      date: "17/3/2025",
      time: "16:00-17:00",
      totalPrice: 50000,
      url: "https://cdn.shopify.com/s/files/1/0353/9471/5692/files/components_-_PC_de061c61-3c36-4b59-84b0-8dc3ed0ac351.jpg?v=1719052879",
    },
    {
      id: 2,
      name: "Cờ tướng",
      price: 15000,
      room: "VIP",
      roomPrice: 50000,
      tableNumber: 5,
      date: "18/3/2025",
      time: "15:00-16:00",
      totalPrice: 65000,
      url: "https://phatdatbinhthoi.com.vn/upload/sanpham/co-tuong-co-hop.jpg",
    },
    {
      id: 3,
      name: "Cờ vây Nhật Bản",
      price: 20000,
      room: "Standard",
      roomPrice: 30000,
      tableNumber: 7,
      date: "20/3/2025",
      time: "14:00-15:00",
      totalPrice: 50000,
      url: "https://lienhiepthanh.com/wp-content/uploads/2023/05/Ban-co-Tuong-Up-Co-1.jpg",
    },
    {
      id: 4,
      name: "Cờ caro hiện đại",
      price: 12000,
      room: "Premium",
      roomPrice: 40000,
      tableNumber: 3,
      date: "22/3/2025",
      time: "10:00-11:00",
      totalPrice: 52000,
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZgn4rfT7cBv-iUt8gR-yZDIgp8hlmx5b5fw&s",
    },
    {
      id: 5,
      name: "Cờ caro hiện đại",
      price: 12000,
      room: "Premium",
      roomPrice: 40000,
      tableNumber: 3,
      date: "22/3/2025",
      time: "10:00-11:00",
      totalPrice: 52000,
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZgn4rfT7cBv-iUt8gR-yZDIgp8hlmx5b5fw&s",
    },
  ];
  useEffect(() => {
    if (!id) return;

    const fetchTableDetails = async () => {
      try {
        // Lấy tham số từ URL
        const startTime = searchParams.get("startTime");
        const endTime = searchParams.get("endTime");

        // Gọi API với các tham số
        const response = await axios.get(
          `https://backend-production-5bc5.up.railway.app/api/tables/${id}`,
          {
            params: {
              startTime: startTime ? decodeURIComponent(startTime) : undefined,
              endTime: endTime ? decodeURIComponent(endTime) : undefined,
            },
          }
        );

        // Chuyển đổi dữ liệu API sang định dạng TableDetails
        const booking = response.data;
        const details: TableDetails = {
          id: booking.tableId,
          chessType:
            booking.gameType?.typeName === "chess"
              ? "Cờ vua"
              : booking.gameType?.typeName === "xiangqi"
                ? "Cờ tướng"
                : booking.gameType?.typeName === "go"
                  ? "Cờ vây"
                  : booking.gameType?.typeName || "Không xác định",
          chessPrice: booking.gameTypePrice || 0,
          room:
            booking.roomType === "basic"
              ? "Phòng Thường"
              : booking.roomType === "premium"
                ? "Phòng Cao Cấp"
                : booking.roomType === "openspaced"
                  ? "Không Gian Mở"
                  : booking.roomType || "Không xác định",
          roomPrice: booking.roomTypePrice || 0,
          tableNumber: booking.tableId,
          price: booking.totalPrice || 0,
          date: booking.startDate
            ? new Date(booking.startDate).toLocaleDateString("vi-VN")
            : "Không xác định",
          time:
            booking.startDate && booking.endDate
              ? `${new Date(booking.startDate).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })} - ${new Date(booking.endDate).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}`
              : "Không xác định",
          privileges: [
            "Nước uống miễn phí",
            "Wifi tốc độ cao",
            "Hỗ trợ dụng cụ",
          ],
          imageUrl:
            booking.imageUrl ||
            "https://i.pinimg.com/736x/2e/7e/e5/2e7ee58125c4b42cc7387887eb350580.jpg",
        };

        setTableDetails(details);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bàn:", error);
        // Xử lý lỗi (ví dụ: hiển thị thông báo hoặc redirect)
      }
    };

    fetchTableDetails();
  }, [id, searchParams]);

  if (!tableDetails)
    return <p className="text-center mt-10 text-lg">Đang tải...</p>;

  return (
    <div>
      <Navbar></Navbar>
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>

        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            Cửa hàng cờ StrateZone
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            Nâng tầm chiến thuật – Trang bị như một kiện tướng!
          </p>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center uppercase tracking-wider">
            Thông Tin Bàn Chi Tiết
          </h1>

          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Ảnh bàn cờ */}
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src={tableDetails.imageUrl}
                  alt="Bàn cờ"
                  className="w-full h-80 object-cover transition duration-300 group-hover:scale-105"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4">
                  <span className="text-white  text-2xl font-bold text-center w-full">
                    Bàn số {tableDetails.tableNumber} - {tableDetails.room}
                  </span>
                </div> */}
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-4 text-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {tableDetails.chessType}
                    </h2>
                    <span className="text-gray-500   text-center w-full">
                      Bàn số {tableDetails.tableNumber} - {tableDetails.room}
                    </span>
                    <p className="text-gray-500">
                      Ngày: {tableDetails.date} • {tableDetails.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Giá tổng</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {tableDetails.price.toLocaleString()}đ
                    </p>
                  </div>
                </div>

                <div className="border-t border-b border-gray-200 py-4 my-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Giá cờ</p>

                      <p className="font-medium">
                        {tableDetails.chessPrice.toLocaleString()}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giá phòng</p>
                      <p className="font-medium">
                        {tableDetails.roomPrice.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Đặc quyền
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tableDetails.privileges.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                          <svg
                            className="w-3 h-3 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="gradient"
                    color="amber"
                    className="flex-1 py-3 text-lg"
                    onClick={() =>
                      router.push(
                        `/${locale}/chess_appointment/chess_appointment_order`
                      )
                    }
                  >
                    Đặt ngay
                  </Button>
                  {/* <Button
                    variant="outlined"
                    color="gray"
                    className="flex-1 py-3 text-lg"
                  >
                    <FaShoppingCart className="mr-2" /> Thêm vào giỏ
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mb-10 mt-10">
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-black">
            CÁC SẢN PHẨM LIÊN QUAN
          </h2>
        </div>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={4}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          navigation
          className="relative pb-6"
        >
          {chessBookings.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105">
                <a href={`/${locale}/store/${product.id}`} className="block">
                  <img
                    src={product.url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </a>
                <h3 className="text-base font-medium mt-2 text-black">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                  {product.room}
                </p>
                <p className="text-blue-600 font-semibold mt-2 text-sm">
                  Giá: ${product.price.toFixed(2)}
                </p>

                <div className="flex gap-2 mt-3">
                  <Button className="flex items-center gap-2 text-xs px-2 py-1">
                    <FaShoppingCart size={14} /> Thêm
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(`/${locale}/store/product_order`)
                    }
                    color="green"
                    className="text-xs px-2 py-1"
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default TableDetailsPage;
