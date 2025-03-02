"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import EditProjectModal from "@/components/EditProjectModal";
import { authService } from "@/services/authService";
import Link from "next/link";
import { FaGithub, FaProjectDiagram, FaBook, FaUsers } from 'react-icons/fa';
import TreeModal from "@/components/TreeModal";
import SpecificationsModal from "@/components/SpecificationsModal";
import AddCollaboratorModal from "@/components/AddCollaboratorModal";

interface Project {
  _id: string;
  title: string;
  description: string;
  userId: string;
  img: string;
  skills: string;
  createdAt: string;
  status: string;
  creator?: {
    _id: string;
    username: string;
  };
  githubUrl?: string;
  specifications?: string;
  collaborators: {
    user: {
      _id: string;
      username: string;
    };
    role: string;
  }[];
}

interface User {
  username: string;
  email: string;
  _id: string;
}

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération du projet");
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        setCurrentUserId(decoded.userId);
      } catch (error) {
        console.error("Erreur de décodage du token:", error);
      }
    }
  }, []);

  const handleProjectUpdated = async () => {
    const response = await fetch(`/api/projects/${id}`);
    if (response.ok) {
      const data = await response.json();
      setProject(data);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        router.push('/my-projects');
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  const handleTreeClick = () => {
    setIsTreeModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du projet...</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Projet non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64">
          <img
            src={project.img || '/dev.bmp'}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {currentUserId && currentUserId === project.userId && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-black"
                    >
                      <FaGithub size={24} />
                    </a>
                    <button
                      onClick={handleTreeClick}
                      title="Voir l'arborescence"
                      className="text-gray-700 hover:text-black"
                    >
                      <FaProjectDiagram size={24} />
                    </button>
                  </>
                )}
                {project.specifications && (
                  <button
                    onClick={() => setIsSpecsModalOpen(true)}
                    title="Voir le cahier des charges"
                    className="text-gray-700 hover:text-black"
                  >
                    <FaBook size={24} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <Link 
                href={`/profile/${project.creator?._id}`}
                className="text-blue-500 hover:text-blue-700 block mb-1"
              >
                Par {project.creator?.username || "Utilisateur inconnu"}
              </Link>
              <span className="text-sm text-gray-500 mb-2">
                Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
              </span>

              {/* Section Collaborateurs */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex flex-col items-end">
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FaUsers className="text-gray-400" />
                      <div className="flex flex-wrap justify-end gap-1">
                        {project.collaborators.map((collab) => (
                          collab.user && (
                            <Link
                              key={collab.user._id}
                              href={`/profile/${collab.user._id}`}
                              className="hover:text-blue-500"
                            >
                              {collab.user.username} ({collab.role})
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {currentUserId && currentUserId === project.userId && (
                  <button
                    onClick={() => setIsAddCollaboratorModalOpen(true)}
                    className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    title="Ajouter un collaborateur"
                  >
                    <FaUsers className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <span className={`${getStatusColor(project.status)} text-sm px-3 py-1 rounded-full`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-700 mb-6">{project.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.skills?.split(',').map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {project && (
        <>
          <EditProjectModal
            project={project}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProjectUpdated={handleProjectUpdated}
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
            onCollaboratorAdded={handleProjectUpdated}
            currentCollaborators={project.collaborators || []}
          />
        </>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'En développement':
      return 'bg-yellow-100 text-yellow-800';
    case 'En production':
      return 'bg-green-100 text-green-800';
    case 'Abandonné':
      return 'bg-red-100 text-red-800';
    case 'En pause':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}; 