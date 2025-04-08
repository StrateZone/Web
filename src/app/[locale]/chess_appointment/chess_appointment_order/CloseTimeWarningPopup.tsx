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
        <li class="mb-1">
          Bàn <strong>${b.tableId}</strong> lúc <strong>${b.startTime}</strong><br/>
          <small>Loại cờ: ${translatedGame} | Phòng: ${translatedRoom}</small>
        </li>
      `;
    })
    .join("");

  const { isConfirmed } = await Swal.fire({
    title: "Bàn sắp đến giờ",
    html: `
      <div class="text-left text-black">
        <p>Các bàn sau đây có thời gian bắt đầu dưới 1 tiếng 30 phút và <strong>không thể hủy</strong> sau khi đặt:</p>
        <ul class="list-disc pl-5 my-2">
          ${bookingList}
        </ul>
        <p>Bạn có muốn tiếp tục đặt không?</p>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Tiếp tục",
    cancelButtonText: "Hủy",
    buttonsStyling: false,
    customClass: {
      confirmButton: "btn-confirm mr-2",
      cancelButton: "btn-cancel ml-2",
    },
    reverseButtons: true,
  });

  return isConfirmed;
};
