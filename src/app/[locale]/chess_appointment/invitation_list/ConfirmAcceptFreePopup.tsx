import Swal from "sweetalert2";

// Định nghĩa interface cho thông tin bàn chơi
interface TableInfo {
  tableId: number;
  roomName: string;
  gameType: string;
  roomType: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  opponentName: string;
  opponentRank: string;
}

interface ConfirmAcceptFreeProps {
  tableInfo: TableInfo;
}

// Utility function to format time in Vietnamese locale
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Utility function to format date in Vietnamese locale
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

// Utility function to map room type to display name
const getRoomTypeDisplay = (roomType: string): string => {
  switch (roomType) {
    case "basic":
      return "Phòng Thường";
    case "premium":
      return "Phòng Cao Cấp";
    default:
      return "Không Gian Mở";
  }
};

export const ConfirmAcceptFreePopup = async ({
  tableInfo,
}: ConfirmAcceptFreeProps): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title:
      '<h2 class="text-2xl font-bold text-gray-800">Xác nhận chấp nhận lời mời</h2>',
    html: `
      <div class="text-left text-gray-700 space-y-6">
        <!-- Table Information Section -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin bàn chơi</h3>
          <ul class="space-y-2 text-sm">
            <li><span class="font-medium">Loại cờ:</span> ${tableInfo.gameType}</li>
            <li><span class="font-medium">Loại phòng:</span> ${getRoomTypeDisplay(
              tableInfo.roomType
            )}</li>
            <li><span class="font-medium">Ngày:</span> ${formatDate(
              tableInfo.startTime
            )}</li>
            <li><span class="font-medium">Thời gian:</span> ${formatTime(
              tableInfo.startTime
            )} - ${formatTime(tableInfo.endTime)}</li>
    
     
          </ul>
        </div>
        <!-- Note about free invitation -->
        <div class="border-t pt-4">
          <p class="text-green-600 font-semibold">
            Lời mời này đã được người gửi thanh toán
          </p>
        </div>
      </div>
    `,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Chấp nhận",
    cancelButtonText: "Hủy",
    buttonsStyling: false,
    customClass: {
      confirmButton: `
        bg-green-600 
        text-white 
        px-5 
        py-2.5 
        rounded-lg 
        font-medium 
        hover:bg-green-700 
        transition-colors
        mx-2
      `,
      cancelButton: `
        bg-gray-200 
        text-gray-700 
        px-5 
        py-2.5 
        rounded-lg 
        font-medium 
        hover:bg-gray-300 
        transition-colors
        mx-2
      `,
      popup: "rounded-xl p-6 max-w-md",
      title: "mb-4",
      htmlContainer: "text-base",
    },
    reverseButtons: true,
  });

  return isConfirmed;
};
