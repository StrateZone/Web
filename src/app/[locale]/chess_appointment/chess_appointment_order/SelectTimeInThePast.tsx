import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface PastBooking {
  tableId: number;
  startTime: string;
  endTime: string;
}

interface PastTimePopupProps {
  pastBookings: PastBooking[];
}

export const PastTimePopup = async ({
  pastBookings,
}: PastTimePopupProps): Promise<void> => {
  await MySwal.fire({
    title: "Thời gian không hợp lệ",
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
            Thời gian đã qua
          </span>
        </div>

        <p className="mb-3">
          Các bàn sau có thời gian bắt đầu trong quá khứ và không thể đặt:
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
              {pastBookings.map((booking) => (
                <tr key={booking.tableId} className="border-b">
                  <td className="py-2 font-bold">#{booking.tableId}</td>
                  <td className="py-2 text-red-500">{booking.startTime}</td>
                  <td className="py-2">{booking.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm italic text-gray-600">
          Hệ thống sẽ tự động xóa các bàn đã qua trong quá khứ. Vui lòng kiểm
          tra lại đơn để tiếp tục
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
