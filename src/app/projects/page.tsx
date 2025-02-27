"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Project {
  _id: string;
  title: string;
  description: string;
  userId: string;
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
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project._id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <p className="text-gray-700">{project.description}</p>
              {user && user._id === project.userId && (
                <span className="text-sm text-green-500">Votre projet</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}