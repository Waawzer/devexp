"use client"; // Nécessaire pour utiliser des hooks client comme useAuth

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCamera, FaEdit, FaEye, FaPlus, FaTimes } from "react-icons/fa";

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
    availability: 'en_recherche' as 'disponible' | 'occupé' | 'en_recherche',
    projects: [] as any[],
    collaborations: [] as any[],
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
              availability: userData.availability || 'en_recherche',
              projects: userData.projects || [],
              collaborations: userData.collaborations || [],
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/users/me/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de l\'image');
      }

      const data = await response.json();
      
      // Mise à jour du formulaire et de la session avec la nouvelle URL d'image
      setFormData(prev => ({ ...prev, image: data.image }));
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.image,
        },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>;
  }

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Carte de profil principale */}
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        {/* En-tête avec fond dégradé */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-blue-500">
          <div className="absolute inset-0 bg-grid-white/10"></div>
        </div>

        <div className="relative px-8 pb-8">
          {/* Avatar et informations principales */}
          <div className="relative -mt-24 mb-4 flex justify-between items-start">
            <div className="relative group">
              {formData.image ? (
                <div className="w-40 h-40 rounded-2xl border-4 border-gray-800 shadow-lg overflow-hidden">
                  <Image
                    src={formData.image}
                    alt="Photo de profil"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-2xl border-4 border-gray-800 shadow-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="imageUpload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 
                           opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
                >
                  <FaCamera className="text-white text-2xl" />
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={() => router.push(`/profile/${session?.user?.id}`)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-700 text-gray-200 
                         shadow-md hover:shadow-lg transition-all duration-300"
              >
                <FaEye className="text-gray-400" />
                <span>Voir profil public</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-md hover:shadow-lg 
                         transition-all duration-300 ${
                  isEditing
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                }`}
              >
                {isEditing ? (
                  <>
                    <FaTimes />
                    <span>Annuler</span>
                  </>
                ) : (
                  <>
                    <FaEdit />
                    <span>Modifier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champs de formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    rows={4}
                  />
                </div>

                {/* Compétences avec animation */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Compétences</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Ajouter une compétence"
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 
                               focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 
                               transition-colors duration-300"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm 
                                 bg-indigo-900/50 text-indigo-300 border border-indigo-500/50 group"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technologies préférées */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Technologies préférées (max 3)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFavTech}
                      onChange={(e) => setNewFavTech(e.target.value)}
                      placeholder="Ajouter une technologie"
                      disabled={formData.favoriteTechnologies.length >= 3}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 
                               focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 
                               disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newFavTech && formData.favoriteTechnologies.length < 3) {
                          setFormData({
                            ...formData,
                            favoriteTechnologies: [...formData.favoriteTechnologies, newFavTech],
                          });
                          setNewFavTech('');
                        }
                      }}
                      disabled={formData.favoriteTechnologies.length >= 3}
                      className={`p-2 rounded-xl transition-colors duration-300 ${
                        formData.favoriteTechnologies.length >= 3
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      }`}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.favoriteTechnologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm 
                                 bg-green-900/50 text-green-300 border border-green-500/50"
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
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Disponibilité */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Disponibilité
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: e.target.value as 'disponible' | 'occupé' | 'en_recherche'
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="occupé">Occupé</option>
                    <option value="en_recherche">En recherche</option>
                  </select>
                </div>
              </div>

              {/* Boutons de formulaire */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 
                           text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 
                           transition-all duration-300"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl bg-gray-700 text-gray-200 font-medium 
                           hover:bg-gray-600 transition-colors duration-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            /* Mode affichage */
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">{formData.name}</h1>
                <p className="text-gray-400">{formData.email}</p>
                <div className="flex gap-4 mt-2">
                  <div className="text-sm text-gray-300">
                    <span className="font-semibold text-indigo-400">{formData.projects?.length || 0}</span> projets créés
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-semibold text-indigo-400">{formData.collaborations?.length || 0}</span> collaborations
                  </div>
                </div>
              </div>

              {formData.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">À propos</h2>
                  <p className="text-gray-300 leading-relaxed">{formData.description}</p>
                </div>
              )}

              {formData.skills.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-3">Compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-indigo-900/50 text-indigo-300 
                                 border border-indigo-500/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.favoriteTechnologies.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-3">Technologies préférées</h2>
                  <div className="flex flex-wrap gap-2">
                    {formData.favoriteTechnologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-green-900/50 text-green-300 
                                 border border-green-500/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-3">Disponibilité</h2>
                <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium ${
                  formData.availability === 'disponible'
                    ? 'bg-green-900/50 text-green-300 border border-green-500/50'
                    : formData.availability === 'occupé'
                    ? 'bg-red-900/50 text-red-300 border border-red-500/50'
                    : 'bg-blue-900/50 text-blue-300 border border-blue-500/50'
                }`}>
                  {formData.availability.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}