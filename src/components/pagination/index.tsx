// import React from "react";
// import { Button, IconButton } from "@material-tailwind/react";
// import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
// import { useLocale, useTranslations } from "next-intl";

// export function DefaultPagination() {
//   const [active, setActive] = React.useState(1);
//   const t = useTranslations("ChessApointment");

//   const getItemProps = (index: any) =>
//     ({
//       variant: active === index ? "filled" : "text",
//       color: "gray",
//       onClick: () => setActive(index),
//     }) as any;

//   const next = () => {
//     if (active === 5) return;

//     setActive(active + 1);
//   };

//   const prev = () => {
//     if (active === 1) return;

//     setActive(active - 1);
//   };

//   return (
//     <div className="flex items-center gap-4">
//       <Button
//         variant="text"
//         className="flex items-center gap-2"
//         onClick={prev}
//         disabled={active === 1}
//       >
//         <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />{" "}
//         {t("pagination.previous")}
//       </Button>
//       <div className="flex items-center gap-2">
//         <IconButton {...getItemProps(1)}>1</IconButton>
//         <IconButton {...getItemProps(2)}>2</IconButton>
//         <IconButton {...getItemProps(3)}>3</IconButton>
//         <IconButton {...getItemProps(4)}>4</IconButton>
//         <IconButton {...getItemProps(5)}>5</IconButton>
//       </div>
//       <Button
//         variant="text"
//         className="flex items-center gap-2"
//         onClick={next}
//         disabled={active === 5}
//       >
//         {t("pagination.next")}

//         <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// }
import React from "react";
import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("ChessApointment");
  const [inputPage, setInputPage] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);

<<<<<<< HEAD
  // Xử lý khi không có trang nào
  if (totalPages <= 0) return null;

  const getItemProps = (index: number) => ({
    variant: (currentPage === index ? "filled" : "text") as "filled" | "text",
    color: (currentPage === index ? "blue" : "gray") as "blue" | "gray",
    onClick: () => onPageChange(index),
    className: "rounded-full",
=======
  const getItemProps = (index: number) => ({
    variant: currentPage === index ? "filled" : "text",
    color: currentPage === index ? "" : "blue-gray",
    onClick: () => {
      console.log("Người dùng chọn trang:", index);
      onPageChange(index);
    },
>>>>>>> dc47781 (add appoinment flow)
  });

  const next = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const prev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
<<<<<<< HEAD
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
    const range = 2;
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    if (currentPage - range <= 1) {
      end = Math.min(range * 2 + 1, totalPages);
    }
    if (currentPage + range >= totalPages) {
      start = Math.max(totalPages - range * 2, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        {/* Nút Previous */}
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={prev}
          disabled={currentPage === 1}
        >
          <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
          <span className="hidden sm:inline">{t("pagination.previous")}</span>
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
          <span className="hidden sm:inline">{t("pagination.next")}</span>
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
=======
  };

  return (
    <div className="flex items-center gap-4">
      {/* Nút Previous */}
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={prev}
        disabled={currentPage === 1}
      >
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />{" "}
        {t("pagination.previous")}
      </Button>

      {/* Danh sách số trang */}
      <div className="flex items-center gap-2">
        {[...Array(totalPages)].map((_, index) => (
          <IconButton key={index + 1} {...getItemProps(index + 1)}>
            {index + 1}
          </IconButton>
        ))}
      </div>

      {/* Nút Next */}
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={next}
        disabled={currentPage === totalPages}
      >
        {t("pagination.next")}
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
>>>>>>> dc47781 (add appoinment flow)
    </div>
  );
}
