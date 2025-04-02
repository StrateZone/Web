import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface UnavailableTable {
  tableId: number;
  startTime: string;
  endTime: string;
}

interface UnavailableTablesPopupProps {
  unavailableTables: UnavailableTable[];
}

export const UnavailableTablesPopup = async ({
  unavailableTables,
}: UnavailableTablesPopupProps): Promise<void> => {
  await MySwal.fire({
    title: "Bàn không khả dụng",
    html: (
      <div className="text-left">
        <div className="flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xl font-bold text-red-500">
            Bàn đã được đặt trước
          </span>
        </div>

        <p className="mb-3">
          Các bàn sau đã được đặt trước bởi người dùng khác trong khung giờ bạn
          chọn:
        </p>

        <div className="bg-gray-100 rounded-lg p-3 mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Bàn số</th>
                <th className="text-left py-2">Bắt đầu</th>
                <th className="text-left py-2">Kết thúc</th>
              </tr>
            </thead>
            <tbody>
              {unavailableTables.map((table) => (
                <tr key={table.tableId} className="border-b">
                  <td className="py-2 font-bold">#{table.tableId}</td>
                  <td className="py-2 text-red-500">{table.startTime}</td>
                  <td className="py-2">{table.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm italic text-gray-600">
          Hệ thống sẽ tự động xóa các bàn không khả dụng. Vui lòng chọn bàn khác
          hoặc khung giờ khác để tiếp tục
        </p>
      </div>
    ),
    icon: "error",
    confirmButtonText: "Đã hiểu",
    customClass: {
      confirmButton:
        "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow",
      popup: "max-w-2xl",
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};
