import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, signInWithGoogle, createGoogleUser } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { usePopupContext } from "../contexts/PopupContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [hasConsented, setHasConsented] = useState(false);
  const { showSuccess, showError } = usePopupContext();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!hasConsented) {
      showError("Du skal acceptere vilkårene og privatlivspolitikken for at oprette en konto.");
      return;
    }
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: new Date(),
        consentedAt: new Date(), // GDPR compliance
        gdprConsent: true
      });

      showSuccess("Bruger oprettet!");
      navigate("/profile");
    } catch (error) {
      // Check if email is already in use
      if (error.code === 'auth/email-already-in-use') {
        try {
          // Try to sign them in with the provided credentials
          await signInWithEmailAndPassword(auth, email, password);
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
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Opret Konto</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Navn"
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                setName(e.target.value);
              }
            }}
            className="w-full p-3 rounded-lg bg-gray-100 mb-1"
            maxLength={50}
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
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-100"
        />
        <input
          type="password"
          placeholder="Adgangskode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-100"
        />
        
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
          <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
            Jeg accepterer <a href="/terms" target="_blank" className="text-orange-500 underline">vilkårene</a> og{' '}
            <a href="/privacy" target="_blank" className="text-orange-500 underline">privatlivspolitikken</a>.
            Ved at oprette en konto samtykker jeg til behandling af mine personoplysninger som beskrevet i privatlivspolitikken.
          </label>
        </div>
        
        <button
          type="submit"
          disabled={!hasConsented}
          className={`w-full py-3 rounded-lg font-bold text-lg ${
            hasConsented 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Opret
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">eller</p>
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
            Opret med Google
          </button>
          {!hasConsented && (
            <p className="text-xs text-gray-500 mt-2">
              Du skal acceptere vilkårene før du kan oprette en konto
            </p>
          )}
        </div>

      </form>
    </div>
  );
};

export default Signup;
