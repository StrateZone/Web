"use client";
import {
  Button,
  IconButton,
  Tab,
  Tabs,
  TabsHeader,
  Typography,
} from "@material-tailwind/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useLocale, useTranslations } from "next-intl";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import IndexCard from "@/components/card";
import SearchInput from "@/components/input/search_input";
import { DefaultPagination } from "@/components/pagination";

export default function ChessAppointment() {
  const partners = [
    {
      id: 1,
      avatar: "/image/avatar3.jpg",
      name: "John Doe",
      skillLevel: "Advanced",
      availability: "Online",
      preferredTime: "6:00 PM - 8:00 PM",
      chessTypes: ["Chess", "Xiangqi"],
      location: "2 km away",
      rating: 4.8,
      matchesPlayed: 50,
    },
    {
      id: 2,
      avatar: "/image/avatar3.jpg",
      name: "Jane Smith",
      skillLevel: "Intermediate",
      availability: "Busy",
      preferredTime: "7:00 PM - 9:00 PM",
      chessTypes: ["Go"],
      location: "5 km away",
      rating: 4.5,
      matchesPlayed: 30,
    },
    {
      id: 3,
      avatar: "/image/avatar3.jpg",
      name: "Michael Johnson",
      skillLevel: "Beginner",
      availability: "Offline",
      preferredTime: "8:00 PM - 10:00 PM",
      chessTypes: ["Chess"],
      location: "1 km away",
      rating: 3.9,
      matchesPlayed: 10,
    },
    {
      id: 4,
      avatar: "/image/avatar3.jpg",
      name: "Emily Davis",
      skillLevel: "Advanced",
      availability: "Online",
      preferredTime: "5:00 PM - 7:00 PM",
      chessTypes: ["Chess", "Go"],
      location: "3 km away",
      rating: 4.7,
      matchesPlayed: 45,
    },
  ];
  const t = useTranslations("ChessApointment");

  return (
    <>
      <Navbar />
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>

        <img
          src="https://png.pngtree.com/background/20230525/original/pngtree-the-chess-pieces-are-laying-in-a-chaotic-pattern-picture-image_2730698.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            {t("bannerTitle")}
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            {t("bannerDescription")}
          </p>
        </div>
      </div>
      <Tabs value="Chess" className="my-16">
        <div className="w-full flex flex-col items-center">
          <TabsHeader className="h-12 w-72 md:w-96">
            <Tab value="Chess" className="font-medium">
              {t("tabs.chess")}
            </Tab>
            <Tab value="Xiangqi" className="font-medium">
              {t("tabs.xiangqi")}
            </Tab>
            <Tab value="Go" className="font-medium">
              {t("tabs.go")}
            </Tab>
          </TabsHeader>
        </div>
      </Tabs>

      <div className="flex justify-center">
        <SearchInput />
      </div>

      <section className="pb-20 px-8">
        <div className="container mx-auto mb-20 text-center"></div>
        <div className="container mx-auto grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 xl:grid-cols-4">
          {partners.map((props, idx) => (
            <IndexCard key={idx} {...props} />
          ))}
        </div>
      </section>
      <div className="flex justify-center">
        <DefaultPagination />
      </div>

      <Footer />
    </>
  );
}
