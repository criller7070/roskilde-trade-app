import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Heart, MessageCircle, X } from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const SwipeCard = ({ item }) => {
  if (!item) return null;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
      <img 
        src={item.imageUrl || "https://via.placeholder.com/400"} 
        alt={item.title} 
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
        <h3 className="text-2xl font-bold">{item.title}</h3>
        <p className="text-sm mt-1">By: {item.userName}</p>
        <p className="text-base mt-2 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
};

// Fisher-Yates shuffle algorithm
const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const SwipePage = () => {
  const { items, loading, getLikedItemIds, getDislikedItemIds, likeItem, dislikeItem } = useItems();
  const { user } = useAuth();
  const { generateChatId } = useChat();
  const navigate = useNavigate();
  const [itemStack, setItemStack] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupSwipeStack = async () => {
      if (loading || !user) return;

      const [likedIds, dislikedIds] = await Promise.all([
        getLikedItemIds(),
        getDislikedItemIds()
      ]);
      
      const filteredItems = items.filter(item => 
        item.userId !== user.uid &&
        !likedIds.includes(item.id) &&
        !dislikedIds.includes(item.id)
      );

      setItemStack(shuffle(filteredItems));
      setIsLoading(false);
    };

    setupSwipeStack();
  }, [items, loading, user, getLikedItemIds, getDislikedItemIds]);

  const currentItem = useMemo(() => itemStack.length > 0 ? itemStack[itemStack.length - 1] : null, [itemStack]);

  const handleSwipe = (item, action) => {
    setItemStack(stack => stack.slice(0, stack.length - 1));
    if (action === 'like') {
      likeItem(item.id);
    } else if (action === 'dislike') {
      dislikeItem(item.id);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => currentItem && handleSwipe(currentItem, 'dislike'),
    onSwipedRight: () => currentItem && handleSwipe(currentItem, 'like'),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleChat = () => {
    if (!currentItem) return;
    const chatId = generateChatId(user.uid, currentItem.userId, currentItem.id);
    navigate(`/chat/${chatId}`, { 
      state: { 
        itemId: currentItem.id,
        itemName: currentItem.title,
        itemImage: currentItem.imageUrl,
        recipientName: currentItem.userName,
        recipientId: currentItem.userId
      }
    });
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading cards...</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-between p-4 bg-orange-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Velkommen</h2>
        <p className="text-gray-600">Swipe for at få flere gode deals</p>
      </div>
      
      <div {...swipeHandlers} className="relative w-full max-w-sm h-[60vh] flex items-center justify-center">
        <AnimatePresence>
          {currentItem ? (
            <motion.div
              key={currentItem.id}
              className="absolute w-full h-full"
              initial={{ scale: 0.8, y: -50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={(e, { offset }) => {
                if (offset.x > 50) handleSwipe(currentItem, 'like');
                else if (offset.x < -50) handleSwipe(currentItem, 'dislike');
              }}
            >
              <SwipeCard item={currentItem} />
            </motion.div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold">No more items!</h3>
              <p className="text-gray-500">Check back later for new trades.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-8">
        <button onClick={() => currentItem && handleSwipe(currentItem, 'dislike')} className="bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
          <X size={32} className="text-red-500" />
        </button>
        <button onClick={handleChat} className="bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
          <MessageCircle size={32} className="text-blue-500" />
        </button>
        <button onClick={() => currentItem && handleSwipe(currentItem, 'like')} className="bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
          <Heart size={32} className="text-orange-500" />
        </button>
      </div>
    </div>
  );
};

export default SwipePage; 