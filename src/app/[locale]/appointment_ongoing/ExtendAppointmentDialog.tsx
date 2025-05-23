import React, { useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchWallet } from "@/app/[locale]/wallet/walletSlice";
import { AppDispatch } from "@/app/store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useRouter } from "next/navigation";

const MySwal = withReactContent(Swal);

// Interfaces remain unchanged
interface Table {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomDescription: string;
  gameTypeId: number;
  gameType: {
    typeId: number;
    typeName: string;
    status: string;
  };
  startDate: string;
  endDate: string;
  gameTypePrice: number;
  roomTypePrice: number;
  durationInHours: number;
  totalPrice: number;
}

interface ExtensionDetails {
  oldId: number;
  scheduleTime: string;
  endTime: string;
  durationInHours: number;
  note: string;
  table: Table;
}

interface ExtensionRequest {
  userId: number;
  oldTablesAppointmentId: number;
  tableId: number;
  appointmentId: number;
  startTime: string;
  endTime: string;
  price: number;
}

interface ExtendAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  tableAppointmentId: number;
  userId: number;
  appointmentId: number;
  localActive: string;
  onExtensionSuccess: () => Promise<void>;
}

interface InsufficientBalanceProps {
  finalPrice?: number;
}

const API_BASE_URL = "https://backend-production-ac5e.up.railway.app";

const InsufficientBalancePopup = async ({
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

// Custom Modal Component
const CustomModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="flex justify-end space-x-2">{footer}</div>}
      </div>
    </div>
  );
};

