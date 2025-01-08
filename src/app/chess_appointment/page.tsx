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

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import IndexCard from "@/components/card";
import SearchInput from "@/components/input/search_input";
import { DefaultPagination } from "@/components/pagination";

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

export default function ChessAppointment() {
  return (
    <>
      <Navbar />
      <div className="relative min-h-[50vh] w-full bg-[url('https://i.pinimg.com/736x/54/76/be/5476be3d48e1190b7afc56e272ecfd39.jpg')] bg-cover bg-no-repeat">
        <div className="absolute inset-0 h-full w-full bg-gray-900/60" />
        <div className="grid min-h-[50vh] px-8">
          <div className="container relative z-10 my-auto mx-auto grid place-items-center text-center">
            <Typography variant="h2" color="white" className="lg:max-w-3xl">
              Find Your Perfect Chess Partner
            </Typography>
            <Typography
              variant="lead"
              color="white"
              className="mt-1 mb-8 w-full md:max-w-full lg:max-w-2xl"
            >
              Discover like-minded chess enthusiasts, connect with players who
              share your passion, and schedule exciting matches that suit your
              skills and preferences.
            </Typography>
            <div className="flex items-center gap-4">
              <Button variant="gradient" color="white">
                Find Partners
              </Button>
              <IconButton className="rounded-full bg-white p-6">
                <PlayIcon className="h-4 w-4 text-gray-900" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      <Tabs value="Chess" className="my-16">
        <div className="w-full flex flex-col items-center">
          <TabsHeader className="h-12 w-72 md:w-96">
            <Tab value="Chess" className="font-medium">
              Chess
            </Tab>
            <Tab value="Xiangqi" className="font-medium">
              Xiangqi
            </Tab>
            <Tab value="Go" className="font-medium">
              Go
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
        {" "}
        <DefaultPagination />
      </div>

      <Footer />
    </>
  );
}
