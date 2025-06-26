import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const BugReport = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = usePopupContext();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      showError("Beskriv venligst fejlen du oplevede.");
      return;
    }

    if (!user) {
      showError("Du skal være logget ind for at rapportere en fejl.");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Auto-capture user agent and current page
      const userAgent = navigator.userAgent;
      const currentUrl = window.location.href;

      let imageUrl = null;

      // Upload image if provided
      if (image) {
        const imageRef = ref(storage, `bug-reports/${Date.now()}-${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create bug report document
      await addDoc(collection(db, "bugReports"), {
        description: description.trim(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Anonymous",
        userAgent,
        url: currentUrl,
        imageUrl,
        status: "open",
        createdAt: serverTimestamp(),
      });

      // Reset form
      setDescription("");
      setImage(null);
      
      showSuccess("Fejlrapport indsendt! Tak for at hjælpe os med at forbedre RosSwap.");
      
      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting bug report:", error);
      showError("Kunne ikke indsende fejlrapport. Prøv igen senere.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-orange-500 mb-4">
        Rapportér en Fejl
      </h1>
      
      <p className="text-gray-600 text-sm mb-6 text-center">
        Hjælp os med at forbedre RosSwap ved at rapportere problemer du støder på. Vi sætter pris på din feedback!
      </p>

      <form onSubmit={handleSubmit}>
        {/* Description */}
        <label htmlFor="description" className="block font-semibold mb-2">
          Beskriv problemet *
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full mb-4 p-3 bg-gray-100 rounded-lg resize-none"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beskriv venligst hvad der gik galt, hvad du forventede skulle ske, og trin til at genskabe problemet..."
          disabled={isSubmitting}
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 mb-4 text-right">
          {description.length}/1000 tegn
        </div>

        {/* Optional Image Upload */}
        <div className="border border-gray-300 rounded-lg p-4 mb-6 text-center">
          <label className={`cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}>
            {image ? (
              <div>
                <img 
                  src={URL.createObjectURL(image)} 
                  alt="Bug screenshot" 
                  className="mx-auto max-h-48 object-cover rounded mb-2" 
                />
                <p className="text-sm text-gray-600">
                  Skærmbillede vedhæftet. Klik for at ændre.
                </p>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                <div className="text-4xl mb-2">📷</div>
                <p>Valgfrit: Upload et skærmbillede</p>
                <p className="text-xs mt-1">Klik her for at tilføje et billede</p>
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
          {image && (
            <button
              type="button"
              onClick={() => setImage(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-700"
              disabled={isSubmitting}
            >
              Fjern billede
            </button>
          )}
        </div>

        {/* Auto-captured info display */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs text-gray-600">
          <p className="font-semibold mb-1">Automatisk inkluderet:</p>
          <p>• Din konto: {user?.displayName || user?.email || "Anonym"}</p>
          <p>• Browser: {navigator.userAgent.split(' ').slice(-2).join(' ')}</p>
          <p>• Tidsstempel: {new Date().toLocaleString('da-DK')}</p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting || !description.trim()}
          className={`w-full font-bold py-3 rounded-xl transition-colors ${
            isSubmitting || !description.trim()
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
        >
          {isSubmitting ? 'Indsender...' : 'Indsend Fejlrapport'}
        </button>
      </form>
    </div>
  );
};

export default BugReport; 