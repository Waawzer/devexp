"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import EditProjectModal from "@/components/EditProjectModal";
import { authService } from "@/services/authService";
import Link from "next/link";
import { FaGithub } from 'react-icons/fa';

interface Project {
  _id: string;
  title: string;
  description: string;
  userId: string;
  img: string;
  skills: string;
  creator?: {
    _id: string;
    username: string;
  };
  githubUrl?: string;
}

interface User {
  username: string;
  email: string;
  _id: string;
}

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération du projet");
        const data = await response.json();
        setProject(data);
        console.log("Projet chargé:", data);
        console.log("User connecté:", user);
        console.log("Comparaison IDs:", user?._id, data.userId);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

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
    // Recharger les données du projet
    const response = await fetch(`/api/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setProject(data);
    }
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {currentUserId && currentUserId === project?.userId && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                >
                  Éditer
                </button>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black"
                >
                  <FaGithub size={24} />
                </a>
              )}
            </div>
            <Link 
              href={`/profile/${project.creator?._id}`}
              className="text-blue-500 hover:text-blue-700"
            >
              Par {project.creator?.username || "Utilisateur inconnu"}
            </Link>
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
        <EditProjectModal
          project={project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
} 