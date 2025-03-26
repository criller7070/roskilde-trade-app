import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

const Chat = ({ recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!recipientId) return;

    const chatId = [auth.currentUser.uid, recipientId].sort().join("_");
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [recipientId]);

  useEffect(() => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chatId = [auth.currentUser.uid, recipientId].sort().join("_");

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Chat with {recipientName}</h2>
      <div id="chatContainer" className="h-72 overflow-y-auto border p-4 rounded-lg bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 p-3 rounded-lg ${
              msg.senderId === auth.currentUser.uid ? "bg-blue-500 text-white text-right" : "bg-gray-300"
            }`}
          >
            <div>{msg.text}</div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-4 flex">
        <input
          type="text"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="ml-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
