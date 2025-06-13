import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;

      const userChatsRef = doc(db, `userChats/${user.uid}`);
      const userChatsSnap = await getDoc(userChatsRef);

      if (!userChatsSnap.exists()) return;

      const userChatsData = userChatsSnap.data();

      const chatEntries = await Promise.all(
        Object.keys(userChatsData).map(async (userId) => {
          const chatInfo = userChatsData[userId];
          const { chatId, itemId } = chatInfo;

          // Fetch item data
          const itemSnap = await getDoc(doc(db, "items", itemId));
          const itemData = itemSnap.exists() ? itemSnap.data() : {};

          // Fetch seller name
          let sellerName = "Ukendt sælger";
          if (itemData.userId) {
            const sellerSnap = await getDoc(doc(db, "users", itemData.userId));
            if (sellerSnap.exists()) {
              sellerName = sellerSnap.data().name || sellerName;
            }
          }

          // Fetch messages to get last message
          const messagesRef = collection(db, `chats/${chatId}/messages`);
          const messagesSnap = await getDocs(messagesRef);
          const messages = messagesSnap.docs.map(doc => doc.data());

          const lastMsg = messages[messages.length - 1];

          return {
            id: chatId,
            itemId,
            itemName: itemData.name || "Unknown Item",
            itemImage: itemData.imageUrl,
            sellerName,
            lastMessage: lastMsg?.text || "No messages yet",
            lastMessageTime: lastMsg?.timestamp || null,
          };
        })
      );

      setChats(chatEntries);
    };

    fetchChats();
  }, [user]);

  if (!user) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Please log in to view your chats.</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Dine Beskeder</h1>
      <div className="space-y-4">
        {chats.length === 0 ? (
          <p className="text-center text-gray-600">No chats yet.</p>
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
                  <p className="text-sm text-gray-600 truncate">With: {chat.sellerName}</p>
                  <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                  {chat.lastMessageTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(chat.lastMessageTime.seconds * 1000), {
                        addSuffix: true,
                      })}
                    </p>
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
