import Swal from "sweetalert2";

export const SuccessCancelPopup = async (
  refundAmount: number
): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title: '<span class="text-green-600">Hủy Bàn Thành Công</span>',
    html: `
      <div class="flex flex-col items-center justify-center text-center">
        <p class="mb-2 font-medium">Bạn đã hủy đơn đặt bàn thành công!</p>
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
    focusConfirm: false,
    allowOutsideClick: false,
  });

  return isConfirmed;
};
