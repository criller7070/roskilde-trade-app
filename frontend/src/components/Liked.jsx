import { useEffect, useState } from "react";
import { useItems } from "../contexts/ItemsContext";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Repeat2, DollarSign, X, MessageCircle, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Liked = () => {
  const { getLikedItemIds, unlikeItem, likeItem } = useItems();
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiked = async () => {
      const likedItemIds = await getLikedItemIds();
      setLikedIds(likedItemIds);
      
      if (!likedItemIds.length) return;

      const chunked = likedItemIds.slice(0, 10); // Firestore allows max 10 ids in "in" query
      const q = query(collection(db, "items"), where("__name__", "in", chunked));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLikedPosts(items);
    };

    fetchLiked();
  }, [getLikedItemIds]);

  const toggleLike = async (itemId) => {
    if (likedIds.includes(itemId)) {
      await unlikeItem(itemId);
      setLikedIds(likedIds.filter((id) => id !== itemId));
      // Remove from local display
      setLikedPosts(likedPosts.filter((post) => post.id !== itemId));
    } else {
      await likeItem(itemId);
      setLikedIds([...likedIds, itemId]);
    }
  };

  return (
    <div className="pt-12 px-4 pb-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Liked Opslag</h1>

      {likedPosts.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Du har ikke liked nogen opslag endnu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {likedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              {/* Like button - positioned like in ItemList */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="bg-white p-2 rounded-full shadow hover:bg-orange-100 transition"
                >
                  {likedIds.includes(post.id) ? (
                    <Heart className="text-orange-500 fill-orange-500" size={20} />
                  ) : (
                    <Heart className="text-gray-400" size={20} />
                  )}
                </button>
              </div>
              
              {/* Main content area */}
              <Link to={`/item/${post.id}`} className="block">
                <div className="flex gap-4 mb-4">
                  <LoadingPlaceholder
                    src={post.imageUrl || "/placeholder.jpg"}
                    alt={post.name}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    placeholderClassName="rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-gray-900 flex-1 pr-2">{post.title}</h3>
                      {post.mode === "bytte" ? (
                        <Repeat2 className="text-gray-600 mr-10 mt-2 flex-shrink-0" size={18} />
                      ) : (
                        <DollarSign className="text-gray-600 mr-10 mt-2 flex-shrink-0" size={18} />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{post.userName}</p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{post.description}</p>
                  </div>
                </div>
              </Link>

              {/* Message button - full width for easy tapping */}
              <button
                onClick={() => navigate(`/item/${post.id}`)}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                Message {post.userName}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Button to see disliked posts */}
      <div className="mt-8 text-center">
        <Link 
          to="/disliked" 
          className="inline-flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          <X size={18} />
          Se Disliked Opslag
        </Link>
      </div>
    </div>
  );
};

export default Liked;
