import React, { useState } from "react";
import { db, auth /*, storage */ } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddItem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("bytte");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
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
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
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

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-orange-500 mb-4">Ny Post</h1>

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="border border-black rounded-lg p-4 mb-4 text-center">
          <label className="cursor-pointer">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="preview" className="mx-auto max-h-48 object-cover" />
            ) : (
              <div className="text-gray-500 text-sm">
                <div className="text-4xl">☁️</div>
                Upload dit billede her
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {/* Title */}
        <label htmlFor="title" className="block font-semibold">Overskrift</label>
        <input
          id="title"
          name="title"
          type="text"
          className="w-full mb-4 p-2 bg-gray-100 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="*****"
        />

        {/* Description */}
        <label htmlFor="description" className="block font-semibold">Beskrivelse</label>
        <textarea
          id="description"
          name="description"
          className="w-full mb-4 p-2 bg-gray-100 rounded"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="*****"
        />

        {/* Toggle Mode */}
        <div className="flex justify-between items-center mb-6">
          {["Bytte", "Sælge"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option.toLowerCase())}
              className={`flex-1 mx-2 py-2 rounded-full ${
                mode === option.toLowerCase()
                  ? "bg-orange-400 text-white font-bold"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Post Button */}
        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl">
          POST
        </button>
      </form>
    </div>
  );
}