const ExtendAppointmentDialog: React.FC<ExtendAppointmentDialogProps> = ({
  open,
  onClose,
  tableAppointmentId,
  userId,
  appointmentId,
  localActive,
  onExtensionSuccess,
}) => {
  const [extendMinutes, setExtendMinutes] = useState<number | string>("");
  const [extensionDetails, setExtensionDetails] =
    useState<ExtensionDetails | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showPaymentConfirmPopup, setShowPaymentConfirmPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const fetchExtensionDetails = async (minutes: number) => {
    try {
      setIsLoading(true);
      const apiUrl = new URL(
        `${API_BASE_URL}/api/tables-appointment/extend-check/${tableAppointmentId}`
      );
      apiUrl.searchParams.append("durationInMinutes", minutes.toString());

      const response = await fetch(apiUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.status === 401) {
        toast.error(
          <span className="font-bold">
            Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
          </span>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return;
      }

      if (!response.ok) {
        let errorMessage = "Không thể tải thông tin gia hạn";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data: ExtensionDetails = await response.json();
      setExtensionDetails(data);
      setShowConfirmPopup(true);
    } catch (err) {
      toast.error(
        <span className="font-bold">
          {err instanceof Error ? err.message : "Lỗi khi tải thông tin gia hạn"}
        </span>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmExtendAppointment = async () => {
    if (!extensionDetails) {
      toast.error(
        <span className="font-bold">Thiếu thông tin để gia hạn</span>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    try {
      setIsLoading(true);
      const requestBody: ExtensionRequest = {
        userId,
        oldTablesAppointmentId: tableAppointmentId,
        tableId: extensionDetails.table.tableId,
        appointmentId,
        startTime: extensionDetails.scheduleTime,
        endTime: extensionDetails.endTime,
        price: extensionDetails.table.totalPrice,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/payments/extend-tables-appointment-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();

      if (response.status === 401) {
        toast.error(
          <span className="font-bold">
            Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
          </span>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        setTimeout(() => {
          window.location.href = `/${localActive}/login`;
        }, 2000);

        return;
      }

      if (
        !responseData.success &&
        responseData.message === "Balance is not enough"
      ) {
        const isConfirmed = await InsufficientBalancePopup({
          finalPrice: extensionDetails.table.totalPrice,
        });
        if (isConfirmed) {
          router.push(`/${localActive}/wallet`);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Gia hạn không thành công");
      }

      toast.success(<span className="font-bold">Gia hạn thành công!</span>, {
        position: "top-right",
        autoClose: 3000,
      });

      dispatch(fetchWallet(userId));
      await onExtensionSuccess();
      setShowPaymentConfirmPopup(false);
      setShowConfirmPopup(false);
      setExtensionDetails(null);
      setExtendMinutes("");
      onClose();
    } catch (err) {
      toast.error(
        <span className="font-bold">
          {err instanceof Error
            ? err.message
            : "Lỗi không xác định khi gia hạn"}
        </span>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirm = () => {
    setShowConfirmPopup(false);
    setShowPaymentConfirmPopup(true);
  };

  return (
    <>
      <CustomModal
        open={open && !showConfirmPopup && !showPaymentConfirmPopup}
        onClose={() => {
          setExtendMinutes("");
          onClose();
        }}
        title="Nhập thời gian gia hạn"
        footer={
          <>
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setExtendMinutes("");
                onClose();
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button
              variant="filled"
              color="blue"
              onClick={() => {
                const minutes = parseInt(extendMinutes as string);
                if (isNaN(minutes) || minutes < 5) {
                  toast.error(
                    <span className="font-bold">
                      Vui lòng nhập số phút hợp lệ (tối thiểu 5 phút)
                    </span>,
                    {
                      position: "top-right",
                      autoClose: 3000,
                    }
                  );
                  return;
                }
                fetchExtensionDetails(minutes);
              }}
              disabled={isLoading}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <div className="mb-4">
          <Input
            type="number"
            label="Số phút gia hạn"
            value={extendMinutes}
            onChange={(e) => setExtendMinutes(e.target.value)}
            min="5"
            step="5"
            className="w-full"
            crossOrigin={undefined}
          />
        </div>
      </CustomModal>

      <CustomModal
        open={showConfirmPopup}
        onClose={() => {
          setShowConfirmPopup(false);
          setExtensionDetails(null);
        }}
        title="Xác nhận gia hạn"
        footer={
          <>
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setShowConfirmPopup(false);
                setExtensionDetails(null);
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button
              variant="filled"
              color="blue"
              onClick={handlePaymentConfirm}
              disabled={isLoading}
            >
              Xác nhận gia hạn
            </Button>
          </>
        }
      >
        {extensionDetails && (
          <div>
            <p className="mb-2">
              <span className="font-medium">Mã bàn:</span>{" "}
              <strong>{extensionDetails.table.tableId}</strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Tên phòng:</span>{" "}
              <strong>{extensionDetails.table.roomName}</strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Loại cờ:</span>{" "}
              <strong>{extensionDetails.table.gameType.typeName}</strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Thời gian bắt đầu:</span>{" "}
              <strong>{formatTime(extensionDetails.scheduleTime)}</strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Thời gian kết thúc:</span>{" "}
              <strong>{formatTime(extensionDetails.endTime)}</strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Thời lượng:</span>{" "}
              <strong>
                {(extensionDetails.durationInHours * 60).toFixed(0)} phút
              </strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Tổng giá:</span>{" "}
              <strong>
                {formatCurrency(extensionDetails.table.totalPrice)}
              </strong>
            </p>
            <p className="mb-2">
              <span className="font-medium">Ghi chú:</span>{" "}
              <strong>{extensionDetails.note}</strong>
            </p>
          </div>
        )}
      </CustomModal>

      <CustomModal
        open={showPaymentConfirmPopup}
        onClose={() => {
          setShowPaymentConfirmPopup(false);
        }}
        title="Xác nhận thanh toán"
        footer={
          <>
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setShowPaymentConfirmPopup(false);
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button
              variant="filled"
              color="blue"
              onClick={confirmExtendAppointment}
              disabled={isLoading}
            >
              Xác nhận thanh toán
            </Button>
          </>
        }
      >
        {extensionDetails && (
          <div>
            <p className="mb-2">
              Bạn sẽ thanh toán{" "}
              <span className="font-medium">
                <strong>
                  {formatCurrency(extensionDetails.table.totalPrice)}
                </strong>
              </span>{" "}
              để gia hạn thời gian chơi.
            </p>
            <p className="mb-2">Vui lòng xác nhận để tiến hành thanh toán.</p>
          </div>
        )}
      </CustomModal>
    </>
  );
};

export default ExtendAppointmentDialog;
