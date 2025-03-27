"use client";
import React, { useState } from "react";

import { Star, StarHalf } from "lucide-react";
import { Select, Option, Button } from "@material-tailwind/react";
import { FaShoppingCart } from "react-icons/fa";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import SearchInput from "@/components/input/search_input";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { DefaultPagination } from "@/components/pagination";
import { useRouter } from "next/navigation"; // Dùng next/navigation thay vì next/router

export default function Store() {
  const t = useTranslations("communityPage"); //Will update for store translation
  const { locale } = useParams(); // Lấy locale từ URL
  const router = useRouter(); // Khởi tạo router

  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    {
      id: 1,
      name: "Cờ vua cao cấp",
      description: "Bộ cờ vua bằng gỗ sang trọng.",
      price: 49.99,
      url: "https://cdn.shopify.com/s/files/1/0353/9471/5692/files/components_-_PC_de061c61-3c36-4b59-84b0-8dc3ed0ac351.jpg?v=1719052879",
    },
    {
      id: 2,
      name: "Cờ tướng chuyên nghiệp",
      description: "Bàn cờ tướng chuẩn thi đấu.",
      price: 39.99,
      url: "https://phatdatbinhthoi.com.vn/upload/sanpham/co-tuong-co-hop.jpg",
    },
    {
      id: 3,
      name: "Cờ vây Nhật Bản",
      description: "Bàn cờ vây và quân đá cao cấp.",
      price: 59.99,
      url: "https://lienhiepthanh.com/wp-content/uploads/2023/05/Ban-co-Tuong-Up-Co-1.jpg",
    },
    {
      id: 4,
      name: "Cờ caro hiện đại",
      description: "Bàn cờ caro với thiết kế mới.",
      price: 29.99,
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZgn4rfT7cBv-iUt8gR-yZDIgp8hlmx5b5fw&s",
    },
    {
      id: 5,
      name: "Bàn cờ gỗ sang trọng",
      description: "Bàn cờ gỗ thủ công cao cấp.",
      price: 89.99,
      url: "https://japan.net.vn/images/uploads/2018/09/19/3-cach-choi-co-vay-nhat-ban.jpg",
    },
    {
      id: 6,
      name: "Bàn cờ gỗ sang trọng",
      description: "Bàn cờ gỗ thủ công cao cấp.",
      price: 89.99,
      url: "https://japan.net.vn/images/uploads/2018/09/19/3-cach-choi-co-vay-nhat-ban.jpg",
    },
    {
      id: 7,
      name: "Bàn cờ gỗ sang trọng",
      description: "Bàn cờ gỗ thủ công cao cấp.",
      price: 89.99,
      url: "https://japan.net.vn/images/uploads/2018/09/19/3-cach-choi-co-vay-nhat-ban.jpg",
    },
    {
      id: 8,
      name: "Bàn cờ gỗ sang trọng",
      description: "Bàn cờ gỗ thủ công cao cấp.",
      price: 89.99,
      url: "https://japan.net.vn/images/uploads/2018/09/19/3-cach-choi-co-vay-nhat-ban.jpg",
    },
  ];

  return (
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
            Cửa hàng cờ StrateZone
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            Nâng tầm chiến thuật – Trang bị như một kiện tướng!
          </p>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex justify-center mt-10">
        <SearchInput />
        <div className="w-30 ml-2">
          <Select label="Chọn loại cờ">
            <Option>Cờ vua</Option>
            <Option>Cờ tướng</Option>
            <Option>Cờ vây</Option>
          </Select>
        </div>
      </div>

      {/* Sản phẩm nổi bật */}
      <div className="container mx-auto px-4 ">
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-black">Sản phẩm nổi bật</h2>
        </div>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          // pagination={{ clickable: true }}
          className="relative pb-10"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white shadow-md hover:shadow-xl transition rounded-lg p-5 transform hover:scale-[1.03]">
                <a href={`/${locale}/store/${product.id}`} className="block">
                  <img
                    src={product.url}
                    alt={product.name}
                    className="w-full h-60 object-cover rounded-lg"
                  />
                </a>
                <h3 className="text-lg font-semibold mt-3 text-black">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {product.description}
                </p>
                <p className="text-blue-600 font-bold mt-2">
                  Giá: ${product.price.toFixed(2)}
                </p>

                {/* Đánh giá sao */}
                <div className="flex text-yellow-400 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={18} />
                  ))}
                  <StarHalf size={18} />
                </div>

                <div className="flex gap-3 mt-4">
                  <Button className="flex items-center gap-3">
                    <FaShoppingCart /> Thêm vào giỏ hàng
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(`/${locale}/store/product_order`)
                    }
                    color="green"
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex justify-center mt-8 mb-8">
          {/* <DefaultPagination /> */}
        </div>
      </div>

      <Footer />
    </div>
  );
}
