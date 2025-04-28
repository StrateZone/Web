import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface AlreadyRejectedPopupProps {
  opponentName: string;
  tableId: number;
  startTime: string;
  endTime: string;
  onConfirm?: () => void; // Thêm callback tùy chọn
}

export const AlreadyRejectedPopup = async ({
  opponentName,
  tableId,
  startTime,
  endTime,
  onConfirm,
}: AlreadyRejectedPopupProps): Promise<void> => {
  await MySwal.fire({
    html: (
      <div className="text-left font-sans p-4">
        <div className="flex items-center justify-center mb-6">
          <span className="text-2xl font-semibold text-red-600">
            Không Thể Thanh Toán
          </span>
        </div>

        <p className="mb-4 text-gray-800 text-base leading-relaxed">
          Lời mời đánh cờ từ{" "}
          <strong className="font-semibold">{opponentName}</strong> đã bị hủy
          hoặc được chấp nhận bởi người chơi khác trước bạn.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Bàn số:</p>
              <p className="text-lg font-bold text-gray-900">#{tableId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Thời gian:</p>
              <p className="text-lg font-medium text-gray-900">
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

        <p className="text-gray-500 text-sm italic">
          Vui lòng kiểm tra lại lời mời hoặc tạo cuộc hẹn mới để tiếp tục.
        </p>
      </div>
    ),
    icon: "error",
    confirmButtonText: "Đã Hiểu",
    customClass: {
      confirmButton:
        "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-200",
      popup: "max-w-lg rounded-2xl p-6",
      title: "text-2xl font-bold text-gray-900 mb-4",
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  // Gọi callback nếu được cung cấp
  if (onConfirm) {
    onConfirm();
  }
};
