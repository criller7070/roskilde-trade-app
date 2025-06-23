import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";

const ItemPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateChatId } = useChat();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "items", itemId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    };
    fetchItem();
  }, [itemId]);

  const handleStartChat = () => {
    if (!user) {
      // Handle not logged in case
      return;
    }
    
    const chatId = generateChatId(user.uid, item.userId, item.id);
    navigate(`/chat/${chatId}`, { 
      state: { 
        itemId: item.id,
        itemName: item.title,
        itemImage: item.imageUrl,
        recipientName: item.userName,
        recipientId: item.userId
      }
    });
  };

  if (!item) return <p className="text-center mt-10">Indlæser...</p>;

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-4">{item.title}</h1>
      <img
        src={item.imageUrl || "/placeholder.jpg"}
        alt={item.title}
        className="w-full rounded-lg border mb-4"
      />

      <h2 className="text-lg font-bold mb-1">Beskrivelse</h2>
      <p className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 mb-6">
        {item.description}
      </p>

      <div className="flex items-center gap-3 p-3 rounded-xl shadow bg-white mb-4">
        <img
          src={item.userProfilePic || "/default-avatar.png"}
          alt={item.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-bold">{item.userName}</p>
          <p className="text-xs text-gray-500">Skriv til sælger her</p>
        </div>
        {user && item.userId !== user.uid && (
          <button
            onClick={handleStartChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
          >
            Message {item.userName}
          </button>
        )}
        {!user && (
          <p className="text-sm text-red-500">Please log in to message the seller.</p>
        )}
      </div>
    </div>
  );
};

export default ItemPage;
