"use client";

import { useState, useEffect } from "react";
import FreelancePreview from "@/components/layout/FreelancePreview";
import { FaSearch, FaFilter, FaTimes, FaUserFriends } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  image: string | null;
  skills: string[];
  favoriteTechnologies: string[];
  availability: 'disponible' | 'occupé' | 'en_recherche';
}

export default function ProfilesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    availability: 'tous',
    searchTerm: '',
    skills: [] as string[],
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.availability !== 'tous' && user.availability !== filters.availability) {
      return false;
    }

    if (filters.skills.length > 0) {
      const hasAllSelectedSkills = filters.skills.every(skill =>
        user.skills.includes(skill)
      );
      if (!hasAllSelectedSkills) return false;
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête avec fond dégradé */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center gap-4 mb-4">
            <FaUserFriends className="text-4xl text-white/90" />
            <h1 className="text-3xl font-bold">Découvrez nos talents</h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            Explorez les profils de développeurs talentueux et trouvez le collaborateur idéal pour votre projet.
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-700">
        <div className="space-y-6">
          {/* Barre de recherche */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un développeur..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          {/* Bouton toggle filtres mobile */}
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaFilter />
            <span>Filtres</span>
          </button>

          {/* Filtres */}
          <div className={`
            md:flex items-center gap-6
            ${isFilterMenuOpen ? 'block' : 'hidden md:flex'}
          `}>
            {/* Disponibilité */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilité
              </label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 
                         focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
              >
                <option value="tous">Tous les développeurs</option>
                <option value="disponible">Disponibles</option>
                <option value="en_recherche">En recherche</option>
                <option value="occupé">Occupés</option>
              </select>
            </div>

            {/* Compétences populaires */}
            <div className="flex-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compétences recherchées
              </label>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript'].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      skills: prev.skills.includes(skill)
                        ? prev.skills.filter(s => s !== skill)
                        : [...prev.skills, skill]
                    }))}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                      transform hover:-translate-y-0.5
                      ${filters.skills.includes(skill)
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }
                    `}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtres actifs */}
          {(filters.availability !== 'tous' || filters.skills.length > 0 || filters.searchTerm) && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Filtres actifs :</span>
              <div className="flex flex-wrap gap-2">
                {filters.availability !== 'tous' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                                 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                    {filters.availability}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, availability: 'tous' }))}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                )}
                {filters.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                             bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100"
                  >
                    {skill}
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        skills: prev.skills.filter(s => s !== skill)
                      }))}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
                {filters.searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                                 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                    Recherche: {filters.searchTerm}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setFilters({ availability: 'tous', skills: [], searchTerm: '' })}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Réinitialiser tout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des profils */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <div className="max-w-md mx-auto">
            <FaUserFriends className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-100">Aucun profil trouvé</h3>
            <p className="mt-2 text-gray-400">
              Essayez de modifier vos critères de recherche pour trouver les développeurs que vous cherchez.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="transform hover:scale-[1.02] transition-all duration-300"
            >
              <FreelancePreview freelance={user} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 