import { X } from "lucide-react";

interface User {
  userId: number;
  username: string;
  avatarUrl: string | null;
  ranking: string;
  points: number;
}

interface FriendListModalProps {
  friends: User[];
  onClose: () => void;
  onInvite: (friendId: number) => void;
  isLoading: boolean;
}

export const FriendListModal = ({
  friends,
  onClose,
  onInvite,
  isLoading,
}: FriendListModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Mời bạn vào bàn</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-center py-4">Không có bạn bè nào</p>
            ) : (
              <ul className="space-y-2">
                {friends.map((friend) => (
                  <li
                    key={friend.userId}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                        {friend.avatarUrl ? (
                          <img
                            src={friend.avatarUrl}
                            alt={friend.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{friend.username}</p>
                        <p className="text-sm text-gray-500">
                          {friend.ranking} • {friend.points} điểm
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onInvite(friend.userId)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Mời
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
