"use client";
import React from "react";
import { Button, ButtonGroup, Typography } from "@material-tailwind/react";
import { useTranslations } from "next-intl";

import Navbar from "@/components/navbar";
import CommunityCard from "@/components/card/community_card";
import SearchInput from "@/components/input/search_input";
import { DefaultPagination } from "@/components/pagination";
import Footer from "@/components/footer";
import TopicCard from "@/components/card/topic_card";

const communityData = [
  {
    id: 1,
    theme: "Chess",
    avatar: "https://docs.material-tailwind.com/img/face-2.jpg",

    title: "[Beginner] Light Discussion",
    description: "Beginner speakers",
    dateTime: "Fri, Mar 11 . 8:00 - 9:30 AM",
    likes: 4,
  },
  {
    id: 2,
    theme: "Go",
    avatar: "https://docs.material-tailwind.com/img/face-2.jpg",

    title: "[Intermediate] Strategy Workshop",
    description: "Intermediate players",
    dateTime: "Sat, Mar 12 . 10:00 - 12:00 PM",
    likes: 10,
  },
  {
    id: 3,
    theme: "Xiangqi",
    avatar: "https://docs.material-tailwind.com/img/face-2.jpg",

    title: "[Advanced] Competitive Play",
    description: "Advanced competitors",
    dateTime: "Sun, Mar 13 . 1:00 - 3:30 PM",
    likes: 7,
  },
];

export default function ComunityPage() {
  const t = useTranslations("communityPage");
  return (
    <div>
      <Navbar />
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>

        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            {t("joinCommunityTitle")}
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            {t("joinCommunityDesc")}
          </p>
          <Button className="mt-12 bg-transparent text-white text-base py-3 px-6 border border-white rounded-lg transition duration-300">
            {t("joinNowButton")}
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-3/4 px-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <ButtonGroup variant="text" className="flex md:flex-row flex-col">
                <Button>{t("popularButton")}</Button>
                <Button>{t("newestButton")}</Button>
                <Button>{t("followingButton")}</Button>
              </ButtonGroup>

              <Button variant="filled" className="md:ml-4">
                {t("createPostButton")}
              </Button>
            </div>

            <div
              className="w-full h-px max-w-6xl mx-auto my-3"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(128, 128, 128, 0) 1.46%, rgba(128, 128, 128, 0.6) 40.83%, rgba(128, 128, 128, 0.3) 65.57%, rgba(128, 128, 128, 0) 107.92%)",
              }}
            ></div>
            {communityData.map((item, index) => (
              <CommunityCard
                key={index}
                theme={item.theme}
                title={item.title}
                description={item.description}
                dateTime={item.dateTime}
                likes={item.likes}
                avatar={item.avatar}
              />
            ))}
            <div className="flex justify-center pt-2">
              <DefaultPagination />
            </div>
          </div>

          <div className="w-full lg:w-1/4 px-4">
            <SearchInput />

            <Typography variant="h4" className="my-4">
              {t("ChooseTopic")}
            </Typography>
            <TopicCard
              avatar="https://img.freepik.com/premium-vector/black-chess-piece-pawn-with-highlights-white-background_490191-310.jpg"
              topicTitle="Chess"
              numberOfPost={999}
            />
            <TopicCard
              avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLjXnCWtWsbbYFHxH1Kh2Hb1cT4ZuFemkGrA&s"
              topicTitle="Go"
              numberOfPost={799}
            />
            <TopicCard
              avatar="https://images.squarespace-cdn.com/content/v1/5fae7ee3a079b0732627205c/1611312844170-NPUSQI787LC8P84FBY4Z/xiangqi+board"
              topicTitle="Xiangqi"
              numberOfPost={899}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
