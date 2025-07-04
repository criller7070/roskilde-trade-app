import { useState } from "react";
import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { usePopupContext } from "../contexts/PopupContext";
import { useTranslation } from "react-i18next";

const EmailVerificationBanner = ({ user }) => {
  const { t } = useTranslation("emailVerificationBanner");
  const [isResending, setIsResending] = useState(false);
  const { showSuccess, showError } = usePopupContext();

  // Don't show banner if user is verified or no user
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      showSuccess("Bekræftelses-email sendt! Tjek din indbakke.");
    } catch (error) {
      console.error("Error sending verification email:", error);
      if (error.code === 'auth/too-many-requests') {
        showError("For mange forsøg. Vent et øjeblik før du prøver igen.");
      } else {
        showError("Kunne ikke sende bekræftelses-email. Prøv igen senere.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = () => {
    // Reload the user to get updated email verification status
    user.reload().then(() => {
      if (user.emailVerified) {
        showSuccess("Email-adresse bekræftet!");
        // This will trigger a re-render and hide the banner
        window.location.reload();
      } else {
        showError("Email-adresse er stadig ikke bekræftet. Tjek din indbakke.");
      }
    });
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mx-6 mt-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            {t("verifyEmailTitle")}
          </h3>
          <p className="text-sm text-orange-700 mt-1">
            {t("verifyEmailDescription", { email: user.email })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600 disabled:bg-orange-300"
            >
              {isResending ? t("resendingButton") : t("resendButton")}
            </button>
            <button
              onClick={handleRefreshStatus}
              className="text-sm bg-white border border-orange-300 text-orange-700 px-3 py-1.5 rounded hover:bg-orange-50"
            >
              {t("refreshButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;