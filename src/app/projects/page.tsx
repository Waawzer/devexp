"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  creator: {
    _id: string;
    username: string;
  };
  githubUrl?: string;
}

interface User {
  _id: string;
  // Add other properties if needed
}

export default function ProjectsPage() {
  const { user } = useAuth() as { user: User | null };
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des projets");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des projets...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Tous les projets</h1>
      {projects.length === 0 ? (
        <p className="text-gray-500">Aucun projet disponible.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {projects.map((project) => (
            <ProjectPreview 
              key={project._id} 
              project={project}
              isOwner={user?._id === project.userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}