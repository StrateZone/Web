import Swal from "sweetalert2";

export const SuccessBookingPopup = async (): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title: '<span class="text-green-600">Đặt bàn thành công!</span>',
    html: `
      <div class="text-left">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p class="mb-2">Bạn đã đặt bàn thành công!</p>
        <p class="font-medium">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
      </div>
    `,
    confirmButtonText: "Xem chi tiết đơn đặt",
    cancelButtonText: "Đặt bàn mới",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn-confirm mr-2",
      cancelButton: "btn-cancel ml-2",
    },
    buttonsStyling: false,
    icon: "success",
  });

  return isConfirmed;
};
