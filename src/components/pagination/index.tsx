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

  const getItemProps = (index: number) => ({
    variant: currentPage === index ? "filled" : "text",
    color: currentPage === index ? "" : "blue-gray",
    onClick: () => {
      console.log("Người dùng chọn trang:", index);
      onPageChange(index);
    },
  });

  const next = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const prev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
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
    </div>
  );
}
