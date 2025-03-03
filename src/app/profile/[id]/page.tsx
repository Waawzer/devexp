"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";

interface User {
  _id: string;
  username: string;
  email: string;
  description?: string;
  skills?: string[];
}

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
}

export default function UserProfilePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState<{ user: User, projects: Project[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        
        const data = await response.json();
        console.log("Données reçues:", data); // Pour debug
        setUserData(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!userData) {
    return <div className="text-center py-8">Utilisateur non trouvé</div>;
  }

  const { user, projects } = userData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{user.username}</h1>
        {user.description && (
          <p className="text-gray-600 mb-4">{user.description}</p>
        )}
        
        {/* Compétences */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projets */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Projets de {user.username}</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">Aucun projet</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {projects.map((project) => (
              <ProjectPreview 
                key={project._id} 
                project={{
                  ...project,
                  creator: {
                    _id: user._id,
                    username: user.username
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
