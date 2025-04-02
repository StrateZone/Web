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
      <div class="text-left text-black">
        <p>Bạn có chắc chắn muốn đặt bàn với thông tin hiện tại?</p>
        <ul class="list-disc pl-5 my-2">
          <li>Tổng Số bàn: ${chessBookings.length}</li>
          <li>Tổng tiền: ${finalPrice.toLocaleString()}đ</li>
        </ul>
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
