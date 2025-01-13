"use client";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
} from "@material-tailwind/react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
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
  const localActive = useLocale();
  const t = useTranslations("PartnerCard");

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
        <Link
          className="flex justify-center"
          href={`/${localActive}/chess_appointment/1`}
        >
          <Typography variant="h5" className="text-blue-gray-900">
            {name}
          </Typography>
        </Link>
        <Typography className="text-sm font-normal text-gray-500">
          {t("skillLevel")}: {skillLevel} | {t("availability")}: {availability}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>{t("preferredTime")}:</strong> {preferredTime}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>{t("chessTypes")}:</strong> {chessTypes.join(", ")}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>{t("location")}:</strong> {location}
        </Typography>
        <Typography className="text-sm font-normal text-gray-700">
          <strong>{t("rating")}:</strong> {rating} ⭐ |{" "}
          <strong>{t("matchesPlayed")}:</strong> {matchesPlayed}
        </Typography>
      </CardBody>

      <div className="mt-4">
        <Button size="sm" fullWidth>
          {t("inviteButton")}
        </Button>
      </div>
    </Card>
  );
}
