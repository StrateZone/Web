// components/BusinessHoursNotice.tsx
import React from "react";

interface BusinessHoursNoticeProps {
  openHour: number;
  closeHour: number;
  minDuration?: number;
}

const BusinessHoursNotice: React.FC<BusinessHoursNoticeProps> = ({
  openHour = 8,
  closeHour = 21,
  minDuration = 1,
}) => {
  return (
    <div className="text-center mb-4 text-lg text-gray-600">
      <div>
        <h2 className="text-xl text-black font-bold">
          Các lưu ý quan trọng khi đặt bàn
        </h2>
      </div>
      <p className="text-base">
        ⏰ Hệ thống chỉ nhận đặt bàn từ{" "}
        <span className="font-bold">{openHour}:00</span> đến{" "}
        <span className="font-bold">{closeHour}:00</span>
      </p>
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
