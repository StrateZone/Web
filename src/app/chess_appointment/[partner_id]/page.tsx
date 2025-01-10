"use client";
import React from "react";
import {
  FaChess,
  FaMapMarkerAlt,
  FaStar,
  FaCalendarAlt,
  FaUserAlt,
} from "react-icons/fa";
import {
  Button,
  Card,
  Typography,
  Avatar,
  Chip,
} from "@material-tailwind/react";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PartnerId() {
  return (
    <>
      <Navbar />
      <Card className="w-full shadow-xl overflow-hidden rounded-none">
        <div className="h-[140px] bg-[url('https://i.pinimg.com/736x/54/76/be/5476be3d48e1190b7afc56e272ecfd39.jpg')] bg-cover bg-no-repeat"></div>
        <div className="p-6 flex flex-col gap-6">
          <Avatar
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
            alt="Partner Avatar"
            size="xxl"
            className="-mt-14 border-4 border-white"
          />

          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              Emily Davis
            </Typography>
            <Typography variant="small" className="text-gray-600">
              @chessmaster123
            </Typography>
          </div>

          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-600" />
            <Typography variant="small" className="text-gray-600">
              Location: New York, USA
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <FaStar className="text-gray-600" />
            <Typography variant="small" className="text-gray-600">
              Skill Level: Expert (Chess), Intermediate (Go)
            </Typography>
          </div>

          <div className="flex gap-3 flex-wrap">
            {["Chess Master", "Go Enthusiast", "Strategist"].map((tag) => (
              <Chip
                key={tag}
                value={tag}
                className={`${
                  tag === "Chess Master"
                    ? "bg-yellow-100 text-yellow-800"
                    : tag === "Go Enthusiast"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button color="blue" size="sm" variant="outlined">
              Follow on Twitter
            </Button>
          </div>

          <div className="flex gap-2">
            <Button color="gray" size="sm" variant="outlined">
              Invite to Play
            </Button>
            <Button color="blue" size="sm">
              Send Message
            </Button>
          </div>

          <Typography variant="h6" className="text-black">
            About
          </Typography>
          <Typography className="text-black">
            Emily Davis is a chess player with 10 years of experience who enjoys
            chess, Xiangqi, and Go. She frequently participates in tournaments
            and is an active member of the StrateZone club.
          </Typography>

          {/* Gợi ý 2: Thông tin về các sự kiện */}
          <Typography variant="h6" className="text-black">
            Upcoming Tournaments
          </Typography>
          <div className="flex flex-col gap-3">
            {["Chess Grand Prix 2024", "Go Tournament - Regional 2024"].map(
              (event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded border w-full"
                >
                  <FaCalendarAlt className="text-black" />
                  <Typography className="text-black font-bold">
                    {event}
                  </Typography>
                </div>
              ),
            )}
          </div>

          <Typography variant="h6" className="text-black">
            Playing History
          </Typography>
          <div className="flex flex-col gap-3">
            {[
              "Chess Champion - National Tournament 2023",
              "Runner-up - Go Regional 2022",
              "Organizer - Chess Meetup 2021",
            ].map((experience, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded border w-full"
              >
                <FaChess className="text-black" />
                <Typography className="text-black font-bold">
                  {experience}
                </Typography>
              </div>
            ))}
          </div>

          <Typography variant="h6" className="text-black">
            Reviews
          </Typography>
          <div className="flex flex-col gap-3">
            {[
              "Emily is an amazing player! Highly recommend!",
              "Great strategist, but needs to improve in Go.",
            ].map((review, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded border w-full"
              >
                <FaUserAlt className="text-black" />
                <Typography className="text-black font-bold">
                  {review}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Footer />
    </>
  );
}
