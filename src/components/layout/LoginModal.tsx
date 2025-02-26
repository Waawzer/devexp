"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Importer useRouter
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialiser le routeur

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password); // Appeler la fonction login du contexte
      setEmail("");
      setPassword("");
      onClose(); // Fermer le modal
      router.push("/profile"); // Rediriger vers la page de profil
    } catch (err) {
      setError("Erreur de connexion");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl mb-4">Connexion</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
            Se connecter
          </button>
        </form>
        <button onClick={onClose} className="mt-4 text-blue-500">
          Fermer
        </button>
      </div>
    </div>
  );
}