import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useAdmin } from './AdminContext';

const ItemsContext = createContext();

export function useItems() {
  return useContext(ItemsContext);
}

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  // Subscribe to items updates
  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Add new item
  const addItem = async (itemData) => {
    if (!user) throw new Error('User must be logged in to add items');

    try {
      const docRef = await addDoc(collection(db, "items"), {
        ...itemData,
        userId: user.uid,
        userName: user.displayName,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  // getters
  const getUserItems = () => {
    return items.filter(item => item.userId === user?.uid);
  };
  const getItemsByCategory = (category) => {
    return items.filter(item => item.category === category);
  };

  // Like an item - "I'm interested in this, add to my favorites!"	
  const likeItem = async (itemId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      likedItemIds: arrayUnion(itemId),
    });
  };

  // Dislike an item - "I'm not interested. Hide it from swipe page."	
  const dislikeItem = async (itemId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      dislikedItemIds: arrayUnion(itemId),
    });
  };

  // Unlike an item - "I'm no longer interested in this item from my favorites."	
  const unlikeItem = async (itemId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      likedItemIds: arrayRemove(itemId),
    });
  };

  // Undislike an item - "Remove this item from my disliked list."	
  const undislikeItem = async (itemId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      dislikedItemIds: arrayRemove(itemId),
    });
  };

  // Get liked item IDs
  const getLikedItemIds = async () => {
    if (!user) return [];
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const data = userSnap.data();
    return data?.likedItemIds || [];
  };

  // Get disliked item IDs
  const getDislikedItemIds = async () => {
    if (!user) return [];
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const data = userSnap.data();
    return data?.dislikedItemIds || [];
  };

  // Admin function to remove an item
  const removeItem = async (itemId) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      await deleteDoc(doc(db, "items", itemId));
      console.log("Item removed successfully:", itemId);
    } catch (error) {
      console.error("Error removing item:", error);
      throw error;
    }
  };

  const value = {
    items,
    loading,
    addItem,
    getUserItems,
    getItemsByCategory,
    likeItem,
    unlikeItem,
    getLikedItemIds,
    dislikeItem,
    undislikeItem,
    getDislikedItemIds,
    removeItem
  };

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
} 