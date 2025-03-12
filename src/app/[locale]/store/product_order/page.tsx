"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@material-tailwind/react";
import { useState } from "react";

export default function OrderPage() {
  const [orderForm, setOrderForm] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    address: "",
    note: "",
    shipping_method: "express",
    payment_method: "cod",
  });

  const [cartItems, setCartItems] = useState([
    {
      product: {
        name: "Sản phẩm A",
        price: 100000,
        thumbnail:
          "https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg",
      },
      quantity: 1,
    },
  ]);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const handleInputChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  return (
    <div className="text-black">
      <Navbar />
      <div className="relative font-sans ">
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
      <div className="container mx-auto p-4">
        <div className="text-center text-black p-6">
          <h1 className="text-3xl font-bold">STRATE ZONE</h1>
          <p className="text-lg">
            Nâng tầm chiến thuật – Trang bị như một kiện tướng!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thông tin người nhận */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4">
              Thông tin người nhận
            </h2>

            {["Tên người nhận", "Email", "Số điện thoại", "Địa chỉ"].map(
              (field, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium">{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={orderForm[field]}
                    onChange={handleInputChange}
                    placeholder={field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-black"
                  />
                </div>
              ),
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium">Ghi Chú</label>
              <input
                type="text"
                name="note"
                value={orderForm.note}
                onChange={handleInputChange}
                placeholder="Ghi chú"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                Phương thức vận chuyển
              </label>
              <select
                name="shipping_method"
                value={orderForm.shipping_method}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="express">Nhanh (Express)</option>
                <option value="normal">Thường (Normal)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                Phương thức thanh toán
              </label>
              <select
                name="payment_method"
                value={orderForm.payment_method}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="other">Thanh toán khác</option>
              </select>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4">
              Thông tin sản phẩm đã đặt hàng
            </h2>
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 text-left">Sản Phẩm</th>
                  <th className="py-2 px-4">Số Lượng</th>
                  <th className="py-2 px-4">Đơn Giá (₫)</th>
                  <th className="py-2 px-4">Tổng Giá (₫)</th>
                  <th className="py-2 px-4">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="py-2 px-4 flex items-center">
                      <img
                        src={item.product.thumbnail}
                        alt="Product"
                        className="w-16 h-16 rounded-lg mr-2"
                      />
                      <span className="text-black">{item.product.name}</span>
                    </td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">
                      {item.product.price.toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      {(item.product.price * item.quantity).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm"
                        onClick={() => removeFromCart(index)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="text-right font-bold py-2 px-4">
                    Tổng giá:
                  </td>
                  <td className="py-2 px-4">
                    {totalAmount.toLocaleString()} ₫
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Nhập coupon */}
            <h4 className="text-lg font-bold text-black mt-6">Nhập coupon</h4>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Nhập coupon"
              />
              <Button className="flex items-center gap-3">Áp Dụng</Button>
            </div>

            {/* Đặt hàng */}
            <div className="mt-6">
              <Button className="0 text-white rounded-lg w-full" color="green">
                Thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
