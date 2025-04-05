import Swal from "sweetalert2";

export const SuccessCancelPopup = async (
  refundAmount: number
): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title: '<span class="text-green-600">Hủy Bàn Thành Công</span>',
    html: `
        <div class="text-left">
          <div class="flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p class="mb-2">Bạn đã hủy đơn đặt bàn thành công!</p>
          <p class="mb-2 font-medium">Số tiền hoàn lại: ${refundAmount.toLocaleString()} VND</p>
          <p class="font-medium">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
        </div>
      `,
    confirmButtonText: "Quay Lại",
    cancelButtonText: "Đặt bàn mới",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn-confirm mr-2",
      cancelButton: "btn-cancel ml-2",
    },
    buttonsStyling: false,
    icon: "success",
    focusConfirm: false, // Không tự động focus vào nút confirm
    allowOutsideClick: false, // Không cho đóng popup khi click bên ngoài
  });

  // Trả về true nếu nhấn confirm, false nếu nhấn cancel
  return isConfirmed;
};
