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
      <p className="text-gray-600 text-center mb-6">Har du disliked et opslag ved en fejl? Like det igen her!</p>

      {dislikedPosts.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Du har ikke disliked nogen opslag endnu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dislikedPosts.map((post) => (
            <div key={post.id} className="flex bg-gray-100 rounded-xl p-3 items-center shadow-sm">
              <Link to={`/item/${post.id}`} className="flex flex-1 items-center">
                <LoadingPlaceholder
                  src={post.imageUrl || "/placeholder.jpg"}
                  alt={post.name}
                  className="w-20 h-20 rounded-md object-cover mr-3"
                  placeholderClassName="rounded-md"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="bg-orange-500 text-black px-2 py-1 text-sm font-bold rounded-md max-w-[10rem] truncate">
                      {post.title}
                    </span>
                    {post.mode === "bytte" ? (
                      <Repeat2 className="text-gray-700" size={18} />
                    ) : (
                      <DollarSign className="text-gray-700" size={18} />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{post.userName}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-tight">{post.description}</p>
                </div>
              </Link>
              
              <div className="flex ml-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className="bg-orange-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Heart size={14} />
                  Like
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Disliked; 