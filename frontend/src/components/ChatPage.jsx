import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    console.log("Chat ID from URL:", chatId);

    if (!chatId) return;
  
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => doc.data());
      setMessages(loadedMessages);
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(), // 🔥 Use serverTimestamp
    });
    

    setNewMessage("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Chat with {chatId}</h2>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <p><strong>{message.senderId}</strong>: {message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="border p-2"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPage;
