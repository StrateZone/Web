import Swal from "sweetalert2";

export const SuccessCancelPopup = async (
  refundAmount: number
): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title:
      '<span class="text-xl font-semibold text-green-600">Hủy Bàn Thành Công</span>',
    html: `
      <div class="text-center">
        <div class="flex items-center justify-center mb-3">
          <svg class="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <p class="text-gray-700 mb-2 text-base font-medium">Bạn đã hủy đơn đặt bàn thành công!</p>
        ${
          refundAmount > 0
            ? `<p class="bg-green-50 border border-green-100 text-green-700 rounded-md py-1.5 px-3 inline-block mb-3 text-sm">
            Số tiền hoàn lại: <span class="font-semibold">${refundAmount.toLocaleString()}đ</span>
          </p>`
            : ""
        }
        <p class="text-gray-500 text-sm">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Quay lại",
    cancelButtonText: "Đặt bàn mới",
    buttonsStyling: false,
    customClass: {
      confirmButton:
        "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors duration-200",
      cancelButton:
        "bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-5 rounded-lg border border-gray-300 text-sm transition-colors duration-200",
      actions: "flex justify-center gap-3 mt-4",
      popup: "rounded-xl border border-gray-200 py-5 px-6 max-w-sm",
    },
    icon: false,
    focusConfirm: false,
    allowOutsideClick: false,
    showClass: {
      popup: "animate__animated animate__fadeIn animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOut animate__faster",
    },
  });

  return isConfirmed;
};
