import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface AlreadyRejectedPopupProps {
  opponentName: string;
  tableId: number;
  startTime: string;
  endTime: string;
}

export const AlreadyRejectedPopup = async ({
  opponentName,
  tableId,
  startTime,
  endTime,
}: AlreadyRejectedPopupProps): Promise<void> => {
  await MySwal.fire({
    title: "Lời Mời Đã Bị Từ Chối",
    html: (
      <div className="text-left">
        <div className="flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-500 mr-2"
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
            Không Thể Thanh Toán
          </span>
        </div>

        <p className="mb-3">
          Lời mời đánh cờ từ <strong>{opponentName}</strong> đã bị hủy hoặc bị
          chấp nhận bởi người chơi khác trước bạn.
        </p>

        <div className="bg-gray-100 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium">Bàn số:</p>
              <p className="font-bold">#{tableId}</p>
            </div>
            <div>
              <p className="font-medium">Thời gian:</p>
              <p>
                {new Date(startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(endTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          Vui lòng kiểm tra lại lời mời hoặc tạo cuộc hẹn mới.
        </p>
      </div>
    ),
    icon: "error",
    confirmButtonText: "Đã hiểu",
    customClass: {
      confirmButton:
        "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow",
      popup: "max-w-md",
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};
