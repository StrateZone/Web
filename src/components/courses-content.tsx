"use client";

import { Typography } from "@material-tailwind/react";
import Image from "next/image";

function CommunitySection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
      <style jsx>{`
        @keyframes wildPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes spinIn {
          0% {
            transform: rotateY(90deg);
            opacity: 0;
          }
          100% {
            transform: rotateY(0);
            opacity: 1;
          }
        }
        .animate-wild-pulse {
          animation: wildPulse 2s infinite ease-in-out;
        }
        .animate-spin-in {
          animation: spinIn 0.6s ease-out forwards;
        }
      `}</style>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 ">
          <Typography
            variant="h2"
            color="blue-gray"
            className="font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 animate-glow-pulse"
          >
            Đắm Chìm Trong Thế Giới Cờ
          </Typography>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-serif animate-slide-in-up">
            Đọc các bài blog độc quyền về cờ vua, cờ tướng, cờ vây và hơn thế
            nữa. Tham gia cộng đồng hơn 1000 kỳ thủ đam mê!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Bí Mật Của Các Kỳ Thủ",
              desc: "Khám phá chiến thuật và câu chuyện đằng sau các ván cờ huyền thoại.",
              img: "https://i.pinimg.com/736x/57/27/e5/5727e5b00fdebcf42182e6eff38fb836.jpg",
              stat: "Hàng trăm bài blog độc quyền",
            },
            {
              title: "Cờ Qua Góc Nhìn Mới",
              desc: "Đọc phân tích chuyên sâu về cờ vua, cờ tướng và cờ vây từ các chuyên gia.",
              img: "https://i.pinimg.com/736x/01/5d/58/015d588d14ea1461942b774f9ed83be9.jpg",
              stat: "Cập nhật hàng tuần",
            },
            {
              title: "Cộng Đồng Kỳ Thủ",
              desc: "Kết nối, thảo luận và chia sẻ đam mê với những người yêu cờ trên toàn cầu.",
              img: "https://i.pinimg.com/736x/06/31/18/063118e78b9950a9ef9c97aa4b46c1c2.jpg",
              stat: "1k+ thành viên",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-4 transition-all duration-500 "
              // style={{ animationDelay: `${idx * 0.2}s` }}
            >
              <Image
                width={500}
                height={192}
                src={item.img}
                alt={item.title}
                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="p-6">
                <h3 className="text-2xl text-gray-900 mb-3 font-sans animate-slide-in-left">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed font-serif animate-slide-in-right">
                  {item.desc}
                </p>
                <p className="text-sm font-semibold text-blue-600 font-serif">
                  {item.stat}
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full ">
                Độc Quyền
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <a
            href="/vi/community"
            className="font-sans inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg animate-wild-pulse"
          >
            Đăng Ký Ngay Để Đọc Blog Độc Quyền
          </a>
          <p className="font-serif mt-4 text-sm text-gray-500 animate-fade-in-up">
            Bắt đầu hành trình chinh phục cờ cùng chúng tôi hôm nay!
          </p>
        </div>
      </div>
    </section>
  );
}

export default CommunitySection;
