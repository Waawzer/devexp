"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import CreateProjectModal from "@/components/CreateProjectModal";

interface Project {
  _id: string;
  title: string;
  description: string;
}

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects/my-projects", {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleProjectCreated = () => {
    fetchProjects(); // Rafraîchir la liste après création
  };

  if (!user) {
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

  if (loading) {
    return <div className="text-center py-8">Chargement des projets...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mes projets</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
      >
        Créer un nouveau projet
      </button>
      {projects.length === 0 ? (
        <p className="text-gray-500">Vous n'avez pas encore de projets.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project._id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <p className="text-gray-700">{project.description}</p>
            </li>
          ))}
        </ul>
      )}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}