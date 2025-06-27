import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionState, setConnectionState] = useState('connected');

  // Monitor connection state for mobile
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Online');
      setConnectionState('connected');
      // Re-enable Firestore network
      enableNetwork(db).catch(console.error);
    };
    
    const handleOffline = () => {
      console.log('Network: Offline');
      setConnectionState('offline');
      // Disable Firestore network to prevent connection errors
      disableNetwork(db).catch(console.error);
    };

    // Handle visibility change (mobile app backgrounding)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('App backgrounded - cleaning up connections');
        setConnectionState('background');
      } else {
        console.log('App foregrounded - restoring connections');
        setConnectionState('connected');
        // Small delay to ensure network is stable
        setTimeout(() => {
          enableNetwork(db).catch(console.error);
        }, 500);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Generate chat ID that includes item context
  const generateChatId = useCallback((userId1, userId2, itemId) => {
    const sortedUsers = [userId1, userId2].sort();
    return `${sortedUsers.join('_')}_${itemId}`;
  }, []);

  // Initialize a new chat
  const initializeChat = useCallback(async (userId1, userId2, itemId, itemData) => {
    const chatId = generateChatId(userId1, userId2, itemId);
    
    try {
      // Stricter validation before writing
      if (!userId1 || !userId2 || !itemId || !itemData.title) {
        throw new Error('Missing required chat initialization parameters');
      }

      console.log('Initializing chat with data:', { userId1, userId2, itemId, itemData });

      const chatRef = doc(db, 'chats', chatId);

      const chatPayload = {
        itemId,
        itemName: itemData.title || 'Unknown Item',
        itemImage: itemData.imageUrl || '',
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        lastMessage: null,
        userNames: {
          [userId1]: itemData.senderName || 'Unknown',
          [userId2]: itemData.recipientName || 'Unknown'
        }
      };

      await setDoc(chatRef, chatPayload);

      // Validate the result after writing
      const chatDoc = await getDoc(chatRef);
      const chatData = chatDoc.data();

      if (!chatData || !Array.isArray(chatData.participants) || !chatData.participants.includes(userId1)) {
        throw new Error('Chat document is invalid or sender not included in participants');
      }

      const user1ChatRef = doc(db, 'userChats', userId1, 'chats', chatId);
      const user2ChatRef = doc(db, 'userChats', userId2, 'chats', chatId);

      const user1Data = {
        itemId,
        itemName: itemData.title || 'Unknown Item',
        itemImage: itemData.imageUrl || '',
        otherUserId: userId2,
        otherUserName: itemData.recipientName || 'Unknown',
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      };

      const user2Data = {
        itemId,
        itemName: itemData.title || 'Unknown Item',
        itemImage: itemData.imageUrl || '',
        otherUserId: userId1,
        otherUserName: itemData.senderName || 'Unknown',
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      };

      await Promise.all([
        setDoc(user1ChatRef, user1Data),
        setDoc(user2ChatRef, user2Data)
      ]);

      console.log('Chat initialized successfully:', chatId);
      return chatId;
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  }, [generateChatId]);

  // Check if chat exists
  const checkChatExists = useCallback(async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      return chatDoc.exists();
    } catch (error) {
      console.error('Error checking chat existence:', error);
      // If it's a permission error, assume chat doesn't exist
      if (error.code === 'permission-denied') {
        return false;
      }
      throw error;
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (chatId, text, itemData = null) => {
    if (!user) throw new Error('User must be logged in to send messages');

    const chatRef = doc(db, 'chats', chatId);
    let chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      if (!itemData || !itemData.recipientId) {
        throw new Error("Missing itemData or recipientId for initializing chat");
      }
    
      const parts = chatId.split('_');
      const itemId = parts.slice(2).join('_');
      await initializeChat(user.uid, itemData.recipientId, itemId, itemData);
      chatDoc = await getDoc(chatRef);
    }
    

    if (!chatDoc.exists()) throw new Error('Chat document not available');

    const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: user.uid,
      text,
      timestamp: serverTimestamp()
    });

    await updateDoc(chatRef, {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
        senderId: user.uid
      }
    });

    // Update sender's userChat document
    const senderChatRef = doc(db, 'userChats', user.uid, 'chats', chatId);
    await setDoc(senderChatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      unreadCount: 0
    }, { merge: true });

    const chatData = chatDoc.data();
    const recipientId = chatData.participants.find(id => id !== user.uid);
    const recipientChatRef = doc(db, 'userChats', recipientId, 'chats', chatId);

    await setDoc(recipientChatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      unreadCount: increment(1)
    }, { merge: true });

    return messageRef.id;
  }, [user, initializeChat]);

  // Get chat metadata
  const getChatMetadata = useCallback(async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      return chatDoc.exists() ? chatDoc.data() : null;
    } catch (error) {
      console.error('Error getting chat metadata:', error);
      // If it's a permission error, return null
      if (error.code === 'permission-denied') {
        return null;
      }
      throw error;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId) => {
    if (!user) return;
    
    try {
      const userChatRef = doc(db, 'userChats', user.uid, 'chats', chatId);
      
      // First check if the document exists
      const userChatDoc = await getDoc(userChatRef);
      if (!userChatDoc.exists()) {
        // If it doesn't exist, we need to create it with basic data
        // Get the chat metadata to populate the userChat document
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          const otherUserId = chatData.participants.find(id => id !== user.uid);
          const otherUserName = chatData.userNames?.[otherUserId] || 'Unknown User';
          
          await setDoc(userChatRef, {
            itemId: chatData.itemId || '',
            itemName: chatData.itemName || 'Unknown Item',
            itemImage: chatData.itemImage || '',
            otherUserId: otherUserId || '',
            otherUserName: otherUserName,
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            unreadCount: 0
          });
        } else {
          return;
        }
      } else {
        // Document exists, just update the unread count
        await setDoc(userChatRef, {
          unreadCount: 0
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [user]);

  // Subscribe to user's chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    let unsubscribe;

    const setupListener = () => {
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 second timeout

      try {
        const userChatsRef = collection(db, 'userChats', user.uid, 'chats');
        const q = query(userChatsRef, orderBy('lastMessageTime', 'desc'));

        unsubscribe = onSnapshot(q, (snapshot) => {
          clearTimeout(timeoutId);
          const chatsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setChats(chatsData);
          setLoading(false);
          retryCount = 0; // Reset retry count on success

          // Calculate total unread count
          const totalUnread = chatsData.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        }, (error) => {
          console.error('Error subscribing to chats:', error);
          clearTimeout(timeoutId);
          
          // Handle specific error types
          if (error.code === 'permission-denied') {
            console.warn('Permission denied for chats - user may not have access');
            setChats([]);
            setLoading(false);
            setUnreadCount(0);
            return;
          }

          // Retry logic for network issues
          if (retryCount < maxRetries && (
            error.code === 'unavailable' || 
            error.code === 'internal' ||
            error.message.includes('NS_BINDING_ABORTED')
          )) {
            retryCount++;
            console.log(`Retrying chat subscription (attempt ${retryCount}/${maxRetries})`);
            setTimeout(() => {
              if (user) { // Only retry if user is still logged in
                setupListener();
              }
            }, 2000 * retryCount); // Exponential backoff
          } else {
            setChats([]);
            setLoading(false);
            setUnreadCount(0);
          }
        });

        return () => {
          clearTimeout(timeoutId);
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up chat subscription:', error);
        clearTimeout(timeoutId);
        setChats([]);
        setLoading(false);
        setUnreadCount(0);
      }
    };

    const cleanup = setupListener();
    return cleanup;
  }, [user]);

  // Subscribe to messages for a chat
  const subscribeToMessages = useCallback((chatId) => {
    if (!chatId) return;

    let retryCount = 0;
    const maxRetries = 3;

    const setupMessageListener = () => {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(newMessages);
          retryCount = 0; // Reset retry count on success
          
          // Mark as read when viewing chat
          if (newMessages.length > 0) {
            markAsRead(chatId);
          }
        },
        (error) => {
          console.error('Error subscribing to messages:', error);
          
          // Handle specific error types
          if (error.code === 'permission-denied') {
            console.warn('Permission denied for messages');
            setMessages([]);
            return;
          }

          // Retry logic for network issues
          if (retryCount < maxRetries && (
            error.code === 'unavailable' || 
            error.code === 'internal' ||
            error.message.includes('NS_BINDING_ABORTED')
          )) {
            retryCount++;
            console.log(`Retrying message subscription (attempt ${retryCount}/${maxRetries})`);
            setTimeout(() => {
              setupMessageListener();
            }, 1000 * retryCount); // Exponential backoff
          } else {
            setMessages([]);
          }
        }
      );

      return unsubscribe;
    };

    return setupMessageListener();
  }, [markAsRead]);

  // Subscribe to active chat messages
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(activeChat);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeChat, subscribeToMessages]);

  const value = {
    // State
    chats,
    loading,
    activeChat,
    messages,
    unreadCount,
    connectionState,
    
    // Functions
    generateChatId,
    initializeChat,
    sendMessage,
    checkChatExists,
    getChatMetadata,
    markAsRead,
    setActiveChat,
    subscribeToMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
} 