import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AddItem = () => {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !description || !category) return;

    try {
      await addDoc(collection(db, "items"), {
        name: itemName,
        description,
        category,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
        timestamp: serverTimestamp(),
      });

      // Clear the form after submission
      setItemName("");
      setDescription("");
      setCategory("");
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add an Item for Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Item Name"
          className="w-full p-2 border rounded"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="text"
          placeholder="Category (e.g., Food, Camping Gear, Clothing)"
          className="w-full p-2 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600">
          Add Item
        </button>
      </form>
    </div>
  );
};

export default AddItem;
