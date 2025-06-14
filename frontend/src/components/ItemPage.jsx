import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const ItemPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "items", itemId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    };
    fetchItem();
  }, [itemId]);

  if (!item) return <p className="text-center mt-10">Indlæser...</p>;

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-4">{item.title}</h1>
      <img
        src={item.imageUrl || "/placeholder.jpg"}
        alt={item.title}
        className="w-full rounded-lg border mb-4"
      />

      <h2 className="text-lg font-bold mb-1">Beskrivelse</h2>
      <p className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 mb-6">
        {item.description}
      </p>

      <div className="flex items-center gap-3 p-3 rounded-xl shadow bg-white">
        <img
          src={item.userProfilePic || "/default-avatar.png"}
          alt={item.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold">{item.userName}</p>
          <p className="text-xs text-gray-500">Skriv til sælger her</p>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
