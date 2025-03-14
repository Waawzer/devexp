"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";
import ProjectFilters from "@/components/projects/ProjectFilters";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import Link from "next/link";
import { FaPlus, FaArrowLeft } from "react-icons/fa";

// Constantes partagées
const AVAILABLE_SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript", 
  "HTML/CSS", "Front-end", "Back-end", "Base de données", "DevOps",
];

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
  status: 'en développement' | 'en production' | 'en pause' | 'abandonné';
  projectType: 'personnel' | 'collaboratif';
  createdAt: string;
  collaborators?: Array<{
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewType = searchParams.get('view') || 'all'; // 'all', 'my-projects', 'my-collaborations'
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    projectType: 'tous',
    skills: [] as string[],
    searchTerm: '',
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let url = "/api/projects";
      
      // Utiliser le paramètre type pour filtrer côté serveur
      if (viewType === 'my-projects' || viewType === 'my-collaborations') {
        url += `?type=${viewType}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors de la récupération des projets");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType]);

  const handleProjectCreated = () => {
    fetchProjects();
    setIsCreateModalOpen(false);
  };

  // Filtrer les projets côté client
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

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      projectType: 'tous',
      skills: [],
      searchTerm: '',
    });
  };

  // Déterminer le titre et la description en fonction du type de vue
  const getViewTitle = () => {
    switch (viewType) {
      case 'my-projects':
        return {
          title: "Mes projets",
          description: "Projets que vous avez créés et que vous gérez."
        };
      case 'my-collaborations':
        return {
          title: "Mes collaborations",
          description: "Projets sur lesquels vous collaborez avec d'autres développeurs."
        };
      default:
        return {
          title: "Découvrez les projets",
          description: "Explorez des projets passionnants et trouvez des opportunités de collaboration avec des développeurs talentueux."
        };
    }
  };

  const { title, description } = getViewTitle();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Navigation entre les vues */}
      {viewType !== 'all' && (
        <div className="mb-3 flex items-center gap-4">
          <Link 
            href="/projects" 
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FaArrowLeft size={14} />
            <span className="text-sm">Retour aux projets</span>
          </Link>
        </div>
      )}

      {/* Barre d'actions pour mes projets */}
      {viewType === 'my-projects' && (
        <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md p-4 mb-5 border border-gray-700/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-100">Gérer vos projets</h2>
              <p className="text-sm text-gray-400">Créez et gérez vos projets personnels ou collaboratifs</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600/90 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm backdrop-blur-sm border border-indigo-500/30"
            >
              <FaPlus size={12} />
              <span>Créer un projet</span>
            </button>
          </div>
        </div>
      )}

      {/* Filtres communs à toutes les vues */}
      <ProjectFilters 
        filters={filters}
        availableSkills={AVAILABLE_SKILLS}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      {/* En-tête des résultats */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">
          {viewType === 'my-projects' ? 'Mes projets' : 
           viewType === 'my-collaborations' ? 'Mes collaborations' : 
           'Projets disponibles'}
          <span className="ml-2 text-sm text-gray-500">
            ({filteredProjects.length})
          </span>
        </h2>
        
        {/* Bouton de création pour la vue principale */}
        {viewType === 'all' && session?.user && (
          <Link
            href="/projects?view=my-projects"
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600/90 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm backdrop-blur-sm border border-indigo-500/30"
          >
            <FaPlus size={12} />
            <span>Mes projets</span>
          </Link>
        )}
      </div>

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-10 bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md border border-gray-700/30">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-10 w-10 text-gray-500"
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
            <h3 className="mt-3 text-base font-medium text-gray-100">Aucun projet trouvé</h3>
            <p className="mt-2 text-sm text-gray-400">
              {viewType === 'my-projects' ? 
                "Vous n'avez pas encore créé de projets." : 
                viewType === 'my-collaborations' ? 
                "Vous ne collaborez sur aucun projet pour le moment." :
                "Essayez de modifier vos critères de recherche pour trouver ce que vous cherchez."}
            </p>
            
            {viewType === 'my-projects' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-indigo-600/90 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm backdrop-blur-sm border border-indigo-500/30"
              >
                <FaPlus size={12} />
                <span>Créer un projet</span>
              </button>
            )}
            
            {viewType === 'my-collaborations' && (
              <Link
                href="/projects"
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-indigo-600/90 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm backdrop-blur-sm border border-indigo-500/30"
              >
                Découvrir des projets
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="transform transition-all duration-300"
            >
              <ProjectPreview 
                project={project}
                isOwner={session?.user?.id === project.userId._id}
                collaborationRole={
                  viewType === 'my-collaborations' && project.collaborators
                    ? project.collaborators.find(c => c.user._id === session?.user?.id)?.role
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal de création de projet */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}