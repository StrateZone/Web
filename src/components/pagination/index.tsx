import React from "react";
import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DefaultPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [inputPage, setInputPage] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);

  // Xử lý khi không có trang nào
  if (totalPages <= 0) return null;

  const getItemProps = (index: number) => ({
    variant: (currentPage === index ? "filled" : "text") as "filled" | "text",
    color: (currentPage === index ? "blue" : "gray") as "blue" | "gray",
    onClick: () => onPageChange(index),
    className: "rounded-full",
  });

  const next = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const prev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleGoClick = () => {
    const page = parseInt(inputPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setIsInvalid(false);
      setInputPage("");
    } else {
      setIsInvalid(true);
    }
  };

  const getVisiblePages = () => {
    const range = 1; // Giảm range để hiển thị ít trang hơn
    const maxPagesToShow = range * 2 + 1;

    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    if (end - start + 1 < maxPagesToShow) {
      if (currentPage - range < 1) {
        end = Math.min(maxPagesToShow, totalPages);
        start = 1;
      } else if (currentPage + range > totalPages) {
        start = Math.max(totalPages - maxPagesToShow + 1, 1);
        end = totalPages;
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-black">
      <div className="flex items-center gap-2">
        {/* Nút Previous */}
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={prev}
          disabled={currentPage === 1}
        >
          <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
          <span className="hidden sm:inline">{"Trước"}</span>
        </Button>

        {/* Danh sách trang */}
        <div className="flex items-center gap-1">
          {/* Trang đầu tiên */}
          {currentPage > 3 && (
            <>
              <IconButton {...getItemProps(1)}>1</IconButton>
              {currentPage > 4 && <span className="mx-1">...</span>}
            </>
          )}

          {/* Các trang trong khoảng */}
          {getVisiblePages().map((page) => (
            <IconButton key={page} {...getItemProps(page)}>
              {page}
            </IconButton>
          ))}

          {/* Trang cuối cùng */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="mx-1">...</span>
              )}
              <IconButton {...getItemProps(totalPages)}>
                {totalPages}
              </IconButton>
            </>
          )}
        </div>

        {/* Nút Next */}
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={next}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">{"Sau"}</span>
          <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
        </Button>
      </div>

      {/* Input nhảy trang với nút Go */}
      <div className="flex items-center gap-2 text-black">
        <span className="text-sm hidden sm:inline ">Go to:</span>
        <div className="relative">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => {
              setInputPage(e.target.value);
              setIsInvalid(false);
            }}
            className={`w-16 px-2 py-1 border rounded text-sm ${
              isInvalid ? "border-red-500" : ""
            }`}
            placeholder={currentPage.toString()}
            onKeyDown={(e) => e.key === "Enter" && handleGoClick()}
          />
          {isInvalid && (
            <span className="absolute -bottom-5 left-0 text-xs text-red-500">
              Invalid page
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleGoClick}
          disabled={!inputPage}
          className="px-3 py-1"
        >
          Go
        </Button>
      </div>
    </div>
  );
}
