import React, { useState, useEffect } from "react";
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
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [maxMinutesForTableExtend, setMaxMinutesForTableExtend] = useState<
    number | null
  >(null);
  const [minMinutesForTableExtend, setMinMinutesForTableExtend] = useState<
    number | null
  >(null);
  const [
    extendAllow_BeforeMinutes_FromTableComplete,
    setExtendAllow_BeforeMinutes_FromTableComplete,
  ] = useState<number | null>(null);
  const [
    extendCancel_BeforeMinutes_FromPlayTime,
    setExtendCancel_BeforeMinutes_FromPlayTime,
  ] = useState<number | null>(null);
  const [
    percentage_Refund_On_ExtendedTables,
    setPercentage_Refund_On_ExtendedTables,
  ] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        setIsSettingsLoading(true);
        const systemResponse = await fetch(`${API_BASE_URL}/api/system/1`, {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        });
        if (!systemResponse.ok) {
          throw new Error("Không thể tải cài đặt hệ thống");
        }
        const systemData = await systemResponse.json();
        setMaxMinutesForTableExtend(systemData.maxMinutesForTableExtend || 60);
        setMinMinutesForTableExtend(systemData.minMinutesForTableExtend || 5);
        setExtendAllow_BeforeMinutes_FromTableComplete(
          systemData.extendAllow_BeforeMinutes_FromTableComplete || 90
        );
        setExtendCancel_BeforeMinutes_FromPlayTime(
          systemData.extendCancel_BeforeMinutes_FromPlayTime || 0
        );
        setPercentage_Refund_On_ExtendedTables(
          systemData.percentage_Refund_On_ExtendedTables || 50
        );
      } catch (error) {
        console.error("Error fetching system settings:", error);
        setMaxMinutesForTableExtend(60);
        setMinMinutesForTableExtend(5);
        setExtendAllow_BeforeMinutes_FromTableComplete(90);
        setExtendCancel_BeforeMinutes_FromPlayTime(0);
        setPercentage_Refund_On_ExtendedTables(50);
        toast.error(
          <span className="font-bold">Không thể tải cài đặt hệ thống</span>,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } finally {
        setIsSettingsLoading(false);
      }
    };

    if (open) {
      fetchSystemSettings();
    }
  }, [open]);

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
                if (
                  isNaN(minutes) ||
                  minutes < (minMinutesForTableExtend || 5)
                ) {
                  toast.error(
                    <span className="font-bold">
                      Vui lòng nhập số phút hợp lệ (tối thiểu{" "}
                      {minMinutesForTableExtend || 5} phút)
                    </span>,
                    {
                      position: "top-right",
                      autoClose: 3000,
                    }
                  );
                  return;
                }
                if (minutes > (maxMinutesForTableExtend || 60)) {
                  toast.error(
                    <span className="font-bold">
                      Số phút gia hạn không được vượt quá{" "}
                      {maxMinutesForTableExtend || 60} phút
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
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white "
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
                </>
              ) : (
                "Xác nhận"
              )}
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
            min={minMinutesForTableExtend || 5}
            max={maxMinutesForTableExtend || 60}
            step="5"
            className="w-full"
            crossOrigin={undefined}
          />
        </div>
        <div className="text-left text-gray-700">
          <h3 className="font-semibold text-gray-800 mb-2">
            Quy định gia hạn bàn
          </h3>
          {isSettingsLoading ? (
            <p className="text-sm">Đang tải quy định...</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                Thời gian gia hạn tối đa cho mỗi bàn là{" "}
                <strong>{maxMinutesForTableExtend ?? "Lỗi hiển thị"}</strong>{" "}
                phút.
              </li>
              <li>
                Thời gian gia hạn tối thiểu cho mỗi bàn là{" "}
                <strong>{minMinutesForTableExtend ?? "Lỗi hiển thị"}</strong>{" "}
                phút.
              </li>
              <li>
                Gia hạn bàn chỉ được phép thực hiện trước khi bàn hiện tại kết
                thúc ít nhất{" "}
                <strong>
                  {extendAllow_BeforeMinutes_FromTableComplete ??
                    "Lỗi hiển thị"}
                </strong>{" "}
                phút.
              </li>
              <li>
                Sau khi gia hạn, bàn gia hạn có thể bị hủy trước giờ chơi của
                bàn gia hạn ít nhất{" "}
                <strong>
                  {extendCancel_BeforeMinutes_FromPlayTime ?? "Lỗi hiển thị"}
                </strong>{" "}
                phút. Nếu hủy bàn gia hạn, người dùng sẽ được hoàn tiền{" "}
                <strong>
                  {percentage_Refund_On_ExtendedTables !== null
                    ? percentage_Refund_On_ExtendedTables * 100
                    : "Lỗi hiển thị"}
                </strong>
                %.
              </li>
              <li>
                Gia hạn bàn yêu cầu xác nhận thanh toán trước khi hoàn tất.
              </li>
            </ul>
          )}
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
          <div className="text-left space-y-2">
            <p>
              <span className="font-medium">Mã bàn:</span>{" "}
              <strong>{extensionDetails.table.tableId}</strong>
            </p>
            <p>
              <span className="font-medium">Tên phòng:</span>{" "}
              <strong>{extensionDetails.table.roomName}</strong>
            </p>
            <p>
              <span className="font-medium">Loại cờ:</span>{" "}
              <strong>{extensionDetails.table.gameType.typeName}</strong>
            </p>
            <p>
              <span className="font-medium">Thời gian bắt đầu:</span>{" "}
              <strong>{formatTime(extensionDetails.scheduleTime)}</strong>
            </p>
            <p>
              <span className="font-medium">Thời gian kết thúc:</span>{" "}
              <strong>{formatTime(extensionDetails.endTime)}</strong>
            </p>
            <p>
              <span className="font-medium">Thời lượng:</span>{" "}
              <strong>
                {(extensionDetails.durationInHours * 60).toFixed(0)} phút
              </strong>
            </p>
            <p>
              <span className="font-medium">Tổng giá:</span>{" "}
              <strong>
                {formatCurrency(extensionDetails.table.totalPrice)}
              </strong>
            </p>
            <p>
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
          <div className="text-left space-y-2">
            <p>
              Bạn sẽ thanh toán{" "}
              <span className="font-medium">
                <strong>
                  {formatCurrency(extensionDetails.table.totalPrice)}
                </strong>
              </span>{" "}
              để gia hạn thời gian chơi.
            </p>
            <p>Vui lòng xác nhận để tiến hành thanh toán.</p>
          </div>
        )}
      </CustomModal>
    </>
  );
};

export default ExtendAppointmentDialog;
