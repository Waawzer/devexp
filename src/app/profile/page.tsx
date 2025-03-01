"use client"; // Nécessaire pour utiliser des hooks client comme useAuth

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    description: user?.description || ''
  });

  if (!user) {
    return <div className="text-center py-8">Veuillez vous connecter pour voir votre profil.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Profil de {user.username}</h1>
              <button
                onClick={() => {
                  setFormData({
                    username: user.username,
                    description: user.description || ''
                  });
                  setIsEditing(true);
                }}
                className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
              >
                Éditer
              </button>
            </div>
            <p className="text-gray-600 mb-4">{user.description || 'Aucune description'}</p>
            <p className="text-gray-600">Email : {user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}