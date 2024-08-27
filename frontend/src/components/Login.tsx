import React, { useState, useRef, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  Auth,
} from "firebase/auth";

interface LoginProps {
  auth: Auth;
  isOpen: boolean;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ auth, isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setLoginError(null);
      onClose();
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setLoginError("Failed to log in with Google. Please try again.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(null);
      onClose();
    } catch (error) {
      console.error("Error logging in with email:", error);
      setLoginError("Failed to log in. Please check your credentials.");
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setLoginError(null);
      onClose();
    } catch (error) {
      console.error("Error registering with email:", error);
      setLoginError("Failed to register. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    onClose();
    setLoginError(null);
  };

  return (
    <dialog
      ref={dialogRef}
      className="p-6 rounded-lg shadow-xl backdrop:bg-gray-800 backdrop:bg-opacity-50"
    >
      <h2 className="text-2xl font-bold mb-4">
        {isRegistering ? "Register" : "Login"}
      </h2>
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-md shadow flex items-center justify-center transition duration-150 ease-in-out mb-4"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
      <form
        onSubmit={isRegistering ? handleEmailRegister : handleEmailLogin}
        className="space-y-4"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
        >
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="mt-4 text-indigo-600 hover:text-indigo-800"
      >
        {isRegistering ? "Switch to Login" : "Switch to Register"}
      </button>
      {loginError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{loginError}</span>
        </div>
      )}
      <button
        onClick={handleCloseDialog}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </dialog>
  );
};

export default Login;
