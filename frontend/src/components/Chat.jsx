import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query
, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns'; // Optional: for human-readable timestamps

const Chat = ({ recipientId, recipientName, itemId }) => { // <-- Add itemId as a prop
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!recipientId) return;

    const chatId = [auth.currentUser.uid, recipientId].sort().join("_");
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy("timestamp", "asc"));

    // **🔥 This makes messages update in real-time**
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [recipientId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
  
    if (!itemId) {
      console.error("Error: itemId is undefined! Make sure it's passed to <Chat />");
      return;
    }
  
    const chatId = [auth.currentUser.uid, recipientId].sort().join("_");
  
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: new Date(),
    });
  
    const senderRef = doc(db, `userChats/${auth.currentUser.uid}`);
    const recipientRef = doc(db, `userChats/${recipientId}`);
  
    await setDoc(senderRef, {
      [recipientId]: { chatId, recipientName, itemId }, // ✅ Ensure itemId is included
    }, { merge: true });
  
    await setDoc(recipientRef, {
      [auth.currentUser.uid]: { chatId, recipientName: auth.currentUser.displayName, itemId },
    }, { merge: true });
  
    setNewMessage("");
  };
  

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-2">Chat with {recipientName}</h2>
      <div className="h-60 overflow-y-auto border p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 p-2 rounded ${msg.senderId === auth.currentUser.uid ? "bg-blue-500 text-white text-right" : "bg-gray-300"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-2 flex">
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="ml-2 p-2 bg-orange-500 text-white rounded">Send</button>
      </form>
    </div>
  );
};

export default Chat;
