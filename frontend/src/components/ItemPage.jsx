import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import LoadingPlaceholder from "./LoadingPlaceholder";

const ItemPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateChatId } = useChat();
  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);

  useEffect(() => {
    const fetchItemAndSeller = async () => {
      try {
        const itemRef = doc(db, "items", itemId);
        const itemSnap = await getDoc(itemRef);

        if (!itemSnap.exists()) return;

        const itemData = { id: itemSnap.id, ...itemSnap.data() };
        setItem(itemData);

        // Try to fetch seller profile, but don't fail if we can't access it
        try {
          const sellerRef = doc(db, "users", itemData.userId);
          const sellerSnap = await getDoc(sellerRef);

          if (sellerSnap.exists()) {
            setSellerProfile(sellerSnap.data());
          }
        } catch (sellerErr) {
          console.log("Could not fetch seller profile (permissions):", sellerErr);
          // Set a minimal seller profile with just the userName from the item
          setSellerProfile({ displayName: itemData.userName });
        }
      } catch (err) {
        console.error("Failed to load item or seller:", err);
      }
    };

    fetchItemAndSeller();
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
    <div className="pt-4 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-4">{item.title}</h1>
      <LoadingPlaceholder
        src={item.imageUrl || "/placeholder.jpg"}
        alt={item.title}
        className="w-full max-w-sm max-h-64 object-cover rounded-lg border mb-4 mx-auto"
        placeholderClassName="rounded-lg border max-w-sm max-h-64 mx-auto"
      />

      <h2 className="text-lg font-bold text-orange-500 mb-1">Beskrivelse</h2>
      <p className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 mb-6">
        {item.description}
      </p>

      <div className="flex items-center gap-3 p-3 rounded-xl shadow bg-white mb-4">
        <LoadingPlaceholder
          src={sellerProfile?.photoURL || "/default_pfp.jpg"}
          alt={item.userName}
          className="w-10 h-10 rounded-full object-cover"
          placeholderClassName="rounded-full"
          fallbackSrc="/default_pfp.jpg"
        />
        <div className="flex-1">
          <p className="text-sm font-bold">{item.userName}</p>
          {user && item.userId === user.uid ? (
            <p className="text-xs text-green-600 font-medium">Dette er dit opslag</p>
          ) : (
            <p className="text-xs text-gray-500">Skriv til sælger her</p>
          )}
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
