import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { checkRateLimit } from "../utils/rateLimiter";
import { useTranslation } from "react-i18next";

const BugReport = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = usePopupContext();
  const navigate = useNavigate();
  const { t } = useTranslation("bugReport"); // Specify the 'bugReport' namespace

  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      showError(t("describeError"));
      return;
    }

    if (!user) {
      showError(t("loginToReportBug"));
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Rate limit bug reports
    const rateCheck = checkRateLimit("bugReport", user.uid);
    if (!rateCheck.allowed) {
      showError(rateCheck.message);
      return;
    }

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
        userName: user.displayName || t("anonymous"),
        userAgent,
        url: currentUrl,
        imageUrl,
        status: "open",
        createdAt: serverTimestamp(),
      });

      // Reset form
      setDescription("");
      setImage(null);

      showSuccess(t("bugReportSubmitted"));

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(t("errorSubmittingBugReport"), error.code);
      }
      showError(t("errorSubmittingBugReport"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-orange-500 mb-4">
        {t("reportBug")}
      </h1>

      <p className="text-gray-600 text-sm mb-6 text-center">
        {t("helpImproveApp")}
      </p>

      <form onSubmit={handleSubmit}>
        {/* Description */}
        <label htmlFor="description" className="block font-semibold mb-2">
          {t("describeProblem")} *
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full mb-4 p-3 bg-gray-100 rounded-lg resize-none"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("describeProblemPlaceholder")}
          disabled={isSubmitting}
          maxLength={1000}
        />
        <div
          className={`text-xs transition-colors duration-200 mb-4 text-right ${
            description.length >= 900
              ? "text-red-500 font-medium"
              : description.length >= 800
              ? "text-orange-500"
              : description.length >= 600
              ? "text-yellow-600"
              : "text-gray-500"
          }`}
        >
          {description.length}/1000 {t("characters")}
        </div>

        {/* Optional Image Upload */}
        <div className="border border-gray-300 rounded-lg p-4 mb-6 text-center">
          <label className={`cursor-pointer ${isSubmitting ? "opacity-50" : ""}`}>
            {image ? (
              <div>
                <img
                  src={URL.createObjectURL(image)}
                  alt={t("bugScreenshotAlt")}
                  className="mx-auto max-h-48 object-cover rounded mb-2"
                />
                <p className="text-sm text-gray-600">{t("screenshotAttached")}</p>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                <div className="text-4xl mb-2">📷</div>
                <p>{t("optionalUploadScreenshot")}</p>
                <p className="text-xs mt-1">{t("clickToAddImage")}</p>
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
              {t("removeImage")}
            </button>
          )}
        </div>

        {/* Auto-captured info display */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs text-gray-600">
          <p className="font-semibold mb-1">{t("autoIncludedInfo")}</p>
          <p>• {t("accountInfo")}: {user?.displayName || user?.email || t("anonymous")}</p>
          <p>• {t("browserInfo")}: {navigator.userAgent.split(" ").slice(-2).join(" ")}</p>
          <p>• {t("timestampInfo")}: {new Date().toLocaleString("da-DK")}</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className={`w-full font-bold py-3 rounded-xl transition-colors ${
            isSubmitting || !description.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          } text-white`}
        >
          {isSubmitting ? t("submitting") : t("submitBugReport")}
        </button>
      </form>
    </div>
  );
};

export default BugReport;