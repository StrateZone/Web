import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface InsufficientBalanceProps {
  finalPrice?: number; // Optional - có thể bỏ nếu không cần hiển thị tổng tiền
}

export const InsufficientBalancePopup = async ({
  finalPrice,
}: InsufficientBalanceProps = {}): Promise<boolean> => {
  const { isConfirmed } = await MySwal.fire({
    title: "Số dư không đủ",
    html: (
      <div className="text-center text-black">
        <p className="mb-4">
          {finalPrice
            ? `Số dư trong ví không đủ để thanh toán ${finalPrice.toLocaleString()}đ.`
            : "Số dư trong ví không đủ để thanh toán."}
        </p>
        <p>Bạn có muốn chuyển đến trang nạp tiền ngay bây giờ?</p>
      </div>
    ),
    icon: "error",
    showCancelButton: true,
    confirmButtonText: "Đến trang nạp tiền",
    cancelButtonText: "Ở lại",
    buttonsStyling: false,
    customClass: {
      confirmButton: "btn-confirm mr-2",
      cancelButton: "btn-cancel ml-2",
    },
    reverseButtons: true,
    focusCancel: true,
  });

  return isConfirmed;
};
