"use client";
import { useState } from "react";
import { Button } from "@material-tailwind/react";
import { X } from "lucide-react";

const suggestedPlayers = [
  { id: 1, name: "Nguyễn Văn A", level: "Mới chơi" },
  { id: 2, name: "Trần Thị B", level: "Mới chơi" },
  { id: 3, name: "Lê Văn C", level: "Mới chơi" },
  { id: 4, name: "Phạm Thị D", level: "Mới chơi" },
  { id: 5, name: "Hoàng Văn E", level: "Mới chơi" },
  { id: 6, name: "Đặng Thị F", level: "Mới chơi" },
];

<<<<<<< HEAD
interface InviteFriendModalProps {
  onClose: () => void;
  onInvite: (friendName: string) => void;
}

const InviteFriendModal = ({ onClose, onInvite }: InviteFriendModalProps) => {
=======
const InviteFriendModal = ({ onClose, onInvite }) => {
>>>>>>> dc47781 (add appoinment flow)
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-black">
      <div className="bg-white p-6 rounded-lg w-[600px] shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-red-500"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold text-center mb-4">Chọn bạn để mời</h3>
        <div className="grid grid-cols-3 gap-4">
          {suggestedPlayers.map((player) => (
            <div
              key={player.id}
              className="border rounded-lg p-4 flex flex-col items-center shadow-md"
            >
              <div className="w-16 h-16 bg-gray-300 rounded-full mb-2"></div>
              <p className="font-bold">Tên: {player.name}</p>
              <p className="text-sm text-gray-500">Trình độ: {player.level}</p>
              <Button
                className="mt-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
                onClick={() => onInvite(player.name)}
              >
                Mời
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TableBookingPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);

<<<<<<< HEAD
  const handleInvite = (friendName: string) => {
=======
  const handleInvite = (friendName) => {
>>>>>>> dc47781 (add appoinment flow)
    alert(`Bạn đã mời ${friendName} vào bàn!`);
    setShowInviteModal(false);
  };

  return (
    <div>
      <Button onClick={() => setShowInviteModal(true)} className="bg-blue-600">
        Mời bạn
      </Button>
      {showInviteModal && (
        <InviteFriendModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
};

export default TableBookingPage;
