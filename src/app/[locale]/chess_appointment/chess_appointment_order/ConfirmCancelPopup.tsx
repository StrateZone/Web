import Swal from "sweetalert2";

export const ConfirmCancelPopup = async (): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title: "Xác nhận hủy bàn",
    html: `
      <div class="text-center text-black">
        <p class="m-0">Bạn sẽ hủy hết lời mời bạn khi hủy bàn</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
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
