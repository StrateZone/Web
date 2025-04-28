import React from "react";

interface RefundInfo {
  message: string;
  refundAmount: number;
  cancellationTime: string;
  cancellation_Block_TimeGate: string;
  cancellation_PartialRefund_TimeGate: string | null;
  refundStatus?: number;
  numerOfTablesCancelledThisWeek?: number;
}

interface CancelConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  refundInfo: RefundInfo | null;
  isLoading: boolean;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  refundInfo,
  isLoading,
}) => {
  console.log("CancelConfirmationModal Props:", {
    show,
    onClose,
    onConfirm,
    refundInfo,
    isLoading,
  });

  if (!show || !refundInfo) {
    console.log("Modal not rendered due to:", { show, refundInfo });
    return null;
  }

  const formatCurrency = (amount: number) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "Số tiền không hợp lệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Ngày không hợp lệ";
    }
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
    );
  };

  const renderRefundMessage = () => {
    console.log("Refund Info:", refundInfo);
    if (
      refundInfo.refundAmount === 0 ||
      refundInfo.message.toLowerCase().includes("không được hoàn tiền") ||
      refundInfo.message.includes(
        "No refund. Reason: Cancellation on shared appointment will not be refund."
      )
    ) {
      const reason = refundInfo.message.includes("shared appointment")
        ? "Việc hủy lịch đã có sự thanh toán của đối phương sẽ không được hoàn tiền."
        : refundInfo.message.includes("nhiều hơn 5 bàn")
          ? `Bạn đã hủy ${
              typeof refundInfo.numerOfTablesCancelledThisWeek === "number"
                ? refundInfo.numerOfTablesCancelledThisWeek
                : "nhiều"
            } bàn trong tuần này, vượt quá giới hạn cho phép.`
          : refundInfo.message;

      return <p className="font-medium text-red-600">{reason}</p>;
    }

    return (
      <>
        <p className="font-medium text-black">
          Nếu hủy bàn này ở thời điểm hiện tại, bạn sẽ được hoàn tiền{" "}
          <strong>
            {refundInfo.message.includes("100%")
              ? "100%"
              : refundInfo.message.includes("50%")
                ? "50%"
                : refundInfo.message}
          </strong>
        </p>
        <p>
          <span className="font-medium text-black">
            **Số tiền nhận lại được**:
          </span>{" "}
          <strong className="text-black">
            {formatCurrency(refundInfo.refundAmount)}
          </strong>
        </p>
        <p>
          <span className="font-medium text-black">
            **Thời gian hủy của bạn là**:
          </span>{" "}
          <strong className="text-black">
            {formatDate(refundInfo.cancellationTime)}
          </strong>
        </p>
        {refundInfo.cancellation_PartialRefund_TimeGate && (
          <p>
            <span className="font-medium text-black">
              **Hạn hoàn tiền một phần**:
            </span>{" "}
            <strong className="text-black">
              {formatDate(refundInfo.cancellation_PartialRefund_TimeGate)}
            </strong>
          </p>
        )}
        <p>
          <span className="font-medium text-black">**Hạn chót hủy đơn**:</span>{" "}
          <strong className="text-black">
            {formatDate(refundInfo.cancellation_Block_TimeGate)}
          </strong>
        </p>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <h3 className="text-xl font-bold mb-4 text-black">
          Xác Nhận Hủy Bàn Đã Đặt
        </h3>

        <div className="space-y-3 mb-4">
          {renderRefundMessage()}
          <p>
            <span className="font-medium text-black">
              **Số bàn đã hủy trong tuần**:
            </span>{" "}
            <strong className="text-black">
              {typeof refundInfo.numerOfTablesCancelledThisWeek === "number"
                ? refundInfo.numerOfTablesCancelledThisWeek
                : "Không xác định"}
            </strong>
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className={`text-black px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 flex items-center justify-center min-w-[100px] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center min-w-[100px] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              "Xác nhận hủy"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
