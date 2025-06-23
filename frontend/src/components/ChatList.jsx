import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";

const ChatList = () => {
  const { user } = useAuth();
  const { chats, loading } = useChat();

  console.log('ChatList render:', { user: user?.uid, chats: chats.length, loading });

  if (!user) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Please log in to view your chats.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Loading chats...</p>
        <p className="text-xs text-gray-400 mt-2">User: {user.uid}</p>
        <p className="text-xs text-gray-400">Chats found: {chats.length}</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Dine Beskeder</h1>
      <div className="space-y-4">
        {chats.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No chats yet.</p>
            <p className="text-xs text-gray-400 mt-2">Try messaging someone from an item listing!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <Link
              key={chat.id}
              to={`/chat/${chat.id}`}
              className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                {chat.itemImage && (
                  <img
                    src={chat.itemImage}
                    alt={chat.itemName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{chat.itemName}</h3>
                  <p className="text-sm text-gray-600 truncate">With: {chat.otherUserName}</p>
                  <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage || "No messages yet"}</p>
                  {chat.lastMessageTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(chat.lastMessageTime.seconds * 1000), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                  {chat.unreadCount > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full">
                        {chat.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
