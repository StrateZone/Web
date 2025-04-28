"use client";
import Swal from "sweetalert2";

export const SuccessPaymentPopup = async (
  totalPrice: number
): Promise<void> => {
  await Swal.fire({
    title:
      '<span class="text-2xl font-semibold text-green-600">Thanh toán thành công!</span>',
    html: `
      <div class="text-center">
        <div class="flex items-center justify-center mb-5">
          <svg class="w-14 h-14 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <p class="text-gray-700 mb-3 text-lg">Thanh toán ${totalPrice.toLocaleString()}đ thành công!</p>
        <p class="text-gray-600 font-medium">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
      </div>
    `,
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      confirmButton:
        "bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors duration-200",
      actions: "flex justify-center mt-5",
      popup: "rounded-xl border border-gray-200 py-6 px-7 max-w-md",
    },
    focusConfirm: false,
    showClass: {
      popup: "animate__animated animate__fadeIn animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOut animate__faster",
    },
  });
};
