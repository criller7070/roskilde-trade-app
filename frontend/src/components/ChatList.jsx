import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!auth.currentUser) return;

      // Fetch user-specific chat info from userChats collection
      const userChatsRef = doc(db, `userChats/${auth.currentUser.uid}`);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const userChatsData = userChatsSnap.data();
        const chatPromises = Object.keys(userChatsData).map(async (userId) => {
          const chatInfo = userChatsData[userId];
          const messagesRef = collection(db, `chats/${chatInfo.chatId}/messages`);
          const messagesSnap = await getDocs(messagesRef);

          let messages = [];
          messagesSnap.forEach(doc => {
            messages.push(doc.data());
          });

          return {
            chatId: chatInfo.chatId,
            recipientName: chatInfo.recipientName,
            messages: messages,
            itemId: chatInfo.itemId,
          };
        });

        const chats = await Promise.all(chatPromises);
        setChats(chats);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Your Chats</h2>
      <ul>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li key={chat.chatId} className="mb-2 flex justify-between items-center border-b p-2">
              <span className="font-semibold">{chat.recipientName}</span>
              <Link
                to={`/chat/${chat.chatId}`} // Link to chat page
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Open Chat
              </Link>
            </li>
          ))
        ) : (
          <p>No conversations yet.</p>
        )}
      </ul>
    </div>
  );
};

export default ChatList;
