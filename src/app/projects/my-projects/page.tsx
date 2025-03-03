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
}

export default function MyProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
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
      const response = await fetch("/api/projects/my-projects");
      if (!response.ok) throw new Error("Erreur lors de la récupération des projets");
      const data = await response.json();
      setProjects(data);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes projets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Créer un projet
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de projets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectPreview 
              key={project._id} 
              project={project}
              isOwner={true}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
} 