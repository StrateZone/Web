import React from "react";

interface RefundInfo {
  message: string;
  refundAmount: number;
  cancellationTime: string;
  cancellation_Block_TimeGate: string;
  cancellation_PartialRefund_TimeGate: string;
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
  if (!show || !refundInfo) return null;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
    );
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <h3 className="text-xl font-bold mb-4">Xác Nhận Hủy Bàn Đã Đặt</h3>

        <div className="space-y-3 mb-4">
          <p className="font-medium">
            {refundInfo.message.includes("100%") ? (
              <>
                Nếu hủy bàn này ở thời điểm hiện tại, bạn sẽ được hoàn tiền{" "}
                <strong>100%</strong>
              </>
            ) : refundInfo.message.includes("50%") ? (
              <>
                Nếu hủy bàn này ở thời điểm hiện tại, bạn sẽ được hoàn tiền{" "}
                <strong>50%</strong>
              </>
            ) : (
              <>
                Nếu hủy bàn này ở thời điểm hiện tại, bạn sẽ được hoàn tiền{" "}
                <strong>{refundInfo.message}</strong>
              </>
            )}
          </p>
          <p>
            <span className="font-medium">**Số tiền nhận lại được**:</span>{" "}
            <strong>{formatCurrency(refundInfo.refundAmount)}</strong>
          </p>
          <p>
            <span className="font-medium">**Thời gian hủy của bạn là**:</span>{" "}
            <strong>{formatDate(refundInfo.cancellationTime)}</strong>
          </p>
          <p>
            <span className="font-medium">**Hạn chót hủy đơn**:</span>{" "}
            <strong>
              {formatDate(refundInfo.cancellation_Block_TimeGate)}
            </strong>
          </p>
          <p>
            <span className="font-medium">**Hạn hoàn tiền một phần**:</span>{" "}
            <strong>
              {formatDate(refundInfo.cancellation_PartialRefund_TimeGate)}
            </strong>
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
