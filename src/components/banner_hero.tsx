"use client";

import { IconButton, Button, Typography } from "@material-tailwind/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function BannerHero() {
  const t = useTranslations("heroBanner");
  const router = useRouter();
  const localActive = useLocale();

  return (
    <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-no-repeat">
      <div className="absolute inset-0 h-full w-full bg-gray-900/60" />
      <div className="grid min-h-screen px-8">
        <div className="container relative z-10 my-auto mx-auto grid place-items-center text-center">
          <Typography variant="h1" color="white" className="lg:max-w-3xl">
            StrateZone: Nơi đam mê gặp chiến lược
          </Typography>
          <Typography
            variant="lead"
            color="white"
            className="mt-1 mb-12 w-full md:max-w-full lg:max-w-2xl"
          >
            StrateZone là một ứng dụng kết nối những người yêu cờ vua, giúp dễ
            dàng tìm kiếm đối thủ phù hợp, sắp xếp các trận đấu tại câu lạc bộ,
            tham gia các khóa học hấp dẫn và tham gia sự kiện.
          </Typography>
          <div className="flex items-center gap-4">
            <Button
              variant="gradient"
              color="white"
              onClick={() => router.push(`/${localActive}/chess_appointment`)}
            >
              Đặt ngay
            </Button>
            {/* <IconButton className="rounded-full bg-white p-6">
              <PlayIcon className="h-4 w-4 text-gray-900" />
            </IconButton> */}
          </div>
        </div>
      </div>
    </div>
  );
}
