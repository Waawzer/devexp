"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaGithub, FaProjectDiagram, FaBook, FaUsers } from 'react-icons/fa';
import EditProjectModal from "@/components/modals/EditProjectModal";
import TreeModal from "@/components/modals/TreeModal";
import SpecificationsModal from "@/components/modals/SpecificationsModal";
import AddCollaboratorModal from "@/components/modals/AddCollaboratorModal";
import ImageGallery from "@/components/layout/ImageGallery";
import { toast } from "react-hot-toast";
import MissionProposalActions from '@/components/notifications/MissionProposalActions';
import { ProjectStatus } from '@/models/Project';

interface Collaborator {
  user: {
    _id: string;
    username: string;
  };
  role: string;
}

interface Application {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  message: string;
  status: 'en_attente' | 'accepté' | 'refusé';
  createdAt: string;
  type: 'application' | 'mission_proposal';
}

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
  status: ProjectStatus;
  githubUrl?: string;
  specifications?: string;
  collaborators?: Collaborator[];
  applications?: Application[];
  projectType: 'personnel' | 'collaboratif';
  createdAt: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  visibility: 'public' | 'private';
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
        body: JSON.stringify({ 
          message,
          type: 'application'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Détails de l\'erreur:', errorData);
        toast.error(errorData.message || 'Erreur lors de l\'envoi de la candidature');
        setError(errorData.message || 'Erreur lors de l\'envoi de la candidature');
        return;
      }

      toast.success('Candidature envoyée avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la candidature');
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
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ProjectContent params={params} />
    </Suspense>
  );
}

