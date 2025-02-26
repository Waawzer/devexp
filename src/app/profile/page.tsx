"use client"; // Nécessaire pour utiliser des hooks client comme useAuth

import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-8">Veuillez vous connecter pour voir votre profil.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Profil de {user.username}</h1>
      <p>Email : {user.email}</p>
      {/* Ajoutez d'autres informations si nécessaires */}
    </div>
  );
}