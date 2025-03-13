"use client";
import React, { useState } from "react";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Select, Option, Button } from "@material-tailwind/react";
import { FaShoppingCart } from "react-icons/fa";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import SearchInput from "@/components/input/search_input";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { DefaultPagination } from "@/components/pagination";
import { useRouter } from "next/navigation";
function Page() {
  const { locale } = useParams(); // Lấy locale từ URL
  const router = useRouter(); // Khởi tạo router
  const courses = [
    {
      id: 1,
      category: "Cờ vua",
      level: "Cao cấp",
      name: "Cờ vua chuyên sâu",
      instructor: "GM Lê Quang Liêm",
      startDate: "2024-04-15",
      duration: "6 tuần",
      students: 120,
      description:
        "Khóa học giúp bạn nắm vững các chiến thuật nâng cao trong cờ vua.",
      price: 49.99,
      url: "https://i.pinimg.com/736x/14/ac/00/14ac005a0d02c5775b71517a514d3022.jpg",
    },
    {
      id: 2,
      category: "Cờ tướng",
      level: "Trung cấp",
      name: "Chiến thuật Cờ tướng",
      instructor: "Kỳ thủ Nguyễn Thành Bảo",
      startDate: "2024-05-01",
      duration: "8 tuần",
      students: 95,
      description:
        "Học cách triển khai và phòng thủ trong các ván cờ tướng thực tế.",
      price: 39.99,
      url: "https://i.pinimg.com/736x/14/ac/00/14ac005a0d02c5775b71517a514d3022.jpg",
    },
    {
      id: 3,
      category: "Cờ vây",
      level: "Cơ bản",
      name: "Nhập môn Cờ vây",
      instructor: "Lý Hạo Nam",
      startDate: "2024-06-10",
      duration: "4 tuần",
      students: 150,
      description: "Khóa học dành cho người mới bắt đầu tìm hiểu về cờ vây.",
      price: 29.99,
      url: "https://i.pinimg.com/736x/14/ac/00/14ac005a0d02c5775b71517a514d3022.jpg",
    },
    {
      id: 4,
      category: "Cờ vua",
      level: "Trung cấp",
      name: "Chiến lược khai cuộc",
      instructor: "GM Đinh Thanh Hải",
      startDate: "2024-07-05",
      duration: "5 tuần",
      students: 80,
      description:
        "Nắm vững những khai cuộc phổ biến và cách triển khai thế trận.",
      price: 44.99,
      url: "https://chess-teacher.com/wp-content/uploads/2020/07/opening_principles.jpg",
    },
  ];
  const [selectedDate, setSelectedDate] = useState(dayjs());

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
              Các Khóa Học Của StrateZone
            </h2>
            <p className="sm:text-lg text-base text-center text-gray-200">
              Bổ Sung Kiến Thức, Nâng Tầm Cuộc Chơi Của Bạn!
            </p>
          </div>
        </div>
        {/* Course */}
        <div>
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
            <div className="w-30 ml-2">
              <Select label="Chọn trình độ">
                <Option>Cơ bản</Option>
                <Option>Trung cấp</Option>
                <Option>Cao cấp</Option>
              </Select>
            </div>
            <div className="w-30 ml-2">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Chọn ngày bắt đầu"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate || dayjs())}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          {/* Khóa học nổi bật */}
          <div className="container mx-auto px-4 ">
            <div className="mt-8">
              <h2 className="text-3xl font-bold text-black">
                Khóa Học Nổi Bật
              </h2>
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
              className="relative pb-10"
            >
              {courses.map((course) => (
                <SwiperSlide key={course.id}>
                  <div className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-4">
                    <a href={`/${locale}/store/${course.id}`} className="block">
                      <img
                        src={course.url}
                        alt={course.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </a>
                    <h3 className="text-lg font-semibold mt-3 text-black">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {course.category} - {course.level}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Thời gian bắt đầu: {course.startDate}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Độ dài khóa học: {course.duration}
                    </p>
                    <p className="text-blue-600 font-bold mt-2">
                      ${course.price.toFixed(2)}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <Button className="flex items-center gap-3">
                        <FaShoppingCart /> Thêm vào danh sách
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/${locale}/store/product_order`)
                        }
                        color="green"
                      >
                        Ghi danh
                      </Button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="flex justify-center mt-8 mb-8">
              <DefaultPagination />
            </div>
          </div>

          {/*End Course */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Page;
