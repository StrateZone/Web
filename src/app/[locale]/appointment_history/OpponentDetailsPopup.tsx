// components/OpponentDetailsPopup.tsx
"use client";

import { useLocale } from "next-intl";

interface User {
  userId: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string;
  skillLevel: string;
  ranking: string;
}

interface AppointmentRequest {
  id: number;
  toUser: number;
  status: string;
  toUserNavigation: User;
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface OpponentDetailsPopupProps {
  show: boolean;
  onClose: () => void;
  requests: AppointmentRequest[];
}

export default function OpponentDetailsPopup({
  show,
  onClose,
  requests,
}: OpponentDetailsPopupProps) {
  const locale = useLocale();

  if (!show) return null;

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Thông tin đối thủ đã mời</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {requests.length === 0 ? (
            <p className="text-gray-500 py-4">Không có thông tin đối thủ</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <img
                      src={
                        request.toUserNavigation.avatarUrl ||
                        "/default-avatar.png"
                      }
                      alt={request.toUserNavigation.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-lg">
                        {request.toUserNavigation.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{request.toUserNavigation.username}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Trạng thái:</p>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status === "pending"
                          ? "Đang chờ"
                          : request.status === "accepted"
                            ? "Đã chấp nhận"
                            : "Đã từ chối"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Trình độ:</p>
                      <p>{request.toUserNavigation.skillLevel}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Thời gian:</p>
                      <p>
                        {formatTime(request.startTime)} -{" "}
                        {formatTime(request.endTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày:</p>
                      <p>{formatDate(request.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày mời:</p>
                      <p>{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
