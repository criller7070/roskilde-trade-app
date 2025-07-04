import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, signInWithGoogle, createGoogleUser } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { usePopupContext } from "../contexts/PopupContext";
import { validateEmail, isValidEmail } from "../utils/emailValidation";
import { useTranslation } from "react-i18next"; // Add this import

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [hasConsented, setHasConsented] = useState(false);
  const { showSuccess, showError } = usePopupContext();
  const navigate = useNavigate();
  const { t } = useTranslation("signup"); // Initialize translation hook

  // Form validation function
  const validateForm = () => {
    // Check if name is provided
    if (!name.trim()) {
      showError("Du skal indtaste dit navn for at oprette en konto.");
      return false;
    }

    // Check if name is too short
    if (name.trim().length < 2) {
      showError("Dit navn skal være mindst 2 tegn langt.");
      return false;
    }

    // Check if email is provided
    if (!email.trim()) {
      showError("Du skal indtaste en email-adresse for at oprette en konto.");
      return false;
    }

    // Comprehensive email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      showError(emailValidation.message);
      return false;
    }

    // Check if password is provided
    if (!password) {
      showError("Du skal indtaste en adgangskode for at oprette en konto.");
      return false;
    }

    // Check if password is strong enough
    if (password.length < 6) {
      showError("Din adgangskode skal være mindst 6 tegn lang.");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!hasConsented) {
      showError("Du skal acceptere vilkårene og privatlivspolitikken for at oprette en konto.");
      return;
    }

    // Validate form before attempting registration
    if (!validateForm()) {
      return;
    }
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCred.user;

      await updateProfile(user, { displayName: name.trim() });

      // Send email verification
      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date(),
        consentedAt: new Date(), // GDPR compliance
        gdprConsent: true,
        emailVerified: false // Track verification status
      });

      showSuccess("Konto oprettet! Tjek din email for at bekræfte din adresse.");
      navigate("/profile");
    } catch (error) {
      // Check if email is already in use
      if (error.code === 'auth/email-already-in-use') {
        try {
          // Try to sign them in with the provided credentials
          await signInWithEmailAndPassword(auth, email.trim(), password);
          showSuccess("Du har allerede en konto. Logger ind i stedet...");
          navigate("/profile");
                 } catch (loginError) {
           // Login failed, handle with clean messages
           if (loginError.code === 'auth/wrong-password' || loginError.code === 'auth/invalid-credential') {
             showError("Denne email er allerede registreret. Skift over til Log Ind siden og indtast den korrekte adgangskode.");
           } else if (loginError.code === 'auth/too-many-requests') {
             showError("For mange login-forsøg. Vent et øjeblik og prøv igen.");
           } else if (loginError.code === 'auth/user-disabled') {
             showError("Denne konto er deaktiveret. Kontakt support.");
           } else {
             showError("Denne email er allerede registreret. Skift over til Log Ind siden.");
           }
         }
      } else {
        // Handle other Firebase auth errors with clean messages
        let errorMessage;
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = "Ugyldig email-adresse. Tjek venligst din email.";
            break;
          case 'auth/invalid-credential':
            errorMessage = "Ugyldige oplysninger. Tjek venligst din email og adgangskode.";
            break;
          case 'auth/weak-password':
            errorMessage = "Adgangskoden er for svag. Brug mindst 6 tegn.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/adgangskode login er ikke aktiveret.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "For mange forsøg. Prøv igen senere.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Netværksfejl. Tjek din internetforbindelse.";
            break;
          default:
            errorMessage = "Der opstod en fejl. Prøv igen.";
        }
        showError(errorMessage);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasConsented) {
      showError("Du skal acceptere vilkårene og privatlivspolitikken for at oprette en konto.");
      return;
    }

    try {
      const result = await signInWithGoogle();
      
      if (result.isNewUser) {
        // Create new user with consent
        await createGoogleUser(result.user, true);
        showSuccess("Konto oprettet med Google!");
      } else {
        // Existing user - just log them in
        showSuccess("Du har allerede en konto. Logger ind i stedet...");
      }
      
      navigate("/profile");
    } catch (error) {
      showError("Fejl ved Google signup: " + error.message);
    }
  };

  return (
    <div className="pt-20 px-6 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">{t("signupTitle")}</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                setName(e.target.value);
              }
            }}
            className={`w-full p-3 rounded-lg mb-1 ${
              name.trim() === '' && name !== '' ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
            }`}
            maxLength={50}
            required
          />
          <div className={`text-right text-xs transition-colors duration-200 mb-2 ${
            name.length >= 45 ? 'text-red-500 font-medium' :
            name.length >= 40 ? 'text-orange-500' :
            name.length >= 30 ? 'text-yellow-600' :
            'text-gray-500'
          }`}>
            {name.length}/50 tegn
          </div>
        </div>
        
        <div>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-lg ${
              email && !isValidEmail(email) ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
            }`}
            required
          />
          {email && !isValidEmail(email) && (
            <div className="text-red-500 text-xs mt-1">
              {validateEmail(email).message}
            </div>
          )}
        </div>
        
        <div>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-lg ${
              password && password.length < 6 ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
            }`}
            required
          />
          {password && password.length < 6 && (
            <div className="text-red-500 text-xs mt-1">
              {t("passwordTooShort")}
            </div>
          )}
        </div>
        
        {/* GDPR Consent Checkbox */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="consent"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className="mt-1 w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            required
          />
          <label
            htmlFor="consent"
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: t("gdprConsentText", {
                termsLink: `<a href="/terms" target="_blank" style="color: #F97316; text-decoration: underline;">${t("termsLinkText")}</a>`,
                privacyLink: `<a href="/privacy" target="_blank" style="color: #F97316; text-decoration: underline;">${t("privacyLinkText")}</a>`,
              }),
            }}
          ></label>
        </div>
        
        <div className="text-xs text-gray-500 text-center mb-2">
          {t("requiredFields")}
        </div>
        
        <button
          type="submit"
          disabled={!hasConsented || !name.trim() || !email.trim() || !isValidEmail(email) || !password || password.length < 6}
          className={`w-full py-3 rounded-lg font-bold text-lg ${
            hasConsented && name.trim() && email.trim() && isValidEmail(email) && password && password.length >= 6
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t("signupButton")}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">{t("or")}</p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!hasConsented}
            className={`w-full border font-semibold py-2 rounded-lg shadow ${
              hasConsented
                ? 'bg-white text-orange-500 hover:bg-orange-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
            }`}
          >
            {t("googleSignupButton")}
          </button>
          {!hasConsented && (
            <p className="text-xs text-gray-500 mt-2">
              {t("consentRequired")}
            </p>
          )}
        </div>

      </form>
    </div>
  );
};

export default Signup;
