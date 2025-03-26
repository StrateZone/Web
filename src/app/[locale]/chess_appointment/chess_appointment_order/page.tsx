"use client";
import { useState } from "react";
import { Button } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { UserPlus, X } from "lucide-react"; // Import icons
import CouponsPage from "../coupon_modal/page";

interface TableBooking {
  id: number;
  chessType: string;
  chessPrice: number;
  room: string;
  roomPrice: number;
  tableNumber: number;
  price: number;
  date: string;
  time: string;
}

const TableBookingPage = () => {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentTable, setCurrentTable] = useState<number | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const tables: TableBooking[] = [
    {
      id: 11,
      chessType: "Cờ vua",
      chessPrice: 10000,
      room: "Premium",
      roomPrice: 40000,
      tableNumber: 11,
      price: 25000,
      date: "17/3/2025",
      time: "16:00-17:00",
    },
    {
      id: 13,
      chessType: "Cờ tướng",
      chessPrice: 8000,
      room: "Basic",
      roomPrice: 20000,
      tableNumber: 13,
      price: 56000,
      date: "17/3/2025",
      time: "16:00-18:00",
    },
  ];

  const totalPrice = tables.reduce((sum, table) => sum + table.price, 0);
  const finalPrice = totalPrice - discount;

  const applyCoupon = () => {
    // Áp dụng giảm giá dựa trên coupon
  };

  const inviteFriend = (tableNumber: number) => {
    setCurrentTable(tableNumber);
    setShowInviteModal(true);
  };

  return (
    <div>
      <Navbar />
      {/* Background Banner */}
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            Cửa hàng cờ StrateZone
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            Nâng tầm chiến thuật – Trang bị như một kiện tướng!
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-black">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Chi tiết về đơn đặt bàn của bạn
        </h1>

        <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
          <div className="max-h-96 overflow-y-auto">
            {tables.map((table) => (
              <div
                key={table.id}
                className="border p-4 mb-4 rounded-lg flex flex-col space-y-2 relative"
              >
                <button
                  onClick={() => inviteFriend(table.tableNumber)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-700"
                  title="Mời bạn vào bàn này"
                >
                  <UserPlus size={20} />
                </button>
                <p>
                  <strong>Loại cờ:</strong> {table.chessType} (
                  {table.chessPrice.toLocaleString()}đ/giờ)
                </p>
                <p>
                  <strong>Phòng:</strong> {table.room} (
                  {table.roomPrice.toLocaleString()}đ/giờ)
                </p>
                <p>
                  <strong>Bàn:</strong> {table.tableNumber}
                </p>
                <p>
                  <strong>Ngày:</strong> {table.date}
                </p>
                <p>
                  <strong>Giờ:</strong> {table.time}
                </p>
                <p className="font-bold text-right">
                  Giá tiền: {table.price.toLocaleString()}đ
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-bold">
              Chi tiết giá tiền của các bàn mà bạn đã chọn:
            </h2>
            <ul className="list-disc pl-5">
              {tables.map((table) => (
                <li key={table.id}>
                  Bàn {table.tableNumber}: {table.price.toLocaleString()}đ
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xl font-bold mt-4">
            Tổng tiền thanh toán: {finalPrice.toLocaleString()}đ
          </p>

          {/* Coupon Input */}
          <div className="flex items-center gap-4 mt-4">
            <Input
              type="text"
              placeholder="Nhập coupon..."
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1"
              crossOrigin="anonymous"
            />
            <Button
              onClick={applyCoupon}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Áp dụng
            </Button>
            <Button
              onClick={() => setShowCouponModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mã giảm giá hiện có
            </Button>
          </div>

          <div className="flex justify-end mt-6">
            <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg">
              Xác nhận
            </Button>
          </div>
        </div>
      </div>

      {/* Modal hiển thị mã giảm giá */}
      {showCouponModal && (
        <CouponsPage
          onClose={() => setShowCouponModal(false)}
          setCoupon={setCoupon}
          setDiscount={setDiscount}
        />
      )}

      <Footer />
    </div>
  );
};

export default TableBookingPage;
