"use client";

import { button, Typography } from "@material-tailwind/react";
import AboutCard from "./card/home-chess-card";
import { useTranslations } from "next-intl";

export function ChessContent() {
  const t = useTranslations("ChessContent"); // Correctly importing the translations
  const GAME_INFO = [
    {
      title: t("xiangqi"),
      description: t("xiangqiDescription"),
      subTitle: t("culturalLegacy"),
      imageUrl:
        "https://static3.bigstockphoto.com/1/2/5/large1500/52149265.jpg",
    },
    {
      title: t("go"),
      description: t("goDescription"),
      subTitle: t("endlessPossibilities"),
      imageUrl:
        "https://cdnphoto.dantri.com.vn/mvXVVkYqDvrUE23jW_mNI-a5TlM=/thumb_w/1020/2024/02/26/nuthancovay-3-1708892742007.jpeg",
    },
  ];

  return (
    <section className="container mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h3" className="text-center" color="blue-gray">
        {t("findYourPerfectChessPartner")}{" "}
        {/* Translation for "Find Your Perfect Chess Partner" */}
      </Typography>
      <Typography
        variant="lead"
        className="mt-2 lg:max-w-4xl mb-8 w-full text-center font-normal !text-gray-500"
      >
        {t("scheduleGames")}{" "}
        {/* Translation for "Schedule individual or group chess games..." */}
      </Typography>
      <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {GAME_INFO.map((props, idx) => (
          <AboutCard key={idx} {...props} />
        ))}
        <div className="md:col-span-2">
          <AboutCard
            title={t("chess")} // Translation for "Chess"
            subTitle={t("strategyAndSkills")} // Translation for "Strategy & Skills"
            description={t("chessDescription")}
            imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Chess_pieces_close_up.jpg/640px-Chess_pieces_close_up.jpg"
          />
        </div>
      </div>
    </section>
  );
}

export default ChessContent;
