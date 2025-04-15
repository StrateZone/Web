const FriendCard = ({ user, isFriend, onAddFriend, onRemoveFriend }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl || "/default-avatar.jpg"}
          alt={user.username}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold">{user.username}</h4>
          <p className="text-sm text-gray-500">Trình độ: {user.skillLevel}</p>
        </div>
      </div>
      <div className="mt-4">
        {isFriend ? (
          <button
            onClick={onRemoveFriend}
            className="w-full py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
          >
            Hủy kết bạn
          </button>
        ) : (
          <button
            onClick={onAddFriend}
            className="w-full py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
          >
            Kết bạn
          </button>
        )}
      </div>
    </div>
  );
};
