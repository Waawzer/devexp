"use client";

import { useState } from "react";
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // Connexion
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        onClose();
      } else {
        alert("Erreur de connexion");
      }
    } else {
      // Inscription
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (res.ok) {
          // Connexion automatique après inscription
          await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          onClose();
        } else {
          const data = await res.json();
          alert(data.error);
        }
      } catch (error) {
        alert("Erreur lors de l'inscription");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        className="bg-white rounded-lg p-8 max-w-md w-full relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isLogin ? "Connexion" : "Inscription"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <FcGoogle className="w-5 h-5" />
            Continuer avec Google
          </button>

          <button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <FaGithub className="w-5 h-5" />
            Continuer avec GitHub
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded text-gray-900"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-blue-500 text-sm mt-4"
          >
            {isLogin ? "Créer un compte" : "Déjà inscrit ?"}
          </button>
        </div>
      </div>

      {/* Overlay pour fermer le modal en cliquant en dehors */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    </div>
  );
} 