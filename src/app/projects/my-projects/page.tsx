"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

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
  createdAt: string;
  collaborators?: Array<{
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
}

export default function MyProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [collaborations, setCollaborations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session?.user) {
      fetchProjects();
    }
  }, [session, status, router]);

  const fetchProjects = async () => {
    try {
      // Récupérer mes projets
      const myProjectsResponse = await fetch("/api/projects/my-projects");
      if (!myProjectsResponse.ok) throw new Error("Erreur lors de la récupération des projets");
      const myProjectsData = await myProjectsResponse.json();
      setMyProjects(myProjectsData);

      // Récupérer mes collaborations
      const collaborationsResponse = await fetch("/api/projects/my-collaborations");
      if (!collaborationsResponse.ok) throw new Error("Erreur lors de la récupération des collaborations");
      const collaborationsData = await collaborationsResponse.json();
      setCollaborations(collaborationsData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
    setIsModalOpen(false);
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mes Projets */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mes projets</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Créer un projet
          </button>
        </div>

        {myProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore créé de projets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <ProjectPreview 
                key={project._id} 
                project={project}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mes Collaborations */}
      <div className="mt-12">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold">Mes collaborations</h2>
        </div>

        {collaborations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Vous ne collaborez sur aucun projet pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((project) => (
              <ProjectPreview 
                key={project._id} 
                project={project}
                isOwner={false}
                collaborationRole={
                  project.collaborators?.find(
                    c => c.user._id === session?.user?.id
                  )?.role
                }
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
} 