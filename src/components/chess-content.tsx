"use client";

import { Typography } from "@material-tailwind/react";
import AboutCard from "./card/home-chess-card";

export function ChessContent() {
  const GAME_INFO = [
    {
      title: "Cờ Tướng",
      description:
        "Đắm mình vào nghệ thuật cờ tướng cổ xưa, nơi các nước đi chiến lược và tính toán quyết định thắng thua.",
      subTitle: "Di Sản Văn Hóa",
      imageUrl:
        "https://static3.bigstockphoto.com/1/2/5/large1500/52149265.jpg",
    },
    {
      title: "Cờ Vây",
      description:
        "Một trong những trò chơi bàn cổ xưa, cờ Vây mang đến những khả năng vô tận và yêu cầu tư duy chiến lược sâu sắc để chiếm ưu thế trên bàn cờ.",
      subTitle: "Vô Số Biến Thể",
      imageUrl:
        "https://cdnphoto.dantri.com.vn/mvXVVkYqDvrUE23jW_mNI-a5TlM=/thumb_w/1020/2024/02/26/nuthancovay-3-1708892742007.jpeg",
    },
  ];

  return (
    <section className="container mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h3" className="text-center" color="blue-gray">
        Tìm Đối Tác Cờ Tướng Hoàn Hảo Của Bạn
        {/* Translation for "Find Your Perfect Chess Partner" */}
      </Typography>
      <Typography
        variant="lead"
        className="mt-2 lg:max-w-4xl mb-8 w-full text-center font-normal !text-gray-500"
      >
        Lên lịch chơi cờ cá nhân hoặc nhóm với các người chơi phù hợp với trình
        độ và thời gian của bạn.
        {/* Translation for "Schedule individual or group chess games..." */}
      </Typography>
      <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {GAME_INFO.map((props, idx) => (
          <AboutCard key={idx} {...props} />
        ))}
        <div className="md:col-span-2">
          <AboutCard
            title={"Cờ Vua"} // Translation for "Chess"
            subTitle={"Chiến Lược & Kỹ Năng"} // Translation for "Strategy & Skills"
            description={
              "Một trò chơi kinh điển, cờ vua thách thức người chơi bằng chiến lược và tầm nhìn. Hoàn hảo cho người chơi ở mọi cấp độ kỹ năng."
            }
            imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Chess_pieces_close_up.jpg/640px-Chess_pieces_close_up.jpg"
          />
        </div>
      </div>
    </section>
  );
}

export default ChessContent;
