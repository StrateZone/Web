import React from "react";
import { Input } from "@material-tailwind/react";
import { FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function SearchInput() {
  const t = useTranslations("ChessApointment");

  return (
    <div className="relative w-72">
      <Input
        label={t("searchPlaceholder")}
        crossOrigin={undefined}
        className="pr-10"
      />
      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-300 active:scale-90 rounded-full transition-all">
        <FaSearch className="text-gray-500" />
      </button>
    </div>
  );
}
