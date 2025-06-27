import { useState } from "react";
import { auth, signInWithGoogle } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { usePopupContext } from "../contexts/PopupContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { showSuccess, showError } = usePopupContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Logget ind!");
      navigate("/profile");
    } catch (error) {
      // Handle Firebase auth errors with clean messages
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Ugyldig email-adresse. Tjek venligst din email.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Forkert email eller adgangskode. Prøv igen.";
          break;
        case 'auth/user-not-found':
          errorMessage = "Ingen bruger fundet med denne email. Opret venligst en konto.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Forkert adgangskode. Prøv igen.";
          break;
        case 'auth/user-disabled':
          errorMessage = "Denne konto er deaktiveret. Kontakt support.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "For mange forsøg. Prøv igen senere.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Netværksfejl. Tjek din internetforbindelse.";
          break;
        default:
          errorMessage = "Login fejlede. Prøv igen.";
      }
      showError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.isNewUser) {
        // New user must go through signup with consent
        showError("Du skal først oprette en konto. Du bliver omdirigeret til oprettelsessiden.");
        navigate("/signup");
        return;
      }
      
      // Check if existing user has given GDPR consent
      if (!result.userDoc?.gdprConsent) {
        showError("Du mangler at acceptere vilkårene. Du bliver omdirigeret til oprettelsessiden.");
        navigate("/signup");
        return;
      }
      
      showSuccess("Logget ind!");
      navigate("/profile");
    } catch (error) {
      // Handle Google login errors with clean messages
      let errorMessage;
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = "Popup blev blokeret. Tillad popups og prøv igen.";
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = "Login blev annulleret.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Netværksfejl. Tjek din internetforbindelse.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "For mange forsøg. Prøv igen senere.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Google login er ikke aktiveret.";
          break;
        default:
          errorMessage = "Google login fejlede. Prøv igen.";
      }
      showError(errorMessage);
    }
  };

  return (
    <div className="pt-20 px-6 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">Log Ind</h1>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg"
        >
          Log Ind
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">eller</p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border text-orange-500 font-semibold py-2 rounded-lg shadow hover:bg-orange-50"
          >
            Log ind med Google
          </button>

          <p className="text-sm text-gray-500 mt-6">Har du ikke en konto?</p>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-2 text-orange-500 font-semibold hover:underline"
            >
              Opret en konto
            </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
