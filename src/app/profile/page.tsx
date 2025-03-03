"use client"; // Nécessaire pour utiliser des hooks client comme useAuth

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || ''
      });
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isEditing ? "Annuler" : "Modifier"}
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt="Photo de profil"
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-2xl">?</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{session.user.name}</h2>
            <p className="text-gray-600">{session.user.email}</p>
          </div>
        </div>

        {isEditing ? (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
              <p className="mt-1 text-sm text-gray-500">L'email ne peut pas être modifié</p>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Enregistrer
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Informations du compte</h3>
              <p className="text-gray-600">Membre depuis: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}