import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [chatMeta, setChatMeta] = useState({ recipientName: "", itemName: "", itemImage: "" });

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => doc.data());
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const fetchChatMeta = async () => {
      if (!user || !chatId) return;

      const userChatsRef = doc(db, `userChats/${user.uid}`);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const chatData = userChatsSnap.data();
        const match = Object.values(chatData).find((entry) => entry.chatId === chatId);
        
        if (match) {
          const { recipientName, itemId } = match;

          // Fetch item info
          let itemName = "";
          let itemImage = "";
          const itemSnap = await getDoc(doc(db, "items", itemId));
          if (itemSnap.exists()) {
            const data = itemSnap.data();
            itemName = data.name;
            itemImage = data.imageUrl;
          }

          setChatMeta({ recipientName, itemName, itemImage });
        }
      }
    };

    fetchChatMeta();
  }, [chatId, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: user.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="pt-20 px-4 pb-24 min-h-screen bg-orange-100 max-w-md mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-orange-500">Chat med {chatMeta.recipientName}</h2>
        <p className="text-sm text-gray-600">Om: <strong>{chatMeta.itemName}</strong></p>
        {chatMeta.itemImage && (
          <img src={chatMeta.itemImage} alt={chatMeta.itemName} className="mx-auto mt-2 h-20 rounded-lg object-cover" />
        )}
      </div>

      <div className="space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                msg.senderId === user.uid
                  ? "bg-orange-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>
              <span className="block mt-1 text-[10px] text-right text-gray-300">
                {msg.timestamp?.seconds &&
                  formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), {
                    addSuffix: true,
                  })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white px-4 py-3 border-t flex items-center"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv en besked..."
          className="flex-1 p-2 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="ml-3 bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
