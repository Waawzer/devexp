"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProjectPreview from "@/components/layout/ProjectPreview";
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

interface Project {
  _id: string;
  title: string;
  description: string;
  userId: {
    _id: string;
    name: string;
  };
  img: string;
  skills: string[];
  status: string;
  projectType: 'personnel' | 'collaboratif';
  createdAt: string;
}

const AVAILABLE_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "HTML/CSS",
  "Front-end",
  "Back-end",
  "Base de données",
  "DevOps",
];

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    projectType: 'tous',
    skills: [] as string[],
    searchTerm: '',
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Erreur lors de la récupération des projets");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    // Filtre par type de projet
    if (filters.projectType !== 'tous' && project.projectType !== filters.projectType) {
      return false;
    }

    // Filtre par compétences
    if (filters.skills.length > 0) {
      const hasAllSelectedSkills = filters.skills.every(skill =>
        project.skills.includes(skill)
      );
      if (!hasAllSelectedSkills) return false;
    }

    // Filtre par recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Chargement des projets...</p>
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
          <h1 className="text-3xl font-bold mb-4">
            Découvrez les projets
          </h1>
          <p className="text-white/80 max-w-2xl">
            Explorez des projets passionnants et trouvez des opportunités de collaboration 
            avec des développeurs talentueux.
          </p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col gap-6">
          {/* Barre de recherche avec icône */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 
                       focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
            />
          </div>

          {/* Bouton pour ouvrir/fermer les filtres sur mobile */}
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaFilter />
            <span>Filtres</span>
          </button>

          {/* Conteneur des filtres */}
          <div className={`
            md:flex flex-wrap gap-6
            ${isFilterMenuOpen ? 'block' : 'hidden md:block'}
          `}>
            {/* Type de projet */}
            <div className="flex-1 min-w-[200px] space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Type de projet</h3>
              <select
                value={filters.projectType}
                onChange={(e) => setFilters(prev => ({ ...prev, projectType: e.target.value }))}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 
                         focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
              >
                <option value="tous">Tous les projets</option>
                <option value="personnel">Projets personnels</option>
                <option value="collaboratif">Projets collaboratifs</option>
              </select>
            </div>

            {/* Compétences */}
            <div className="flex-[2] min-w-[300px] space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Compétences requises</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                              transform hover:-translate-y-0.5 ${
                      filters.skills.includes(skill)
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {(filters.skills.length > 0 || filters.projectType !== 'tous' || filters.searchTerm) && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Filtres actifs :</span>
              <div className="flex flex-wrap gap-2">
                {filters.projectType !== 'tous' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                                 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                    {filters.projectType === 'personnel' ? 'Projets personnels' : 'Projets collaboratifs'}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, projectType: 'tous' }))}
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
                      onClick={() => toggleSkillFilter(skill)}
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
                  onClick={() => setFilters({ projectType: 'tous', skills: [], searchTerm: '' })}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Réinitialiser tout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* En-tête des résultats */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Projets disponibles 
          <span className="ml-2 text-lg text-gray-500">
            ({filteredProjects.length})
          </span>
        </h2>
      </div>

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun projet trouvé</h3>
            <p className="mt-2 text-gray-500">
              Essayez de modifier vos critères de recherche pour trouver ce que vous cherchez.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="transform hover:scale-[1.02] transition-all duration-300"
            >
              <ProjectPreview 
                project={project}
                isOwner={session?.user?.id === project.userId._id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}