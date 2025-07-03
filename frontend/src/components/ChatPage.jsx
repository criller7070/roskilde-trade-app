import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";
import { useAuth } from "../contexts/AuthContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useChat } from "../contexts/ChatContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { checkRateLimit, checkBurstLimit } from "../utils/rateLimiter";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { validatePostImage } from "../utils/fileValidation";

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
  const [selectedFile, setSelectedFile] = useState(null);
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
    if ((!newMessage.trim() && !selectedFile) || !user || !chatId) return;

    // Rate limiting for messages
    const rateCheck = checkRateLimit('sendMessage', user.uid);
    if (!rateCheck.allowed) {
      showError(rateCheck.message);
      return;
    }

    const burstCheck = checkBurstLimit('sendMessage', user.uid);
    if (!burstCheck.allowed) {
      showError(burstCheck.message);
      return;
    }

    try {
      // Send image message if a file is selected
      if (selectedFile) {
        await sendMessage(chatId, null, chatMeta, selectedFile);
        setSelectedFile(null);
      }

      // Send text message if text is provided
      if (newMessage.trim()) {
        await sendMessage(chatId, newMessage.trim(), chatMeta, null);
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error); // Log the full error object
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
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                msg.senderId === user.uid ? "bg-orange-500 text-white" : "bg-white text-gray-800"
              }`}
            >
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Sent photo"
                  className="max-w-[150px] max-h-[150px] rounded-lg mb-2 object-cover"
                />
              )}
              {msg.text && <p>{msg.text}</p>}
              <span className="block mt-1 text-[10px] text-right text-gray-300">
                {msg.timestamp?.seconds &&
                  formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), {
                    addSuffix: true,
                    locale: da,
                  })}
              </span>
            </div>
          </div>
        ))}
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
          style={{ maxWidth: '100%' }}
        >
          <div className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setNewMessage(e.target.value);
                }
              }}
              placeholder="Skriv en besked..."
              className="flex-1 p-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none min-h-[44px] max-h-20"
              maxLength={500}
              rows={2}
              style={{ lineHeight: '1.2' }}
            />

            {/* Image Preview */}
            {selectedFile && (
              <div className="flex items-center gap-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Fjern
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const validationResult = validatePostImage(file);
                  if (!validationResult.isValid) {
                    showError(validationResult.error); // Display validation error
                    return;
                  }
                  setSelectedFile(file); // Set the file if validation passes
                }
              }}
              className="hidden"
              id="photoInput"
            />
            <label htmlFor="photoInput" className="cursor-pointer">
              📷
            </label>
            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile}
              className={`px-4 py-2 rounded-full text-sm transition-colors h-11 flex-shrink-0 ${
                newMessage.trim() || selectedFile
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatPage;
