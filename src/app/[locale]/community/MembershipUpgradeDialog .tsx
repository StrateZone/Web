"use client";
import { Button, Dialog, Card, Badge } from "@material-tailwind/react";
import { useState } from "react";
import {
  Check,
  X,
  ArrowUpCircle,
  Shield,
  Users,
  Gift,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

interface MembershipUpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  membershipPrice?: {
    price1: number;
    unit: string;
  };
  paymentProcessing: boolean;
}

export function MembershipUpgradeDialog({
  open,
  onClose, // Hàm này sẽ chuyển hướng về trang chủ
  onUpgrade,
  membershipPrice,
  paymentProcessing,
}: MembershipUpgradeDialogProps) {
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleUpgradeClick = () => {
    setOpenConfirmation(true);
  };

  const confirmUpgrade = () => {
    setOpenConfirmation(false);
    onUpgrade();
  };

  const cancelUpgrade = () => {
    setOpenConfirmation(false);
  };

  return (
    <>
      {/* Main Dialog - Luôn mở khi open=true, bất kể trạng thái của openConfirmation */}
      <Dialog
        open={open}
        handler={onClose}
        className="bg-transparent shadow-none"
      >
        <Card className="max-w-md mx-auto">
          <div className="p-6 text-center">
            <ArrowUpCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Nâng Cấp Tài Khoản Member
            </h3>
            <p className="text-gray-600 mb-8">
              Trải nghiệm đầy đủ các tính năng cộng đồng
            </p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Tài khoản Member</h4>
              </div>

              {membershipPrice && (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-green-600">
                    {membershipPrice.price1.toLocaleString()}₫
                    <span className="text-base font-normal text-gray-500 ml-1">
                      /{" "}
                      {membershipPrice.unit === "per month"
                        ? "tháng"
                        : membershipPrice.unit}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {[
                  {
                    icon: <MessageCircle className="w-5 h-5" />,
                    text: "Tạo và tham gia thảo luận",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    text: "Bình luận và tương tác",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    text: "Kết nối cộng đồng",
                  },
                  {
                    icon: <Gift className="w-5 h-5" />,
                    text: "Ưu đãi đặc biệt",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 hover:bg-green-50 rounded-lg transition"
                  >
                    <span className="bg-green-100 p-1 rounded-full text-green-600 mr-3">
                      {item.icon}
                    </span>
                    <p className="text-sm font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="text"
                onClick={onClose} // Gọi onClose trực tiếp
                className="flex-1 border border-gray-300 rounded-lg"
                fullWidth
              >
                Để sau
              </Button>
              <Button
                onClick={handleUpgradeClick}
                disabled={paymentProcessing}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg"
                fullWidth
              >
                {paymentProcessing ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </>
                ) : (
                  <>Nâng cấp ngay</>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </Dialog>

      {/* Confirmation Dialog - Hiển thị trên dialog chính */}
      <Dialog
        open={openConfirmation}
        handler={cancelUpgrade} // Sử dụng cancelUpgrade thay vì onClose
        size="xs"
      >
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Xác nhận nâng cấp
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn có chắc muốn nâng cấp tài khoản với giá{" "}
            <span className="font-bold text-green-600">
              {membershipPrice?.price1.toLocaleString()}₫/
              {membershipPrice?.unit.toLowerCase() === "per month"
                ? "tháng"
                : membershipPrice?.unit}
            </span>
            ?
          </p>
          <div className="flex gap-3">
            <Button
              variant="text"
              onClick={cancelUpgrade} // Chỉ đóng dialog xác nhận
              className="flex-1 border border-gray-300 rounded-lg"
              fullWidth
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={confirmUpgrade}
              className="flex-1 bg-green-500 text-white rounded-lg"
              fullWidth
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </Dialog>
    </>
  );
}
