"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import ProjectPreview from "@/components/layout/ProjectPreview";

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
}

export default function MyProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    }
  }, [session]);

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
  };

  if (status === "loading") {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        Veuillez vous{" "}
        <Link href="/" className="text-blue-500 underline">
          connecter
        </Link>{" "}
        pour voir vos projets.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes projets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Créer un nouveau projet
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement des projets...</div>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">Vous n'avez pas encore de projets.</p>
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