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
  applications?: Array<{
    user: {
      _id: string;
      name: string;
      image?: string;
    };
    message: string;
    status: 'en_attente' | 'accepté' | 'refusé';
    createdAt: string;
  }>;
  projectType: 'personnel' | 'collaboratif';
  createdAt: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
}

function ApplyModal({ isOpen, onClose, projectId }: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la candidature');
      }

      onClose();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px]">
        <h2 className="text-xl font-bold mb-4">Postuler pour ce projet</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de candidature
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre ce projet..."
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer ma candidature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce collaborateur ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/collaborators`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }) // Envoyer l'ID dans le body
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du collaborateur');
      }

      // Rafraîchir les données du projet
      fetchProject();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du collaborateur');
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
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
              {project.status}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              project.projectType === 'collaboratif' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-500 text-white'
            }`}>
              {project.projectType === 'collaboratif' ? 'Projet collaboratif' : 'Projet personnel'}
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
          <div className="mt-6 prose prose-gray max-w-none">
            {project.description.split('\n').map((paragraph, index) => {
              // Si le paragraphe commence par "•", c'est une puce
              if (paragraph.trim().startsWith('•')) {
                return (
                  <div key={index} className="pl-4">
                    <p className="mb-1">{paragraph}</p>
                  </div>
                );
              }
              // Sinon c'est un paragraphe normal
              return (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
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
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
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
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab.user._id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Retirer le collaborateur"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
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

      {/* Ajouter un bouton "Postuler" si c'est un projet collaboratif et que l'utilisateur n'est pas le propriétaire */}
      {project.projectType === 'collaboratif' && !isOwner && (
        <>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-800">
                  Ce projet recrute !
                </h3>
                <p className="text-sm text-purple-600">
                  Vous pouvez postuler pour rejoindre l'équipe de développement.
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Postuler
              </button>
            </div>
          </div>
          <ApplyModal
            isOpen={isApplyModalOpen}
            onClose={() => setIsApplyModalOpen(false)}
            projectId={project._id}
          />
        </>
      )}

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
            applications={project.applications || []}
          />
        </>
      )}
    </div>
  );
} 