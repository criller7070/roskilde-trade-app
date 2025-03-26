import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Chat from "./Chat";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Available Items</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transition transform hover:scale-105 hover:shadow-xl duration-300"
            >
              <img
                src={item.imageUrl || "https://via.placeholder.com/400"}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                <span className="text-sm text-gray-500 mt-2 block">Category: {item.category}</span>
                <p className="text-sm text-gray-500 mt-2">Posted by: {item.userName}</p>
                {item.userId !== auth.currentUser?.uid && (
                  <button
                    onClick={() => setSelectedChat({ recipientId: item.userId, recipientName: item.userName })}
                    className="mt-4 w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Message {item.userName}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No items available yet.</p>
        )}
      </div>
      {selectedChat && <Chat recipientId={selectedChat.recipientId} recipientName={selectedChat.recipientName} />}
    </div>
  );
};

export default ItemList;
