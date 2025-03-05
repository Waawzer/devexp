"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";
import Image from "next/image";

interface User {
  _id: string;
  username: string;
  email: string;
  description?: string;
  skills?: string[];
  favoriteTechnologies?: string[];
  image?: string;
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

// Composant pour l'image de profil avec gestion des erreurs
function ProfileImage({ user }: { user: User }) {
  const [imageError, setImageError] = useState(false);

  if (!user.image || imageError) {
    return (
      <div className="w-[120px] h-[120px] bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-4xl text-gray-500">
          {user.username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={user.image}
      alt={`Photo de profil de ${user.username}`}
      width={120}
      height={120}
      className="rounded-full object-cover"
      priority
      onError={() => setImageError(true)}
    />
  );
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
        <div className="flex items-start gap-6 mb-6">
          <div className="flex-shrink-0">
            <ProfileImage user={user} />
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-4">{user.username}</h1>
            {user.description && (
              <p className="text-gray-600 mb-4">{user.description}</p>
            )}
          </div>
        </div>
        
        {/* Technologies préférées */}
        {user.favoriteTechnologies && user.favoriteTechnologies.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Technologies préférées</h2>
            <div className="flex flex-wrap gap-2">
              {user.favoriteTechnologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
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
