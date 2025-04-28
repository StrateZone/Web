"use client";

import { Typography } from "@material-tailwind/react";
import AboutCard from "./card/home-chess-card";
import { motion } from "framer-motion";

// Định nghĩa interface cho dữ liệu game
interface GameInfo {
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
}

// Dữ liệu game
const GAME_INFO: GameInfo[] = [
  {
    title: "Cờ Tướng",
    description:
      "Đắm mình vào nghệ thuật cờ tướng cổ xưa, nơi các nước đi chiến lược và tính toán quyết định thắng thua.",
    subTitle: "Di Sản Văn Hóa",
    imageUrl: "https://static3.bigstockphoto.com/1/2/5/large1500/52149265.jpg",
  },
  {
    title: "Cờ Vây",
    description:
      "Một trong những trò chơi bàn cổ xưa, cờ Vây mang đến những khả năng vô tận và yêu cầu tư duy chiến lược sâu sắc.",
    subTitle: "Vô Số Biến Thể",
    imageUrl:
      "https://i.pinimg.com/736x/7d/12/38/7d1238f59e84faf23cb6dfe9bffdf68c.jpg",
  },
  {
    title: "Cờ Vua",
    subTitle: "Chiến Lược & Kỹ Năng",
    description:
      "Một trò chơi kinh điển, cờ vua thách thức người chơi bằng chiến lược và tầm nhìn. Hoàn hảo cho người chơi ở mọi cấp độ kỹ năng.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Chess_pieces_close_up.jpg/640px-Chess_pieces_close_up.jpg",
  },
];

// Animation variants cho các card
const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateY: 30 },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
    },
  },
};

// Animation variants cho header
const headerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export function ChessContent() {
  return (
    <section
      className="container mx-auto px-4 py-16 bg-gradient-to-b from-gray-50 to-blue-gray-100 min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
      }}
    >
      <style jsx>{`
        @keyframes wildShake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px) rotate(-2deg);
          }
          75% {
            transform: translateX(5px) rotate(2deg);
          }
        }
        .animate-wild-shake:hover {
          animation: wildShake 0.3s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%,
          100% {
            text-shadow: 0 0 5px rgba(37, 99, 235, 0.5);
          }
          50% {
            text-shadow:
              0 0 20px rgba(37, 99, 235, 0.8),
              0 0 30px rgba(37, 99, 235, 0.5);
          }
        }
        .animate-glow-pulse {
          animation: glowPulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* Header Section */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-12"
      >
        <Typography
          variant="h2"
          color="blue-gray"
          className="font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 animate-glow-pulse"
        >
          Tìm Đối Tác Cờ Tướng Hoàn Hảo Của Bạn
        </Typography>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Typography
            variant="lead"
            className="mt-4 mx-auto max-w-3xl font-serif text-gray-600 leading-relaxed "
          >
            Lên lịch chơi cờ cá nhân hoặc nhóm với các người chơi phù hợp với
            trình độ và thời gian của bạn.
          </Typography>
        </motion.div>
      </motion.div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAME_INFO.map((game, index) => (
          <motion.div
            key={`${game.title}-${index}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className="group relative"
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          >
            <AboutCard
              title={game.title}
              subTitle={game.subTitle}
              description={game.description}
              imageUrl={game.imageUrl}
            />
            <motion.div
              className="absolute top-2 right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Hot!
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default ChessContent;
