import React from "react";
import { Input } from "@material-tailwind/react";
import { FaSearch } from "react-icons/fa";

export default function SearchInput() {
  return (
    <div className="w-72">
      <Input
        label="Search here..."
        icon={<FaSearch />}
        crossOrigin={undefined}
      />
    </div>
  );
}
