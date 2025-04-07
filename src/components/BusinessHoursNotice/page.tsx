// components/BusinessHoursNotice.tsx
import React from "react";

interface BusinessHoursNoticeProps {
  openHour: number;
  closeHour: number;
  minDuration?: number;
  date?: Date; // Thêm prop ngày
  openTimeString?: string; // Chuỗi giờ mở cửa (vd: "10:00")
  closeTimeString?: string; // Chuỗi giờ đóng cửa (vd: "20:00")
}

const BusinessHoursNotice: React.FC<BusinessHoursNoticeProps> = ({
  openHour = 8,
  closeHour = 21,
  minDuration = 1,
  date,
  openTimeString = "08:00",
  closeTimeString = "22:00",
}) => {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="text-center mb-4 text-lg text-gray-600">
      <div>
        <h2 className="text-xl text-black font-bold">
          Các lưu ý quan trọng khi đặt bàn
        </h2>
      </div>

      {date && (
        <p className="text-base font-bold text-blue-600">
          ⏰ Ngày {formattedDate}: Mở cửa từ {openTimeString} - Đóng cửa lúc{" "}
          {closeTimeString}
        </p>
      )}
      {/* 
      <p className="text-base">
        Hệ thống chỉ nhận đặt bàn từ{" "}
        <span className="font-bold">{openHour}:00</span> đến{" "}
        <span className="font-bold">{closeHour}:00</span>
      </p> */}
      <p className="text-base">
        ✅ Hệ thống sẽ hiển thị những bàn có sẵn trong khoảng thời gian bạn chọn
      </p>
      <p className="text-base">
        ⏳ Nếu giờ đặt bàn đã qua, vui lòng chọn giờ gần nhất hoặc chọn ngày
        tiếp theo
      </p>
    </div>
  );
};

export default BusinessHoursNotice;
