import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface UnavailableTablesPopupProps {
  unavailableTables: number[];
}

export const UnavailableTablesPopup = async ({
  unavailableTables,
}: UnavailableTablesPopupProps): Promise<void> => {
  await MySwal.fire({
    title: "Bàn không khả dụng",
    html: (
      <div className="text-center">
        <p className="text-red-500 mb-2">Các bàn sau đã được đặt trước:</p>
        <div className="font-bold text-lg mb-4">
          {unavailableTables.join(", ")}
        </div>
        <p>Vui lòng chọn bàn khác hoặc thời gian khác</p>
      </div>
    ),
    icon: "error",
    confirmButtonText: "Đã hiểu",
    customClass: {
      confirmButton:
        "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md",
      popup: "max-w-md",
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: true,
  });
};
