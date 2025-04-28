"use client";

import { Button, Typography } from "@material-tailwind/react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BannerHero() {
  const router = useRouter();
  const localActive = useLocale();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const backgroundVariants = {
    initial: { scale: 1.05 },
    animate: {
      scale: 1,
      transition: { duration: 1.5, ease: "easeOut" },
    },
  };

  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-no-repeat"
        initial="initial"
        animate="animate"
        variants={backgroundVariants}
      />
      <div className="absolute inset-0 h-full w-full bg-gray-900/60" />

      <div className="grid min-h-screen px-8">
        <motion.div
          className="container relative z-10 my-auto mx-auto grid place-items-center text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Typography variant="h1" color="white" className="lg:max-w-3xl">
              StrateZone: Nơi đam mê gặp gỡ chiến lược
            </Typography>
          </motion.div>

          <motion.div variants={item}>
            <Typography
              variant="lead"
              color="white"
              className="mt-1 mb-12 w-full md:max-w-full lg:max-w-2xl"
            >
              StrateZone là một ứng dụng kết nối những người yêu các bộ môn cờ,
              giúp dễ dàng tìm kiếm đối thủ phù hợp, sắp xếp các trận đấu tại
              câu lạc bộ, tham gia cộng đồng cờ thủ với những trãi nghiệm hấp
              dẫn và gây cấn
            </Typography>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-4">
              <Button
                variant="gradient"
                color="white"
                onClick={() =>
                  router.push(
                    `/${localActive}/chess_appointment/chess_category`
                  )
                }
                className="transform transition-transform animate-bounce"
              >
                Đặt hẹn ngay
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Optional floating chess pieces animation */}
      <motion.div
        className="absolute top-20 left-20 w-16 h-16 bg-white rounded-full opacity-10"
        animate={{
          y: [0, 30, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-12 h-12 bg-white rounded-full opacity-10"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}
