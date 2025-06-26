import { useEffect, useState } from "react";
import { useItems } from "../contexts/ItemsContext";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Repeat2, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Liked = () => {
  const { getLikedItemIds } = useItems();
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const fetchLiked = async () => {
      const likedItemIds = await getLikedItemIds();
      if (!likedItemIds.length) return;

      const chunked = likedItemIds.slice(0, 10); // Firestore allows max 10 ids in "in" query
      const q = query(collection(db, "items"), where("__name__", "in", chunked));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLikedPosts(items);
    };

    fetchLiked();
  }, [getLikedItemIds]);

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Liked</h1>

      <div className="space-y-4">
        {likedPosts.map((post) => (
            <Link to={`/item/${post.id}`} key={post.id}>
                <div className="flex bg-gray-100 rounded-xl p-3 items-center shadow-sm hover:bg-orange-50 transition">
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
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default Liked;
