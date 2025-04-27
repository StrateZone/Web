import React, { useState } from "react";
import { Input } from "@material-tailwind/react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const t = useTranslations("ChessApointment");
  const [query, setQuery] = useState<string>("");

  // Update query state without triggering search
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Trigger search when search button is clicked
  const handleSearchClick = () => {
    onSearch(query);
  };

  // Clear input and trigger search with empty query
  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  // Trigger search when Enter key is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-72">
      <Input
        label={t("searchPlaceholder")}
        crossOrigin={undefined}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={t("searchPlaceholder")}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-300 active:scale-90 rounded-full transition-all"
          aria-label="Clear search"
        >
          <FaTimes className="text-gray-500" />
        </button>
      )}
      <button
        onClick={handleSearchClick}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-300 active:scale-90 rounded-full transition-all"
        aria-label="Search"
      >
        <FaSearch className="text-gray-500" />
      </button>
    </div>
  );
}
