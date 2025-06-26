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
      showError("Fejl: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/profile");
    } catch (error) {
      showError("Fejl: " + error.message);
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
