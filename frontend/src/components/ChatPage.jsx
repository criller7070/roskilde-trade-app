import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useChat } from "../contexts/ChatContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingPlaceholder from "./LoadingPlaceholder";

const ChatPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = usePopupContext();
  const { 
    messages, 
    activeChat, 
    setActiveChat, 
    sendMessage, 
    checkChatExists, 
    getChatMetadata,
    generateChatId,
    initializeChat
  } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [chatMeta, setChatMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Get item data from navigation state (when coming from ItemList)
  const itemData = location.state;

  // Set active chat when component mounts
  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
    return () => setActiveChat(null);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    if (!chatId || !user) return;

    const setupChat = async () => {
      try {
        // Check if chat exists
        const chatExists = await checkChatExists(chatId);
        
        if (!chatExists && itemData) {
          // Initialize new chat with item data using the ChatContext function
                      if (import.meta.env.DEV) {
              console.log('Initializing new chat...');
            }
          await initializeChat(user.uid, itemData.recipientId, itemData.itemId, {
            title: itemData.itemName || 'Unknown Item',
            imageUrl: itemData.itemImage || '',
            senderName: user.displayName || 'Unknown',  // Current user's name
            recipientName: itemData.recipientName || 'Unknown User'  // Other user's name
          });
        }

        // Get chat metadata
        const metadata = await getChatMetadata(chatId);
        if (metadata) {
          // Check if the item still exists
          let isItemDeleted = metadata.isItemDeleted || false;
          
          if (metadata.itemId && !isItemDeleted) {
            try {
              const itemDoc = await getDoc(doc(db, "items", metadata.itemId));
              if (!itemDoc.exists()) {
                isItemDeleted = true;
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.warn("Could not check item existence:", error.code);
              }
              // If we can't check, assume it might be deleted
              isItemDeleted = true;
            }
          }
          
          setChatMeta({
            ...metadata,
            isItemDeleted
          });
        } else if (itemData) {
          // Fallback to item data if metadata not found
          setChatMeta({
            itemName: itemData.itemName,
            itemImage: itemData.itemImage,
            participants: [user.uid, itemData.recipientId],
            userNames: {
              [user.uid]: user.displayName || 'Unknown',
              [itemData.recipientId]: itemData.recipientName || 'Unknown User'
            },
            isItemDeleted: false
          });
        }

        setIsLoading(false);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting up chat:', error.code);
        }
        showError('Kunne ikke indlæse chat');
        setIsLoading(false);
      }
    };

    setupChat();
  }, [chatId, user, itemData, showError, checkChatExists, getChatMetadata, initializeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    try {
      // Get recipient data from chat metadata
      const recipientId = chatMeta?.participants?.find(id => id !== user.uid);
      const recipientName = chatMeta?.userNames?.[recipientId] || 'Unknown User';

      const messageItemData = {
        title: chatMeta?.itemName || 'Unknown Item',
        imageUrl: chatMeta?.itemImage || '',
        senderName: user.displayName || 'Unknown',
        recipientName,
        recipientId
      };
      
      await sendMessage(chatId, newMessage.trim(), messageItemData);
      setNewMessage("");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending message:', error.code);
      }
      showError('Kunne ikke sende besked');
    }
  };

  const handleItemImageClick = () => {
    if (chatMeta?.itemId && !chatMeta.isItemDeleted) {
      navigate(`/item/${chatMeta.itemId}`);
    }
  };

  if (!user) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Log ind for at se chats.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Indlæser chat...</p>
      </div>
    );
  }

  if (!chatMeta) {
    return (
      <div className="pt-20 px-4 text-center">
        <p className="text-gray-600">Chat ikke fundet.</p>
      </div>
    );
  }

  // Get other participant's name
  const otherParticipantId = chatMeta.participants?.find(id => id !== user.uid);
  const otherParticipantName = chatMeta?.userNames?.[otherParticipantId] || itemData?.recipientName || 'Unknown User';

  return (
    <div className={`pt-20 px-4 pb-32 min-h-screen max-w-md mx-auto relative ${
      chatMeta.isItemDeleted ? 'bg-gray-200' : 'bg-orange-100'
    }`}>
      <div className="mb-4 text-center">
        <h2 className={`text-xl font-bold ${
          chatMeta.isItemDeleted ? 'text-gray-500' : 'text-orange-500'
        }`}>Chat med {otherParticipantName}</h2>
        <p className="text-sm text-gray-600">
          Om: <strong className={chatMeta.isItemDeleted ? "text-red-500" : ""}>{chatMeta.itemName}</strong>
        </p>
        {chatMeta.isItemDeleted && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Dette opslag er blevet slettet
            </p>
            <p className="text-xs text-red-500 mt-1">
              Du kan ikke længere sende beskeder om dette opslag
            </p>
          </div>
        )}
        {chatMeta.itemImage && !chatMeta.isItemDeleted && (
          <div 
            onClick={handleItemImageClick}
            className="flex justify-center mt-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            title="Klik for at se opslaget"
          >
            <LoadingPlaceholder 
              src={chatMeta.itemImage} 
              alt={chatMeta.itemName} 
              className="h-28 w-28 rounded-lg object-cover"
              placeholderClassName="rounded-lg"
            />
          </div>
        )}
      </div>

      <div className={`space-y-3 ${chatMeta.isItemDeleted ? 'opacity-60' : ''}`}>
        {messages.map((msg, index) => {
          // Handle system messages differently
          if (msg.senderId === "system" || msg.isSystemMessage) {
            return (
              <div key={msg.id || index} className="flex justify-center">
                <div className="max-w-sm px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs text-center">
                  <p>{msg.text}</p>
                  <span className="block mt-1 text-[10px] text-gray-500">
                    {msg.timestamp?.seconds &&
                      formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), {
                        addSuffix: true,
                      })}
                  </span>
                </div>
              </div>
            );
          }

          // Regular user messages
          return (
            <div
              key={msg.id || index}
              className={`flex ${
                msg.senderId === user.uid ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  chatMeta.isItemDeleted
                    ? msg.senderId === user.uid
                      ? "bg-gray-400 text-gray-100 rounded-br-none"
                      : "bg-gray-300 text-gray-600 rounded-bl-none"
                    : msg.senderId === user.uid
                    ? "bg-orange-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className={`block mt-1 text-[10px] text-right ${
                  chatMeta.isItemDeleted ? 'text-gray-400' : 'text-gray-300'
                }`}>
                  {msg.timestamp?.seconds &&
                    formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), {
                      addSuffix: true,
                    })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {chatMeta.isItemDeleted ? (
        <div className="fixed bottom-0 left-0 w-full bg-gray-100 px-4 py-3 border-t flex items-center justify-center z-50"
             style={{maxWidth: '100%'}}>
          <p className="text-gray-500 text-sm text-center">
            📵 Beskeder er deaktiveret - opslaget er slettet
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="fixed bottom-0 left-0 w-full bg-white px-4 py-3 border-t z-50"
          style={{maxWidth: '100%'}}
        >
          <div className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setNewMessage(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newMessage.trim()) {
                    handleSendMessage(e);
                  }
                }
              }}
              placeholder="Skriv en besked..."
              className="flex-1 p-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none min-h-[44px] max-h-20"
              maxLength={500}
              rows={2}
              style={{ lineHeight: '1.2' }}
            />
            <div className="flex flex-col items-end gap-1">
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`px-4 py-2 rounded-full text-sm transition-colors h-11 flex-shrink-0 ${
                  newMessage.trim() 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send
              </button>
              <div className={`text-xs transition-colors duration-200 ${
                newMessage.length >= 450 ? 'text-red-500 font-medium' :
                newMessage.length >= 400 ? 'text-orange-500' :
                newMessage.length >= 300 ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
                <span>
                  {newMessage.length}/500 tegn
                </span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatPage;
