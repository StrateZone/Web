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
    <div className="text-center mb-4 text-sm text-gray-600">
      <p>
        ⏰ Hệ thống chỉ nhận đặt bàn từ{" "}
        <span className="font-bold">{openHour}:00</span> đến{" "}
        <span className="font-bold">{closeHour}:00</span>
      </p>
      <p>
<<<<<<< HEAD
        Nếu giờ đặt bàn đã qua vui lòng chọn giờ gần nhất. Hoặc chọn ngày tiếp
=======
        Nếu giờ đặt bàn đã qua vui lòng chọn giờ khác. Hoặc chọn ngày tiếp
>>>>>>> dc47781 (add appoinment flow)
        theo{" "}
      </p>
    </div>
  );
};

export default BusinessHoursNotice;
