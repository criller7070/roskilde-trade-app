import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { usePopupContext } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const { user } = useAuth();
  const { showError, showSuccess } = usePopupContext();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("bytte");
  const [isSubmitting, setIsSubmitting] = useState(false); // prevent duplicates

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image || !user) {
      showError("Udfyld alle felter og vælg et billede.");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `posts/${Date.now()}-${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "items"), {
        title,
        description,
        mode,
        imageUrl,
        userId: user.uid,
        userName: user.displayName,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setImage(null);
      setMode("bytte");

      showSuccess("Opslaget er oprettet!");
      
      // Redirect to items page after successful creation
      setTimeout(() => {
        navigate("/items");
      }, 1500);
    } catch (err) {
      console.error(err);
      showError("Noget gik galt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-orange-500 mb-4">Nyt Opslag</h1>

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="border border-black rounded-lg p-4 mb-4 text-center">
          <label className={`cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}>
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
              disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />

        {/* Toggle Mode */}
        <div className="flex justify-between items-center mb-6">
          {["Bytte", "Sælge"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option.toLowerCase())}
              disabled={isSubmitting}
              className={`flex-1 mx-2 py-2 rounded-full ${
                mode === option.toLowerCase()
                  ? "bg-orange-400 text-white font-bold"
                  : "bg-gray-200 text-gray-700"
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Post Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full font-bold py-3 rounded-xl transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
        >
          {isSubmitting ? 'Opretter...' : 'POST'}
        </button>
      </form>
    </div>
  );
}