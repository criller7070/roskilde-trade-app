import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { usePopupContext } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import { validatePostImage } from "../utils/fileValidation";
import { checkRateLimit, checkBurstLimit } from "../utils/rateLimiter";
import { useTranslation } from "react-i18next";

export default function AddItem() {
  const { user } = useAuth();
  const { showError, showSuccess } = usePopupContext();
  const navigate = useNavigate();
  const { t } = useTranslation("addItem"); // Specify the 'addItem' namespace

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("bytte");
  const [isSubmitting, setIsSubmitting] = useState(false); // prevent duplicates
  const [fileValidation, setFileValidation] = useState({ isValid: true, message: "", error: "" });

  // Handle file selection with validation
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setImage(null);
      setFileValidation({ isValid: true, message: "", error: "" });
      return;
    }

    // Rate limit file uploads
    if (user) {
      const uploadRateCheck = checkRateLimit("uploadFile", user.uid);
      if (!uploadRateCheck.allowed) {
        showError(uploadRateCheck.message);
        e.target.value = ""; // Reset file input
        return;
      }
    }

    // Validate the file
    const validation = validatePostImage(selectedFile);
    setFileValidation(validation);

    if (validation.isValid) {
      setImage(selectedFile);
    } else {
      setImage(null);
      showError(validation.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check all required fields
    if (!title || !description || !image || !user) {
      showError(t("fillAllFields"));
      return;
    }

    // Check file validation
    if (!fileValidation.isValid) {
      showError(t("invalidImage"));
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Rate limiting checks
    const rateCheck = checkRateLimit("addItem", user.uid);
    if (!rateCheck.allowed) {
      showError(rateCheck.message);
      return;
    }

    const burstCheck = checkBurstLimit("addItem", user.uid);
    if (!burstCheck.allowed) {
      showError(burstCheck.message);
      return;
    }

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

      showSuccess(t("postCreated"));

      // Redirect to items page after successful creation
      setTimeout(() => {
        navigate("/items");
      }, 1500);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Error adding item:", err.code);
      }
      showError(t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-orange-500 mb-4">{t("newPost")}</h1>

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="border border-black rounded-lg p-4 mb-4 text-center">
          <label className={`cursor-pointer ${isSubmitting ? "opacity-50" : ""}`}>
            {image ? (
              <img src={URL.createObjectURL(image)} alt="preview" className="mx-auto max-h-48 object-cover" />
            ) : (
              <div className="text-gray-500 text-sm">
                <div className="text-4xl">☁️</div>
                {t("uploadImageHere")}
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isSubmitting}
            />
          </label>
        </div>

        {/* File Validation Feedback */}
        {image && (
          <div className="mb-4">
            {fileValidation.isValid ? (
              <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-2 rounded">
                <span>✅</span>
                <span>{fileValidation.message}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                <span>❌</span>
                <span>{fileValidation.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <label htmlFor="title" className="block font-semibold">{t("title")}</label>
        <input
          id="title"
          name="title"
          type="text"
          className="w-full mb-2 p-2 bg-gray-100 rounded"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= 60) {
              setTitle(e.target.value);
            }
          }}
          placeholder={t("titlePlaceholder")}
          disabled={isSubmitting}
          maxLength={60}
        />
        <div className={`text-right text-xs transition-colors duration-200 mb-4 ${
          title.length >= 54 ? "text-red-500 font-medium" :
          title.length >= 48 ? "text-orange-500" :
          title.length >= 36 ? "text-yellow-600" :
          "text-gray-500"
        }`}>
          {title.length}/60 {t("characters")}
        </div>

        {/* Description */}
        <label htmlFor="description" className="block font-semibold">{t("description")}</label>
        <textarea
          id="description"
          name="description"
          className="w-full mb-2 p-2 bg-gray-100 rounded"
          rows={4}
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setDescription(e.target.value);
            }
          }}
          placeholder={t("descriptionPlaceholder")}
          disabled={isSubmitting}
          maxLength={500}
        />
        <div className={`text-right text-xs transition-colors duration-200 mb-4 ${
          description.length >= 450 ? "text-red-500 font-medium" :
          description.length >= 400 ? "text-orange-500" :
          description.length >= 300 ? "text-yellow-600" :
          "text-gray-500"
        }`}>
          {description.length}/500 {t("characters")}
        </div>

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
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t(option.toLowerCase())}
            </button>
          ))}
        </div>

        {/* Post Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-bold py-3 rounded-xl transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          } text-white`}
        >
          {isSubmitting ? t("creatingPost") : t("postButton")}
        </button>
      </form>
    </div>
  );
}