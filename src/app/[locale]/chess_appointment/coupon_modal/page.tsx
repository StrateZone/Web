"use client";
import { X } from "lucide-react";

const discountCoupons = [
  {
    code: "Giảm 30k",
    discount: 30000,
    minPayment: 100000,
    expiryDate: "29/06/2025",
  },
  {
    code: "Giảm 50k",
    discount: 50000,
    minPayment: 200000,
    expiryDate: "15/07/2025",
  },
];

interface CouponsPageProps {
  onClose: () => void;
  setCoupon: (code: string) => void;
  setDiscount: (discount: number) => void;
}

const CouponsPage: React.FC<CouponsPageProps> = ({
  onClose,
  setCoupon,
  setDiscount,
}) => {
  const selectCoupon = (code: string, discount: number) => {
    setCoupon(code);
    setDiscount(discount);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black"
      onClick={onClose} // Bấm bên ngoài để đóng modal
    >
      <div
        className="bg-white p-6 rounded-lg w-96 relative"
        onClick={(e) => e.stopPropagation()} // Chặn sự kiện khi bấm vào modal
      >
        <button onClick={onClose} className="absolute top-2 right-2">
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">Mã giảm giá hiện có</h3>
        <ul className="space-y-4">
          {discountCoupons.map((c, i) => (
            <li
              key={i}
              className="p-4 bg-gray-200 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-bold">{c.code}</p>
                <p className="text-sm text-gray-700">
                  Thanh toán ít nhất {c.minPayment.toLocaleString()}đ
                </p>
                <p className="text-sm text-gray-700">
                  Ngày hết hạn: {c.expiryDate}
                </p>
              </div>
              <button
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                onClick={() => selectCoupon(c.code, c.discount)}
              >
                Áp dụng
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CouponsPage;
