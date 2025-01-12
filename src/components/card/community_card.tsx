"use client";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import React from "react";

export type CommunityCardProps = {
  theme: string;
  avatar: string;
  title?: string;
  description?: string;
  dateTime?: string;
  likes?: number;
};

export default function CommunityCard({
  theme,
  avatar,
  title,
  description,
  dateTime,
  likes,
}: CommunityCardProps) {
  const buttonColors: { [key in CommunityCardProps["theme"]]: string } = {
    Chess: "bg-gray-900 text-white ",
    Go: "bg-yellow-600 text-black",
    Xiangqi: "bg-red-700 text-white",
  };

  return (
    <Card className="w-full border-2 border-b-4 border-gray-200 rounded-xl hover:bg-gray-50 my-2">
      <CardBody className="grid grid-cols-6 p-5 gap-y-2">
        <div className="flex items-center justify-center">
          <Button
            variant="outlined"
            className="flex items-center gap-3 col-span-1 md:col-span-1 justify-center py-2 px-4 border-2 border-gray-300 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            {likes}
          </Button>
        </div>

        <div className="col-span-5 md:col-span-4 ml-4">
          <Button
            size="sm"
            className={`rounded ${buttonColors[theme]} text-xs mb-1`}
          >
            {theme}
          </Button>
          <Typography className="text-sky-500 font-bold text-lg">
            {title}
          </Typography>
          <div className="flex gap-1">
            <Avatar size="xs" src={avatar} alt="avatar" />
            <Typography className="text-gray-600">{description}</Typography>
            <Typography className="text-gray-600">-</Typography>
            <Typography className="text-gray-600">{dateTime}</Typography>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
