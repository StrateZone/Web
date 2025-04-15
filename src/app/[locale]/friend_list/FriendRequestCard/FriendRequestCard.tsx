const FriendRequestCard = ({ request, onAccept, onReject }) => {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img
          src={request.sender.avatarUrl || "/default-avatar.jpg"}
          alt={request.sender.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-medium">{request.sender.username}</h4>
          <p className="text-sm text-gray-500">Đã gửi yêu cầu kết bạn</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Chấp nhận
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Từ chối
        </button>
      </div>
    </div>
  );
};
