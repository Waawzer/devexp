"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";
import Image from "next/image";

interface User {
  _id: string;
  name: string;          // Le seul champ dont nous avons besoin pour le nom
  email: string;
  description?: string;
  skills?: string[];
  favoriteTechnologies?: string[];
  image?: string;
  availability?: 'disponible' | 'occupé' | 'en_recherche';
  hourlyRate?: number;
  yearsOfExperience?: number;
}

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
  collaborators?: Array<{
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
}

// Simplifions la fonction getDisplayName
const getDisplayName = (user: User) => {
  return user.name || 'Utilisateur';
};

// Simplifions le rendu de l'avatar
function ProfileImage({ user }: { user: User }) {
  const renderAvatar = () => {
    if (!user) return null;

    if (user.image) {
      return (
        <Image
          src={user.image}
          alt={user.name || 'Avatar'}
          width={120}
          height={120}
          className="rounded-full"
        />
      );
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
      <div className="w-[120px] h-[120px] bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-4xl text-gray-500">
          {initial}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-shrink-0">
      {renderAvatar()}
    </div>
  );
}

function AvailabilityBadge({ availability }: { availability?: string }) {
  if (!availability) return null;

  const styles = {
    disponible: 'bg-green-100 text-green-800 border-green-200',
    occupé: 'bg-red-100 text-red-800 border-red-200',
    en_recherche: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-full
      ${styles[availability as keyof typeof styles]}
      border-2 animate-pulse
    `}>
      <span className={`
        w-2 h-2 rounded-full
        ${availability === 'disponible' ? 'bg-green-500' :
          availability === 'occupé' ? 'bg-red-500' : 'bg-blue-500'}
      `}></span>
      <span className="font-medium">
        {availability.replace('_', ' ')}
      </span>
    </div>
  );
}

function ProfessionalInfo({ user }: { user: User }) {
  if (!user.hourlyRate && !user.yearsOfExperience) return null;

  return (
    <div className="flex flex-wrap gap-4 items-center mt-4">
      {user.hourlyRate && (
        <div className="bg-gray-100 px-4 py-2 rounded-full">
          <span className="font-medium">{user.hourlyRate}€</span>
          <span className="text-gray-600">/heure</span>
        </div>
      )}
      {user.yearsOfExperience && (
        <div className="bg-gray-100 px-4 py-2 rounded-full">
          <span className="font-medium">{user.yearsOfExperience}</span>
          <span className="text-gray-600">
            {user.yearsOfExperience > 1 ? ' ans' : ' an'} d'expérience
          </span>
        </div>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState<{
    user: User;
    projects: Project[];
    collaborations: Project[];
  } | null>(null);
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
        console.log("Données reçues:", data);
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

  const { user, projects, collaborations } = userData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="flex-shrink-0">
            <ProfileImage user={user} />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold mb-2">{getDisplayName(user)}</h1>
              <AvailabilityBadge availability={user.availability} />
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{projects.length}</span> projets créés
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{collaborations.length}</span> collaborations
              </div>
            </div>

            <ProfessionalInfo user={user} />

            {user.description && (
              <p className="text-gray-600 mt-4">{user.description}</p>
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

      {/* Projets créés */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Projets de {getDisplayName(user)}
        </h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">Aucun projet créé</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectPreview 
                key={project._id} 
                project={project}
                isOwner={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Collaborations */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Collaborations
        </h2>
        {collaborations.length === 0 ? (
          <p className="text-gray-500">Aucune collaboration</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collaborations.map((project) => (
              <ProjectPreview 
                key={project._id} 
                project={project}
                isOwner={false}
                collaborationRole={
                  project.collaborators?.find(
                    c => c.user._id === user._id
                  )?.role
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
