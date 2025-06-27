import { useEffect, useState } from "react";
import { useItems } from "../contexts/ItemsContext";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Repeat2, DollarSign, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Disliked = () => {
  const { getDislikedItemIds, undislikeItem, likeItem } = useItems();
  const [dislikedPosts, setDislikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisliked = async () => {
    setLoading(true);
    const dislikedItemIds = await getDislikedItemIds();
    if (!dislikedItemIds.length) {
      setLoading(false);
      return;
    }

    const chunked = dislikedItemIds.slice(0, 10); // Firestore allows max 10 ids in "in" query
    const q = query(collection(db, "items"), where("__name__", "in", chunked));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDislikedPosts(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchDisliked();
  }, [getDislikedItemIds]);

  const handleUndislike = async (itemId) => {
    await undislikeItem(itemId);
    // Refresh the list
    fetchDisliked();
  };

  const handleLike = async (itemId) => {
    await undislikeItem(itemId); // Remove from disliked
    await likeItem(itemId); // Add to liked
    // Refresh the list
    fetchDisliked();
  };

  if (loading) {
    return (
      <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Disliked Opslag</h1>
        <div className="text-center text-gray-500">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-2">Disliked</h1>
      <p className="text-gray-600 text-center mb-6 text-sm px-2">Har du disliked et opslag ved en fejl? Like det igen her!</p>

      {dislikedPosts.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Du har ikke disliked nogen opslag endnu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dislikedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
                      <h3 className="text-base font-bold text-gray-900 flex-1">{post.title}</h3>
                      {post.mode === "bytte" ? (
                        <Repeat2 className="text-gray-600 ml-2 flex-shrink-0" size={18} />
                      ) : (
                        <DollarSign className="text-gray-600 ml-2 flex-shrink-0" size={18} />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{post.userName}</p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{post.description}</p>
                  </div>
                </div>
              </Link>

              {/* Action button - full width for easy tapping */}
              <button
                onClick={() => handleLike(post.id)}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Heart size={16} />
                Like igen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Disliked; 