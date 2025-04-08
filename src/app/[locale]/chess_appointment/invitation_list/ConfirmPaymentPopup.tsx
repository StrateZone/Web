import Swal from "sweetalert2";

interface ConfirmPaymentProps {
  tableInfo: {
    tableId: number;
    roomName: string;
    gameType: string;
    roomType: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    opponentName: string;
    opponentRank: string;
  };
  currentBalance?: number;
}

export const ConfirmPaymentPopup = async ({
  tableInfo,
  currentBalance,
}: ConfirmPaymentProps): Promise<boolean> => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const hasSufficientBalance =
    currentBalance !== undefined
      ? currentBalance >= tableInfo.totalPrice
      : true;

  const { isConfirmed } = await Swal.fire({
    title: "Xác nhận thanh toán",
    html: `
      <div class="text-left text-black">
        <div class="mb-4">
          <h3 class="font-bold">Thông tin bàn chơi</h3>
          <ul class="pl-5 space-y-1 mt-2">
            <li><strong>Loại cờ:</strong> ${tableInfo.gameType}</li>
            <li><strong>Loại phòng:</strong> ${
              tableInfo.roomType === "basic"
                ? "Phòng Thường"
                : tableInfo.roomType === "premium"
                  ? "Phòng Cao Cấp"
                  : "Không Gian Mở"
            }</li>
            <li><strong>Ngày:</strong> ${formatDate(tableInfo.startTime)}</li>
            <li><strong>Thời gian:</strong> ${formatTime(
              tableInfo.startTime
            )} - ${formatTime(tableInfo.endTime)}</li>
          </ul>
        </div>

        <div class="mb-4">
          <h3 class="font-bold">Thông tin đối thủ</h3>
          <ul class="pl-5 space-y-1 mt-2">
            <li><strong>Tên:</strong> ${tableInfo.opponentName}</li>
            <li><strong>Trình độ:</strong> ${tableInfo.opponentRank}</li>
          </ul>
        </div>

        <div class="border-t pt-3">
          <p class="text-lg"><strong>Số Tiền Cần Trả:</strong> ${tableInfo.totalPrice.toLocaleString()}đ</p>
        </div>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Xác nhận thanh toán",
    cancelButtonText: "Hủy",
    buttonsStyling: false,
    customClass: {
      confirmButton: `${
        hasSufficientBalance ? "bg-blue-500" : "bg-yellow-500"
      } text-white px-4 py-2 rounded-md mx-2 hover:opacity-80`,
      cancelButton:
        "bg-gray-300 text-gray-700 px-4 py-2 rounded-md mx-2 hover:opacity-80",
    },
    reverseButtons: false,
  });

  return isConfirmed;
};

// ${
//     currentBalance !== undefined
//       ? `<p class="${hasSufficientBalance ? "text-green-600" : "text-red-600"}">
//          <strong>Số dư ví:</strong> ${currentBalance.toLocaleString()}đ
//          ${
//            !hasSufficientBalance
//              ? '<span class="block text-sm mt-1">(Số dư không đủ, bạn sẽ được chuyển đến trang nạp tiền)</span>'
//              : ""
//          }
//        </p>`
//       : ""
//   }
