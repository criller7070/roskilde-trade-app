
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const ChatList = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!auth.currentUser) return;

      const userChatsRef = doc(db, `userChats/${auth.currentUser.uid}`);
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
            chatId,
            itemTitle: itemData.name || "Ukendt vare",
            itemImage: itemData.imageUrl || "/placeholder.jpg",
            sellerName,
            lastMessage: lastMsg?.text || "Ingen beskeder endnu",
            lastTimestamp: lastMsg?.timestamp?.seconds || null,
          };
        })
      );

      setChats(chatEntries);
    };

    fetchChats();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-6 px-4 pb-10">
      <h2 className="text-2xl font-bold text-orange-500 mb-4">Beskeder</h2>
      {chats.length > 0 ? (
        <ul className="space-y-4">
          {chats.map((chat) => (
            <Link
              key={chat.chatId}
              to={`/chat/${chat.chatId}`}
              className="flex items-center gap-4 p-3 bg-white rounded-xl shadow hover:bg-orange-50 transition"
            >
              <img
                src={chat.itemImage}
                alt={chat.itemTitle}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{chat.itemTitle}</h3>
                <p className="text-sm text-gray-600">{chat.sellerName}</p>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {chat.lastTimestamp
                  ? formatDistanceToNow(new Date(chat.lastTimestamp * 1000), { addSuffix: true })
                  : ""}
              </div>
            </Link>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center">Ingen samtaler endnu.</p>
      )}
    </div>
  );
};

export default ChatList;
