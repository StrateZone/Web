import Swal from "sweetalert2";

interface CloseBooking {
  tableId: number;
  startTime: string;
  gameType: string;
  roomType: string;
}

interface CloseTimeWarningProps {
  closeBookings: CloseBooking[];
}

const translateRoomType = (roomType: string): string => {
  const type = roomType.toLowerCase();
  if (type.includes("basic")) return "Phòng thường";
  if (type.includes("premium")) return "Phòng cao cấp";
  if (type.includes("openspace") || type.includes("open space"))
    return "Không gian mở";
  return roomType;
};

const GAME_TYPE_TRANSLATIONS: Record<string, string> = {
  chess: "Cờ Vua",
  xiangqi: "Cờ Tướng",
  go: "Cờ Vây",
};

export const CloseTimeWarningPopup = async ({
  closeBookings,
}: CloseTimeWarningProps): Promise<boolean> => {
  const bookingList = closeBookings
    .map((b) => {
      const translatedGame = GAME_TYPE_TRANSLATIONS[b.gameType] || b.gameType;
      const translatedRoom = translateRoomType(b.roomType);
      return `
        <li class="py-2 border-b border-gray-100 last:border-0">
          <div class="flex justify-between items-start">
            <div>
              <span class="font-medium">Bàn ${b.tableId}</span>
              <span class="text-gray-500 text-sm ml-2">Giờ bắt đầu:${b.startTime}</span>
            </div>
            <div class="text-right">
              <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">${translatedGame}</span>
            </div>
          </div>
          <div class="text-sm text-gray-600 mt-1">Phòng: ${translatedRoom}</div>
        </li>
      `;
    })
    .join("");

  const { isConfirmed } = await Swal.fire({
    title: "Bàn sắp đến giờ",
    html: `
      <div class="text-left">
        <p class="text-gray-700 mb-4">Các bàn sau có giờ bắt đầu dưới 1 tiếng 30 phút và <span class="font-semibold text-red-600">không thể hủy</span> sau khi đặt:</p>
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-60 overflow-y-auto">
          <ul class="divide-y divide-gray-200">
            ${bookingList}
          </ul>
        </div>
        <p class="mt-4 text-gray-700">Bạn có muốn tiếp tục đặt không?</p>
      </div>
    `,
    icon: "warning",
    iconHtml: `
      <svg class="w-14 h-14 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
    `,
    showCancelButton: true,
    confirmButtonText: "Tiếp tục",
    cancelButtonText: "Hủy",
    buttonsStyling: false,
    customClass: {
      confirmButton:
        "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-md shadow-sm transition duration-150 ease-in-out",
      cancelButton:
        "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-md shadow-sm transition duration-150 ease-in-out",
      actions: "flex justify-center gap-4 mt-4",
      popup: "rounded-xl border border-gray-200 py-5 px-6",
      icon: "!border-none !bg-transparent !w-auto !h-auto !mx-auto !mb-3",
    },
    reverseButtons: false,
    focusConfirm: false,
    showClass: {
      popup: "animate__animated animate__fadeIn animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOut animate__faster",
    },
  });

  return isConfirmed;
};
