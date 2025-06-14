import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ItemsContext = createContext();

export function useItems() {
  return useContext(ItemsContext);
}

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Subscribe to items updates
  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
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
        timestamp: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  // Get items by user
  const getUserItems = () => {
    return items.filter(item => item.userId === user?.uid);
  };

  // Get items by category
  const getItemsByCategory = (category) => {
    return items.filter(item => item.category === category);
  };

  // Like an item
  const likeItem = async (itemId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      likedItemIds: arrayUnion(itemId),
    });
  };

  // Unlike an item
  const unlikeItem = async (itemId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      likedItemIds: arrayRemove(itemId),
    });
  };

  // Get liked item IDs
  const getLikedItemIds = async () => {
    if (!user) return [];
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const data = userSnap.data();
    return data?.likedItemIds || [];
  };

  const value = {
    items,
    loading,
    addItem,
    getUserItems,
    getItemsByCategory,
    likeItem,
    unlikeItem,
    getLikedItemIds
  };

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
} 