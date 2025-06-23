import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useChat } from "../contexts/ChatContext";
import { Heart, HeartOff, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ItemList = () => {
  const { user } = useAuth();
  const { isAdmin, logAdminAction } = useAdmin();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const { generateChatId } = useChat();
  const [items, setItems] = useState([]);
  const { likeItem, unlikeItem, getLikedItemIds, removeItem } = useItems();
  const [likedIds, setLikedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedIds = async () => {
      const ids = await getLikedItemIds();
      setLikedIds(ids);
    };

    fetchLikedIds();
  }, [getLikedItemIds]);

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const toggleLike = async (itemId) => {
    if (!user) return showError("Log ind for at like opslag.");
    if (likedIds.includes(itemId)) {
      await unlikeItem(itemId);
      setLikedIds(likedIds.filter((id) => id !== itemId));
    } else {
      await likeItem(itemId);
      setLikedIds([...likedIds, itemId]);
    }
  };

  const handleRemoveItem = async (itemId, itemTitle) => {
    showConfirm(
      `Are you sure you want to remove "${itemTitle}"? This action cannot be undone.`,
      async () => {
        try {
          await removeItem(itemId);
          // Log the admin action
          await logAdminAction('remove_item', {
            itemId,
            itemTitle,
            removedAt: new Date()
          });
          showSuccess("Item removed successfully!");
        } catch (error) {
          console.error("Error removing item:", error);
          showError("Failed to remove item. Please try again.");
        }
      },
      "Confirm Removal",
      "Remove",
      "Cancel"
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Nye Opslag</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="relative bg-white shadow-lg rounded-lg overflow-hidden transition transform hover:scale-105 hover:shadow-xl duration-300"
            >
              <img
                src={item.imageUrl || "https://via.placeholder.com/400"}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => toggleLike(item.id)}
                    className="bg-white p-2 rounded-full shadow hover:bg-orange-100 transition"
                  >
                    {likedIds.includes(item.id) ? (
                      <Heart className="text-orange-500 fill-orange-500" size={20} />
                    ) : (
                      <Heart className="text-gray-400" size={20} />
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="bg-red-500 p-2 rounded-full shadow hover:bg-red-600 transition"
                      title="Remove listing (Admin only)"
                    >
                      <Trash2 className="text-white" size={20} />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                <span className="text-sm text-gray-500 mt-2 block">Mode: {item.mode}</span>
                <p className="text-sm text-gray-500 mt-2">Posted by: {item.userName}</p>
                {user && item.userId !== user.uid && (
                  <button
                    onClick={() => {
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
                    }}
                    className="mt-4 w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Message {item.userName}
                  </button>
                )}
                {!user && (
                  <p className="text-sm text-red-500 mt-4">Please log in to message the seller.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No items available yet.</p>
        )}
      </div>
    </div>
  );
};

export default ItemList;
