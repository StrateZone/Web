"use client";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
} from "@material-tailwind/react";
import Image from "next/image";

import { User } from "../../../constants/types/user.type";

export default function PartnerCard({
  avatar,
  name,
  skillLevel,
  availability,
  preferredTime,
  chessTypes,
  location,
  rating,
  matchesPlayed,
}: User) {
  return (
    <Card color="transparent" shadow={false}>
      <CardHeader floated={false} className="mx-0 mt-0 mb-6 h-48">
        <Image
          width={768}
          height={768}
          src={avatar}
          alt={name}
          className="h-full w-full object-cover"
        />
      </CardHeader>

      <CardBody className="p-0 space-y-2">
        <Typography variant="h5" className="text-blue-gray-900">
          {name}
        </Typography>
        <Typography className="text-sm font-normal text-gray-500">
          {skillLevel} | {availability}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>Preferred Time:</strong> {preferredTime}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>Chess Types:</strong> {chessTypes.join(", ")}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>Location:</strong> {location}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>Rating:</strong> {rating} ⭐ |{" "}
          <strong>Matches Played:</strong> {matchesPlayed}
        </Typography>
      </CardBody>

      <div className="mt-4">
        <Button size="sm" fullWidth>
          Invite to Play
        </Button>
      </div>
    </Card>
  );
}