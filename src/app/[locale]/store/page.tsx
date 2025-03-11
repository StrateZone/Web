"use client";
import React, { useState } from "react";
import { Search, Star, StarHalf } from "lucide-react";
import { Button } from "@material-tailwind/react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Store() {
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
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center flex flex-col items-center justify-center gap-6 p-5">
        {/* Tiêu đề */}
        <div className="text-center text-white mt-24">
          <h1 className="text-5xl font-extrabold">Strate Zone</h1>
          <p className="text-lg opacity-80">Nơi nghệ thuật gặp gỡ đam mê</p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="flex items-center gap-3 bg-white/20 p-3 rounded-lg backdrop-blur-md shadow-lg">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 w-60 rounded-md border-none outline-none text-black focus:ring-2 focus:ring-blue-400"
          />
          <select className="p-2 rounded-md text-black focus:ring-2 focus:ring-blue-400">
            <option value="0">Tất cả</option>
            <option value="1">Cờ vua</option>
            <option value="2">Cờ tướng</option>
            <option value="3">Cờ vây</option>
          </select>
          <Button className="bg-black text-white flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-800 transition">
            <Search size={18} /> Tìm kiếm
          </Button>
        </div>

        {/* Sản phẩm nổi bật */}
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Sản phẩm nổi bật
          </h2>

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
                  <a href={`/products/${product.id}`} className="block">
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

                  {/* Hành động */}
                  <div className="flex gap-3 mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                      Thêm vào giỏ hàng
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                      Mua hàng
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <Footer />
    </div>
  );
}
