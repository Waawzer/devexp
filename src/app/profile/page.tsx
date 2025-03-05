"use client"; // Nécessaire pour utiliser des hooks client comme useAuth

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    description: '',
    skills: [] as string[],
    favoriteTechnologies: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newFavTech, setNewFavTech] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const userData = await response.json();
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              image: userData.image || '',
              description: userData.description || '',
              skills: userData.skills || [],
              favoriteTechnologies: userData.favoriteTechnologies || [],
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const updatedUser = await response.json();
      setIsEditing(false);
      
      // Forcer la mise à jour de la session avec les nouvelles données
      await update({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser,
        },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

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
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/profile/${session.user.id}`)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
              title="Voir mon profil public"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Voir profil public</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {isEditing ? "Annuler" : "Modifier"}
            </button>
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Compétences</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ajouter une compétence"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Technologies préférées (max 3)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFavTech}
                  onChange={(e) => setNewFavTech(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ajouter une technologie préférée"
                  disabled={formData.favoriteTechnologies.length >= 3}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newFavTech && !formData.favoriteTechnologies.includes(newFavTech) && formData.favoriteTechnologies.length < 3) {
                      setFormData({
                        ...formData,
                        favoriteTechnologies: [...formData.favoriteTechnologies, newFavTech],
                      });
                      setNewFavTech('');
                    }
                  }}
                  className={`${
                    formData.favoriteTechnologies.length >= 3
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white px-4 py-2 rounded`}
                  disabled={formData.favoriteTechnologies.length >= 3}
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.favoriteTechnologies.map((tech, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          favoriteTechnologies: formData.favoriteTechnologies.filter(t => t !== tech),
                        });
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
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
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-gray-600">{formData.description || "Aucune description"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Compétences</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Aucune compétence ajoutée</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Technologies préférées</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.favoriteTechnologies.length > 0 ? (
                  formData.favoriteTechnologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Aucune technologie préférée ajoutée</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}