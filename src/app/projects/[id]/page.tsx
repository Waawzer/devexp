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
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-4">
                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
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
                    onClick={() => setIsTreeModalOpen(true)}
                    className="text-gray-700 hover:text-black"
                  >
                    <FaProjectDiagram size={24} />
                  </button>
                </>
              )}
              {project.specifications && (
                <button
                  onClick={() => setIsSpecsModalOpen(true)}
                  className="text-gray-700 hover:text-black"
                >
                  <FaBook size={24} />
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setIsAddCollaboratorModalOpen(true)}
                  className="text-gray-700 hover:text-black"
                >
                  <FaUsers size={24} />
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          {project.collaborators && project.collaborators.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Collaborateurs</h2>
              <div className="space-y-2">
                {project.collaborators.map((collab, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Link
                      href={`/profile/${collab.user._id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {collab.user.name}
                    </Link>
                    <span className="text-gray-500">({collab.role})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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