import Swal from "sweetalert2";

interface ConfirmBookingProps {
  chessBookings: any[];
  finalPrice: number;
}

export const ConfirmBookingPopup = async ({
  chessBookings,
  finalPrice,
}: ConfirmBookingProps): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title: "Xác nhận đặt bàn",
    html: `
      <div class="text-center">
        <p class="mb-4 text-gray-700">Bạn có chắc chắn muốn đặt bàn với thông tin sau?</p>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mx-auto max-w-md">
          <ul class="space-y-2 text-gray-800">
            <li class="flex justify-between">
              <span class="font-medium">Tổng số bàn:</span>
              <span class="font-semibold">${chessBookings.length}</span>
            </li>
            <li class="flex justify-between">
              <span class="font-medium">Tổng tiền:</span>
              <span class="font-semibold text-blue-600">${finalPrice.toLocaleString()}đ</span>
            </li>
          </ul>
        </div>
      </div>
    `,
    icon: "question",
    iconHtml: `
      <div class="swal2-icon-scale">
        <svg class="w-14 h-14 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
        </svg>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
    buttonsStyling: false,
    customClass: {
      confirmButton:
        "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-md shadow-sm transition duration-150 ease-in-out",
      cancelButton:
        "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-md shadow-sm transition duration-150 ease-in-out",
      actions: "flex justify-center gap-3 w-full",
      popup: "rounded-lg border border-gray-200 py-4", // Thêm padding dọc
      icon: "!border-none !bg-transparent !w-auto !h-auto !mx-auto !mb-4", // Tăng margin-bottom
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
