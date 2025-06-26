import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useChat } from "../contexts/ChatContext";
import LoadingPlaceholder from "./LoadingPlaceholder";

const ChatPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
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
          console.log('Initializing new chat with itemData:', itemData);
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
          setChatMeta(metadata);
        } else if (itemData) {
          // Fallback to item data if metadata not found
          setChatMeta({
            itemName: itemData.itemName,
            itemImage: itemData.itemImage,
            participants: [user.uid, itemData.recipientId],
            userNames: {
              [user.uid]: user.displayName || 'Unknown',
              [itemData.recipientId]: itemData.recipientName || 'Unknown User'
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up chat:', error);
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
      console.error('Error sending message:', error);
      showError('Kunne ikke sende besked');
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
    <div className="pt-20 px-4 pb-32 min-h-screen bg-orange-100 max-w-md mx-auto relative">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-orange-500">Chat med {otherParticipantName}</h2>
        <p className="text-sm text-gray-600">Om: <strong>{chatMeta.itemName}</strong></p>
        {chatMeta.itemImage && (
          <LoadingPlaceholder 
            src={chatMeta.itemImage} 
            alt={chatMeta.itemName} 
            className="mx-auto mt-2 h-20 rounded-lg object-cover"
            placeholderClassName="rounded-lg"
          />
        )}
      </div>

      <div className="space-y-3">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
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
        onSubmit={handleSendMessage}
        className="fixed bottom-0 left-0 w-full bg-white px-4 py-3 border-t flex items-center z-50"
        style={{maxWidth: '100%'}}
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
