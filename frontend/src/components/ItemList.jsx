import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useChat } from "../contexts/ChatContext";
import { Heart, HeartOff, Trash2, Repeat2, DollarSign } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useTranslation } from "react-i18next";

const ItemList = () => {
  const { t } = useTranslation("itemList");
  const { user } = useAuth();
  const { isAdmin, logAdminAction } = useAdmin();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const { generateChatId } = useChat();
  const { items, likeItem, unlikeItem, getLikedItemIds, removeItem } = useItems(); // Use items from context instead of creating duplicate listener
  const [likedIds, setLikedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedIds = async () => {
      if (!user) return; // Don't fetch if no user
      const ids = await getLikedItemIds();
      setLikedIds(ids);
    };

    fetchLikedIds();
  }, [getLikedItemIds, user]);

  const toggleLike = async (itemId, itemUserId) => {
    if (!user) return showError("Log ind for at like opslag.");
    
    // Prevent users from liking their own posts
    if (user.uid === itemUserId) {
      return showError("Du kan ikke like dine egne opslag.");
    }
    
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
      `Er du sikker på at du vil fjerne "${itemTitle}"? Denne handling kan ikke fortrydes.`,
      async () => {
        try {
          await removeItem(itemId);
          // Log the admin action
          await logAdminAction('remove_item', {
            itemId,
            itemTitle,
            removedAt: new Date()
          });
          showSuccess("Opslag fjernet!");
        } catch (error) {
          console.error("Error removing item:", error);
          showError("Kunne ikke fjerne opslag. Prøv igen senere.");
        }
      },
      "Bekræft Fjernelse",
      "Fjern",
      "Annuller"
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">{t("newPostsTitle")}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="relative bg-white shadow-lg rounded-lg overflow-hidden transition transform hover:scale-105 hover:shadow-xl duration-300 max-w-sm mx-auto w-full flex flex-col h-full"
            >
              <Link to={`/item/${item.id}`} className="block flex-grow">
                <LoadingPlaceholder
                  src={item.imageUrl || "https://via.placeholder.com/400"}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  placeholderClassName="rounded-t-lg"
                />
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      {t("typeLabel")}: {item.mode === "bytte" ? t("tradeLabel") : t("sellLabel")}
                    </span>
                    {item.mode === "bytte" ? (
                      <Repeat2 className="text-gray-600" size={18} />
                    ) : (
                      <DollarSign className="text-gray-600" size={18} />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {t("postedByLabel")}: {user && item.userId === user.uid ? t("youLabel") : item.userName}
                  </p>
                </div>
              </Link>
              
              <div className="absolute top-2 right-2 flex gap-2">
                {/* Only show like button if the user is not the owner of the post */}
                {user && item.userId !== user.uid && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleLike(item.id, item.userId);
                    }}
                    className="bg-white p-2 rounded-full shadow hover:bg-orange-100 transition"
                  >
                    {likedIds.includes(item.id) ? (
                      <Heart className="text-orange-500 fill-orange-500" size={20} />
                    ) : (
                      <Heart className="text-gray-400" size={20} />
                    )}
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(item.id, item.title);
                    }}
                    className="bg-red-500 p-2 rounded-full shadow hover:bg-red-600 transition"
                    title={t("confirmRemoveTitle")}
                  >
                    <Trash2 className="text-white" size={20} />
                  </button>
                )}
              </div>
              
              <div className="p-4 pt-0 pb-8 mt-auto">
                {user && item.userId !== user.uid && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
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
                    className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    {t("sendMessageButton", { userName: item.userName })}
                  </button>
                )}
                {!user && (
                  <p className="text-sm text-red-500">{t("loginToSendMessage")}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">{t("noPostsAvailable")}</p>
        )}
      </div>
    </div>
  );
};

export default ItemList;
