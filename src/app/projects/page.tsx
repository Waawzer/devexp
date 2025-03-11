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
          <p className="text-gray-600">Chargement...</p>
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
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation entre les vues */}
      {viewType !== 'all' && (
        <div className="mb-6 flex items-center gap-4">
          <Link 
            href="/projects" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft />
            <span>Retour aux projets</span>
          </Link>
        </div>
      )}

      {/* En-tête avec fond dégradé */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative px-8 py-12 text-white">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-white/80 max-w-2xl">{description}</p>
        </div>
      </div>

      {/* Barre d'actions pour mes projets */}
      {viewType === 'my-projects' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gérer vos projets</h2>
              <p className="text-gray-500">Créez et gérez vos projets personnels ou collaboratifs</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus />
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          {viewType === 'my-projects' ? 'Mes projets' : 
           viewType === 'my-collaborations' ? 'Mes collaborations' : 
           'Projets disponibles'}
          <span className="ml-2 text-lg text-gray-500">
            ({filteredProjects.length})
          </span>
        </h2>
        
        {/* Bouton de création pour la vue principale */}
        {viewType === 'all' && session?.user && (
          <Link
            href="/projects?view=my-projects"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Mes projets</span>
          </Link>
        )}
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
              {viewType === 'my-projects' ? 
                "Vous n&apos;avez pas encore créé de projets." : 
                viewType === 'my-collaborations' ? 
                "Vous ne collaborez sur aucun projet pour le moment." :
                "Essayez de modifier vos critères de recherche pour trouver ce que vous cherchez."}
            </p>
            
            {viewType === 'my-projects' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus />
                <span>Créer un projet</span>
              </button>
            )}
            
            {viewType === 'my-collaborations' && (
              <Link
                href="/projects"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Découvrir des projets
              </Link>
            )}
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