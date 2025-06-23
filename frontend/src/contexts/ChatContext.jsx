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
  updateDoc
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

  // Generate chat ID that includes item context
  const generateChatId = useCallback((userId1, userId2, itemId) => {
    const sortedUsers = [userId1, userId2].sort();
    return `${sortedUsers.join('_')}_${itemId}`;
  }, []);

  // Initialize a new chat
  const initializeChat = useCallback(async (userId1, userId2, itemId, itemData) => {
    const chatId = generateChatId(userId1, userId2, itemId);
    
    try {
      // Validate itemData to prevent undefined values
      if (!itemData || !itemData.title) {
        console.error('Invalid itemData:', itemData);
        throw new Error('Invalid item data provided');
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

      // Verify the chat was created successfully
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        throw new Error('Chat document was not created successfully');
      }

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

    if (!chatDoc.exists() && itemData) {
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

    const chatData = chatDoc.data();
    const participants = chatData.participants || [];

    await Promise.all(participants.map(async (participantId) => {
      const otherUserId = participants.find(id => id !== participantId);
      const otherUserName = chatData.userNames?.[otherUserId] || 'Unknown';

      const userChatRef = doc(db, 'userChats', participantId, 'chats', chatId);
      const userChatDoc = await getDoc(userChatRef);

      const updateData = {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCount: participantId === user.uid ? 0 : 1,
        otherUserId: otherUserId,
        otherUserName: otherUserName
      };

      if (!userChatDoc.exists()) {
        await setDoc(userChatRef, {
          ...updateData,
          itemId: chatData.itemId || '',
          itemName: chatData.itemName || '',
          itemImage: chatData.itemImage || ''
        });
      } else {
        await setDoc(userChatRef, updateData, { merge: true });
      }
    }));

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
      console.log('Marking as read for chat:', chatId, 'user:', user.uid);
      const userChatRef = doc(db, 'userChats', user.uid, 'chats', chatId);
      
      // First check if the document exists
      const userChatDoc = await getDoc(userChatRef);
      if (!userChatDoc.exists()) {
        console.log('UserChat document does not exist, creating it');
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
          console.error('Chat document does not exist for chatId:', chatId);
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
      console.log('No user, clearing chats');
      setChats([]);
      setLoading(false);
      return;
    }

    console.log('Setting up chat subscription for user:', user.uid);
    setLoading(true);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Chat subscription timeout, setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    try {
      // Fix: Use proper subcollection path
      const userChatsRef = collection(db, 'userChats', user.uid, 'chats');
      const q = query(userChatsRef, orderBy('lastMessageTime', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Chat subscription update:', snapshot.docs.length, 'chats');
        clearTimeout(timeoutId); // Clear timeout on successful subscription
        const chatsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChats(chatsData);
        setLoading(false);

        // Calculate total unread count
        const totalUnread = chatsData.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
        console.log('Chats loaded:', chatsData.length, 'chats,', totalUnread, 'unread');
      }, (error) => {
        console.error('Error subscribing to chats:', error);
        clearTimeout(timeoutId);
        setChats([]);
        setLoading(false);
        setUnreadCount(0);
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up chat subscription:', error);
      clearTimeout(timeoutId);
      setChats([]);
      setLoading(false);
      setUnreadCount(0);
    }
  }, [user]);

  // Subscribe to messages for a chat
  const subscribeToMessages = useCallback((chatId) => {
    if (!chatId) return;

    console.log('Subscribing to messages for chat:', chatId);
    
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(newMessages);
        console.log('Messages updated:', newMessages.length);
        
        // Mark as read when viewing chat
        if (newMessages.length > 0) {
          markAsRead(chatId);
        }
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
        // If it's a permission error, set empty messages
        if (error.code === 'permission-denied') {
          setMessages([]);
        }
      }
    );

    return unsubscribe;
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