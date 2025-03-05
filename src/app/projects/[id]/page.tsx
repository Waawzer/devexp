"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGithub, FaProjectDiagram, FaBook, FaUsers } from 'react-icons/fa';
import EditProjectModal from "@/components/modals/EditProjectModal";
import TreeModal from "@/components/modals/TreeModal";
import SpecificationsModal from "@/components/modals/SpecificationsModal";
import AddCollaboratorModal from "@/components/modals/AddCollaboratorModal";
import ImageGallery from "@/components/layout/ImageGallery";

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
  githubUrl?: string;
  specifications?: string;
  collaborators?: Array<{
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
  createdAt: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération du projet");
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/projects/my-projects');
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du projet...</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Projet non trouvé</div>;
  }

  const isOwner = session?.user?.id === project.userId._id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête du projet */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative h-80">
          <img
            src={project.img || '/dev.bmp'}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay pour le statut */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
              {project.status}
            </span>
          </div>
        </div>

        {/* Section titre et actions */}
        <div className="p-8">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            
            <div className="flex items-center gap-3">
              {/* Actions principales */}
              <div className="flex gap-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2"
                    title="Voir sur GitHub"
                  >
                    <FaGithub size={20} />
                  </a>
                )}
                {project.specifications && (
                  <button
                    onClick={() => setIsSpecsModalOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2"
                    title="Voir les spécifications"
                  >
                    <FaBook size={20} />
                  </button>
                )}
                {project.githubUrl && (
                  <button
                    onClick={() => setIsTreeModalOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2"
                    title="Voir l'arborescence"
                  >
                    <FaProjectDiagram size={20} />
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => setIsAddCollaboratorModalOpen(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2"
                    title="Gérer les collaborateurs"
                  >
                    <FaUsers size={20} />
                  </button>
                )}
              </div>

              {/* Menu d'actions pour le propriétaire */}
              {isOwner && (
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Menu du projet"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsMenuOpen(false)}
                      />
                      
                      <div 
                        className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                      >
                        <div className="py-0.5 flex flex-col">
                          <button
                            onClick={() => {
                              setIsEditModalOpen(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              handleDelete();
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mt-6 leading-relaxed">{project.description}</p>
        </div>
      </div>

      {/* Grille de contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section captures d'écran */}
          {project.images && project.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Captures d'écran</h2>
              <ImageGallery images={project.images} />
            </div>
          )}

          {/* Autres sections potentielles */}
        </div>

        {/* Barre latérale */}
        <div className="space-y-8">
          {/* Section compétences */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Compétences requises</h2>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Section collaborateurs */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Équipe</h2>
              <div className="space-y-3">
                {project.collaborators.map((collab, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Link
                      href={`/profile/${collab.user._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {collab.user.name}
                    </Link>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {collab.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section informations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Créé le : {new Date(project.createdAt).toLocaleDateString()}</p>
              <p>Par : <Link href={`/profile/${project.userId._id}`} className="text-blue-600 hover:text-blue-800">{project.userId.name}</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {project && isOwner && (
        <>
          <EditProjectModal
            project={project}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProjectUpdated={fetchProject}
          />
          <TreeModal
            isOpen={isTreeModalOpen}
            onClose={() => setIsTreeModalOpen(false)}
            githubUrl={project.githubUrl || ''}
          />
          {project.specifications && (
            <SpecificationsModal
              isOpen={isSpecsModalOpen}
              onClose={() => setIsSpecsModalOpen(false)}
              specifications={project.specifications}
            />
          )}
          <AddCollaboratorModal
            isOpen={isAddCollaboratorModalOpen}
            onClose={() => setIsAddCollaboratorModalOpen(false)}
            projectId={project._id}
            onCollaboratorAdded={fetchProject}
            currentCollaborators={project.collaborators || []}
          />
        </>
      )}
    </div>
  );
} 