function ProjectContent({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const notificationId = searchParams.get('notification');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [pendingProposal, setPendingProposal] = useState<any>(null);
  const [notification, setNotification] = useState<any>(null);

  // Déplacer fetchProject en dehors du useEffect
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.status === 403) {
        router.push('/projects');
        toast.error('Ce projet est privé');
        return;
      }
      if (!response.ok) throw new Error("Erreur lors de la récupération du projet");
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement du projet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!notificationId) return;

      try {
        const response = await fetch(`/api/projects/${params.id}/applications?notificationId=${notificationId}`);
        if (response.ok) {
          const data = await response.json();
          setPendingProposal(data);
        } else {
          console.error('Erreur lors de la récupération de la proposition');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchProposal();
  }, [notificationId, params.id]);

  useEffect(() => {
    const fetchNotification = async () => {
      if (!notificationId || !session?.user?.id) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.to === session.user.id) {
            setNotification(data);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchNotification();
  }, [notificationId, session?.user?.id]);

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

  const handleProposalAction = async (action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/projects/${params.id}/applications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action,
        }),
      });

      if (response.ok) {
        toast.success(
          action === 'accept' 
            ? 'Proposition acceptée avec succès' 
            : 'Proposition refusée'
        );
        
        // Mettre à jour l'état local pour masquer les boutons
        setNotification(null);
        
        // Rafraîchir les données du projet
        await fetchProject();
        
        // Rediriger vers la page du projet sans le paramètre de notification
        router.replace(`/projects/${params.id}`);
      } else {
        toast.error("Une erreur s'est produite");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur s'est produite");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du projet...</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Projet non trouvé</div>;
  }

  const isOwner = session?.user?.id === project.userId._id;
  const isCollaborator = project.collaborators?.some(
    collab => collab.user._id.toString() === session?.user?.id
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête du projet avec effet de parallaxe */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transform hover:scale-[1.01] transition-transform duration-300">
        <div className="relative h-96">
          <div className="absolute inset-0">
            <img
              src={project.img || '/default-project.jpg'}
              alt={project.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>

          {/* Badges de statut avec animation */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm animate-fade-in">
              {project.status}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm animate-fade-in-delay ${
              project.projectType === 'collaboratif' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            }`}>
              {project.projectType === 'collaboratif' ? 'Projet collaboratif' : 'Projet personnel'}
            </span>
          </div>

          {/* Titre sur l'image avec effet de glassmorphism */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/10 backdrop-blur-md">
            <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
            <div className="flex items-center gap-3">
              <Link 
                href={`/profile/${project.userId._id}`}
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="text-sm">Par {project.userId.name}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Actions et description */}
        <div className="p-8">
          <div className="flex justify-between items-start gap-4 mb-8">
            {/* Actions principales avec animations au survol */}
            <div className="flex gap-4">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 
                           transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaGithub size={20} />
                  <span>GitHub</span>
                </a>
              )}
              {project.specifications && (
                <button
                  onClick={() => setIsSpecsModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                            ${(project.visibility === 'private' && !isOwner && !isCollaborator)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                  disabled={project.visibility === 'private' && !isOwner && !isCollaborator}
                >
                  <FaBook size={20} />
                  <span>
                    {(project.visibility === 'private' && !isOwner && !isCollaborator)
                      ? 'Spécifications privées'
                      : 'Spécifications'
                    }
                  </span>
                </button>
              )}
              {project.githubUrl && (
                <button
                  onClick={() => setIsTreeModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                            ${(project.visibility === 'private' && !isOwner && !isCollaborator)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                  disabled={project.visibility === 'private' && !isOwner && !isCollaborator}
                  title="Voir l'arborescence"
                >
                  <FaProjectDiagram size={20} />
                  <span>Arborescence</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setIsAddCollaboratorModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600"
                  title="Gérer les collaborateurs"
                >
                  <FaUsers size={20} />
                  <span>Collaborateurs</span>
                </button>
              )}
            </div>

            {/* Menu d'actions propriétaire avec effet de glassmorphism */}
            {isOwner && (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-all duration-300"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMenuOpen(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

          {/* Description avec style markdown */}
          <div className="prose prose-lg prose-gray max-w-none">
            {project.visibility === 'private' && !isOwner && !isCollaborator ? (
              <p className="text-gray-500 italic">
                Ce projet est privé. Seuls le propriétaire et les collaborateurs peuvent voir sa description.
              </p>
            ) : (
              project.description?.split('\n').map((paragraph, index) => {
                if (paragraph.trim().startsWith('•')) {
                  return (
                    <div key={index} className="pl-6 my-2">
                      <p className="flex items-center gap-2 text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {paragraph.trim().substring(1)}
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={index} className="mb-4 leading-relaxed text-gray-700">
                    {paragraph}
                  </p>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grille de contenu avec animation au scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section captures d'écran avec effet de carte */}
          {project.images && project.images.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.01] 
                          transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                           bg-clip-text text-transparent">
                Captures d'écran
              </h2>
              <ImageGallery images={project.images} />
            </div>
          )}
        </div>

        {/* Barre latérale */}
        <div className="space-y-8">
          {/* Section compétences */}
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.01] 
                        transition-all duration-300">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                         bg-clip-text text-transparent">
              Compétences requises
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.visibility === 'private' && !isOwner && !isCollaborator ? (
                <p className="text-gray-500 italic">
                  Ce projet est privé. Seuls le propriétaire et les collaborateurs peuvent voir les compétences requises.
                </p>
              ) : (
                project.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r 
                             from-blue-50 to-indigo-50 text-blue-700 border border-blue-100
                             hover:shadow-md transition-all duration-300"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Section collaborateurs */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.01] 
                          transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                           bg-clip-text text-transparent">
                Équipe
              </h2>
              <div className="space-y-4">
                {project.collaborators.map((collab, index) => (
                  <div key={index} className="flex items-center justify-between group p-3 rounded-lg
                                            hover:bg-gray-50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${collab.user._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {collab.user.username}
                      </Link>
                      <span className="text-sm px-3 py-1 rounded-full bg-gradient-to-r 
                                     from-gray-50 to-gray-100 text-gray-700 border border-gray-200">
                        {collab.role}
                      </span>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab.user._id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 
                                 transition-all duration-300 transform hover:scale-110"
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
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.01] 
                        transition-all duration-300">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                         bg-clip-text text-transparent">
              Informations
            </h2>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Créé le : {new Date(project.createdAt).toLocaleDateString()}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Par : </span>
                <Link 
                  href={`/profile/${project.userId._id}`} 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {project.userId.name}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section postuler avec effet de glassmorphism */}
      {project.projectType === 'collaboratif' && !isOwner && (
        <div className="mt-8 p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 
                       backdrop-blur-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 
                           bg-clip-text text-transparent">
                Ce projet recrute !
              </h3>
              <p className="text-gray-600 mt-2">
                Vous pouvez postuler pour rejoindre l'équipe de développement.
              </p>
            </div>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 
                       text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 
                       transition-all duration-300"
            >
              Postuler
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {project && (
        <>
          {isOwner && (
            <EditProjectModal
              project={project}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onProjectUpdated={fetchProject}
            />
          )}
          
          {/* TreeModal accessible à tous pour les projets publics */}
          {(project.visibility === 'public' || isOwner || isCollaborator) && (
            <TreeModal
              isOpen={isTreeModalOpen}
              onClose={() => setIsTreeModalOpen(false)}
              githubUrl={project.githubUrl || ''}
            />
          )}
          
          {/* SpecificationsModal accessible à tous pour les projets publics */}
          {project.specifications && (project.visibility === 'public' || isOwner || isCollaborator) && (
            <SpecificationsModal
              isOpen={isSpecsModalOpen}
              onClose={() => setIsSpecsModalOpen(false)}
              specifications={project.specifications}
            />
          )}
          
          {isOwner && (
            <AddCollaboratorModal
              isOpen={isAddCollaboratorModalOpen}
              onClose={() => setIsAddCollaboratorModalOpen(false)}
              projectId={project._id}
              onCollaboratorAdded={fetchProject}
              currentCollaborators={project.collaborators || []}
              applications={project.applications || []}
            />
          )}
        </>
      )}

      {/* Ajouter le modal de candidature ici */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        projectId={params.id}
      />

      {/* Ajouter un indicateur de visibilité */}
      {project.visibility === 'private' && (
        <div className="absolute top-4 left-4 bg-gray-900/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Privé
        </div>
      )}
    </div>
  );
} 