import React from "react";
import { Input } from "@material-tailwind/react";
import { FaSearch } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

export default function SearchInput() {
  const t = useTranslations("ChessApointment");

  return (
    <div className="w-72">
      <Input
        label={t("searchPlaceholder")}
        icon={<FaSearch />}
        crossOrigin={undefined}
      />
    </div>
  );
}
