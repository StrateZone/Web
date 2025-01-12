"use client";
import React from "react";
import { Avatar, Card, CardHeader, Typography } from "@material-tailwind/react";

export type TopicCardProps = {
  avatar: string;
  topicTitle: string;
  numberOfPost: number;
};

export default function TopicCard({
  avatar,
  topicTitle,
  numberOfPost,
}: TopicCardProps) {
  return (
    <Card
      color="transparent"
      shadow={false}
      className="w-full max-w-[26rem] border-2 border-gray-200 p-2 my-1"
    >
      <CardHeader
        color="transparent"
        floated={false}
        shadow={false}
        className="mx-0 flex items-center justify-start gap-4"
      >
        <Avatar size="lg" variant="circular" src={avatar} alt="tania andrew" />
        <div className="flex w-full flex-col justify-center gap-0.5">
          <div className="flex items-center justify-between">
            <Typography variant="h5" color="blue-gray">
              {topicTitle}
            </Typography>
          </div>
          <Typography color="blue-gray">{numberOfPost} posts</Typography>
        </div>
      </CardHeader>
    </Card>
  );
}
