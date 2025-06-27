import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const ChatList = () => {
  const { user } = useAuth();
  const { chats, loading } = useChat();
  const { showConfirm, showSuccess, showError } = usePopupContext();
  const navigate = useNavigate();
  const [chatStatuses, setChatStatuses] = useState({});

  // Delete a chat from user's chat list
  const deleteChat = async (chatId, itemName) => {
    try {
      // Delete from user's personal chat list
      await deleteDoc(doc(db, "userChats", user.uid, "chats", chatId));
      showSuccess("Chat slettet fra din liste!");
    } catch (error) {
      console.error("Error deleting chat:", error);
      showError("Kunne ikke slette chat. Prøv igen.");
    }
  };

  const confirmDeleteChat = (chatId, itemName) => {
    showConfirm(
      `Er du sikker på, at du vil slette chatten om "${itemName}"?`,
      () => deleteChat(chatId, itemName),
      "Slet Chat",
      "Slet",
      "Annuller"
    );
  };

  const handleItemImageClick = (e, itemId, isDeleted) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemId && !isDeleted) {
      navigate(`/item/${itemId}`);
    }
  };

  // Check which items are deleted
  useEffect(() => {
    const checkDeletedItems = async () => {
      const statusChecks = {};
      
      for (const chat of chats) {
        if (chat.itemId && !chat.itemName?.includes('[SLETTET]')) {
          try {
            const itemDoc = await getDoc(doc(db, "items", chat.itemId));
            statusChecks[chat.id] = {
              isDeleted: !itemDoc.exists(),
              itemName: chat.itemName
            };
          } catch (error) {
            // If we can't check, assume it might be deleted
            statusChecks[chat.id] = {
              isDeleted: true,
              itemName: chat.itemName
            };
          }
        } else {
          // Already marked as deleted or no itemId
          statusChecks[chat.id] = {
            isDeleted: chat.itemName?.includes('[SLETTET]') || false,
            itemName: chat.itemName
          };
        }
      }
      
      setChatStatuses(statusChecks);
    };

    if (chats.length > 0) {
      checkDeletedItems();
    }
  }, [chats]);

  if (!user) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Log venligst ind for at se dine beskeder.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Indlæser beskeder...</p>
      </div>
    );
  }

  return (
    <div className="pt-12 px-4 pb-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Dine Beskeder</h1>
      <div className="space-y-4">
        {chats.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Ingen beskeder endnu.</p>
            <p className="text-xs text-gray-400 mt-2">Prøv at sende en besked til nogen fra et opslag!</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isDeleted = chatStatuses[chat.id]?.isDeleted || false;
            
            return (
              <div
                key={chat.id}
                className={`block rounded-xl shadow p-4 transition-all relative ${
                  isDeleted 
                    ? 'bg-gray-100 hover:bg-gray-200 opacity-75' 
                    : 'bg-white hover:shadow-md'
                }`}
              >
                <Link
                  to={`/chat/${chat.id}`}
                  className="block"
                >
                  <div className="flex items-center space-x-4 pr-12">
                  {chat.itemImage && (
                    <div
                      onClick={(e) => handleItemImageClick(e, chat.itemId, isDeleted)}
                      className={`flex-shrink-0 ${
                        !isDeleted && chat.itemId ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''
                      }`}
                      title={!isDeleted && chat.itemId ? "Klik for at se opslaget" : ""}
                    >
                      <LoadingPlaceholder
                        src={chat.itemImage}
                        alt={chat.itemName}
                        className={`w-16 h-16 object-cover rounded-lg ${
                          isDeleted ? 'grayscale opacity-50' : ''
                        }`}
                        placeholderClassName="rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${
                      isDeleted ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {chat.itemName}
                    </h3>
                    <p className={`text-sm truncate ${
                      isDeleted ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      Med: {chat.otherUserName}
                    </p>
                    <p className={`text-sm truncate mt-1 ${
                      isDeleted ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {chat.lastMessage || "Ingen beskeder endnu"}
                    </p>
                    {chat.lastMessageTime && (
                      <p className={`text-xs mt-1 ${
                        isDeleted ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        {formatDistanceToNow(new Date(chat.lastMessageTime.seconds * 1000), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                    </div>
                  </div>
                </Link>
                
                {/* Notification badge */}
                {chat.unreadCount > 0 && !isDeleted && (
                  <div className="absolute top-4 right-2 z-10">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded-full">
                      {chat.unreadCount}
                    </span>
                  </div>
                )}
                
                {/* Delete button for deleted items */}
                {isDeleted && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      confirmDeleteChat(chat.id, chat.itemName);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Slet besked"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
