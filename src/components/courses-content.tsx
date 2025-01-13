"use client";

import { Typography } from "@material-tailwind/react";

import CoursesContentCard from "./card/home-course-card";

import { useTranslations } from "next-intl";

export function CourseContent() {
  const t = useTranslations("CourseContent");

  const COURSE_CONTENT = [
    {
      title: t("ChessForBeginners"),
      des: t("ChessForBeginnersDescription"),
      name: "John Doe",
      position: t("InternationalChessMaster"),
      panel: t("BeginnerCourse"),
      img: "/image/avatar1.jpg",
    },
    {
      title: t("IntermediateChessStrategies"),
      des: t("IntermediateChessStrategiesDescription"),
      name: "Jane Smith",
      position: t("ChessGrandmaster"),
      panel: t("IntermediateChessCourse"),
      img: "/image/avatar2.jpg",
    },
    {
      title: t("GoTheArtOfStrategy"),
      des: t("GoTheArtOfStrategyDescription"),
      name: "Alice Johnson",
      position: t("GoExpert"),
      panel: "Workshop",
      img: "/image/avatar3.jpg",
    },
  ];

  return (
    <section className="container mx-auto flex flex-col items-center px-4 py-10">
      <Typography variant="h3" className="text-center" color="blue-gray">
        {t("LearnAndMasterChessSkills")}
      </Typography>
      <Typography
        variant="lead"
        className="mt-2 lg:max-w-4xl mb-8 w-full text-center font-normal !text-gray-500"
      >
        {t("JoinExpertLedClasses")}
      </Typography>
      <div className="mx-auto container">
        {COURSE_CONTENT.map((props, idx) => (
          <CoursesContentCard key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

export default CourseContent;
