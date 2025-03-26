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
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Available Items</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-gray-700">{item.description}</p>
              <span className="text-sm text-gray-500">Category: {item.category}</span>
              <p className="text-sm text-gray-600 mt-2">Posted by: {item.userName}</p>
              {item.userId !== auth.currentUser?.uid && (
                <button
                  onClick={() =>
                    setSelectedChat({
                      recipientId: item.userId,
                      recipientName: item.userName,
                      itemId: item.id, // ✅ Include itemId
                    })
                  }
                  className="mt-2 p-2 bg-blue-500 text-white rounded"
                >
                  Message {item.userName}
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No items available yet.</p>
        )}
      </div>
      {selectedChat && (
        <Chat
          recipientId={selectedChat.recipientId}
          recipientName={selectedChat.recipientName}
          itemId={selectedChat.itemId} // ✅ Pass itemId to Chat
        />
      )}
    </div>
  );
};

export default ItemList;
