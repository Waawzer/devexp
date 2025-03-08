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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full relative z-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec effet de gradient */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-10 rounded-lg"></div>
          <div className="relative flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isLogin ? "Connexion" : "Inscription"}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Boutons de connexion sociale */}
          <div className="space-y-3">
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 
                       text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 
                       transform transition-all duration-200 hover:-translate-y-0.5"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="font-medium">Continuer avec Google</span>
            </button>

            <button
              onClick={() => signIn("github")}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white 
                       px-4 py-3 rounded-xl hover:bg-gray-800 transform transition-all 
                       duration-200 hover:-translate-y-0.5"
            >
              <FaGithub className="w-5 h-5" />
              <span className="font-medium">Continuer avec GitHub</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 
                           focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl
                       font-medium hover:from-blue-600 hover:to-indigo-600 transform transition-all 
                       duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-200"
            >
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-blue-500 text-sm hover:text-blue-600 transition-colors"
          >
            {isLogin ? "Créer un compte" : "Déjà inscrit ?"}
          </button>
        </div>
      </div>

      {/* Overlay pour fermer le modal */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    </div>
  );
} 