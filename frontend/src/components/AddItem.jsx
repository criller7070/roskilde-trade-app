import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddItem() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("bytte");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image || !user) {
      alert("Udfyld alle felter og vælg et billede.");
      return;
    }

    try {
      // // OPTIONAL: Upload image to Firebase Storage
      // const imageRef = ref(storage, `posts/${Date.now()}-${image.name}`);
      // const snapshot = await uploadBytes(imageRef, image);
      // const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "posts"), {
        title,
        description,
        mode,
        // imageUrl,
        userId: user.uid,
        userName: user.displayName,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setImage(null);
      setMode("bytte");

      alert("Posten er oprettet!");
    } catch (err) {
      console.error(err);
      alert("Noget gik galt. Prøv igen.");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <p className="text-center text-gray-600">Please log in to add items.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-orange-500 mb-4">Ny Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            placeholder="Indtast titel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 h-32"
            placeholder="Beskriv din vare..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billede</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          >
            <option value="bytte">Bytte</option>
            <option value="salg">Salg</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Opret Post
        </button>
      </form>
    </div>
  );
}