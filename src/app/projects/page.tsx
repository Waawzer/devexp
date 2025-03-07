"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProjectPreview from "@/components/layout/ProjectPreview";

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
    return <div className="text-center py-8">Chargement des projets...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Barre de filtres */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col gap-6">
          {/* Recherche */}
          <div>
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-6">
            {/* Type de projet */}
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-sm font-semibold mb-2">Type de projet</h3>
              <select
                value={filters.projectType}
                onChange={(e) => setFilters(prev => ({ ...prev, projectType: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="tous">Tous les projets</option>
                <option value="personnel">Projets personnels</option>
                <option value="collaboratif">Projets collaboratifs</option>
              </select>
            </div>

            {/* Compétences */}
            <div className="flex-[2] min-w-[300px]">
              <h3 className="text-sm font-semibold mb-2">Compétences requises</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.skills.includes(skill)
                        ? 'bg-blue-500 text-white'
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              <div className="flex flex-wrap gap-2">
                {filters.projectType !== 'tous' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {filters.projectType === 'personnel' ? 'Projets personnels' : 'Projets collaboratifs'}
                  </span>
                )}
                {filters.skills.map((skill) => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
                {filters.searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    Recherche: {filters.searchTerm}
                  </span>
                )}
                <button
                  onClick={() => setFilters({ projectType: 'tous', skills: [], searchTerm: '' })}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* En-tête avec compteur */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Projets disponibles 
          <span className="text-gray-500 text-lg ml-2">
            ({filteredProjects.length})
          </span>
        </h1>
      </div>

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun projet ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectPreview 
              key={project._id} 
              project={project}
              isOwner={session?.user?.id === project.userId._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}