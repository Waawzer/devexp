"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { FaBriefcase, FaCode, FaClock, FaEnvelope } from "react-icons/fa";

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

function MissionProposalModal({ isOpen, onClose, targetUserId, targetUserName, isAvailable }: {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  isAvailable: boolean;
}) {
  const { id } = useParams();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Array<{ _id: string; title: string }>>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const response = await fetch('/api/projects/my-projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    if (isOpen) {
      fetchMyProjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/projects/${selectedProject}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: targetUserId,
          message: message,
          type: 'mission_proposal'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la proposition');
      }

      toast.success('Proposition de mission envoyée avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la proposition');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px]">
        <h2 className="text-xl font-bold mb-4">
          Proposer une mission à {targetUserName}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un projet
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Choisir un projet</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Décrivez brièvement la mission et vos attentes..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !isAvailable}
              className={`px-4 py-2 rounded-md ${
                isAvailable
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Envoi...' : 'Envoyer la proposition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [userData, setUserData] = useState<{
    user: User;
    projects: Project[];
    collaborations: Project[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

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
      {/* Carte de profil principale */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        {/* En-tête avec fond dégradé */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-blue-500">
          <div className="absolute inset-0 bg-grid-white/10"></div>
        </div>

        <div className="relative px-8 pb-8">
          {/* Avatar et informations principales */}
          <div className="relative -mt-24 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {userData?.user.image ? (
                  <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                    <Image
                      src={userData.user.image}
                      alt={userData.user.name}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg 
                                bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {userData?.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="flex-grow md:pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{userData?.user.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="text-indigo-500" />
                        <span>{userData?.projects.length || 0} projets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCode className="text-blue-500" />
                        <span>{userData?.collaborations.length || 0} collaborations</span>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de proposition de mission */}
                  {session?.user?.id !== userData?.user._id && (
                    <button
                      onClick={() => setIsMissionModalOpen(true)}
                      disabled={userData?.user.availability === 'occupé'}
                      className={`
                        px-6 py-3 rounded-xl font-medium shadow-md
                        transition-all duration-300 transform hover:-translate-y-0.5
                        flex items-center gap-2
                        ${userData?.user.availability !== 'occupé'
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <FaEnvelope />
                      {userData?.user.availability !== 'occupé' ? 'Proposer une mission' : 'Non disponible'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              {userData?.user.description && (
                <div className="prose prose-indigo max-w-none">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 
                               bg-clip-text text-transparent">
                    À propos
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {userData.user.description}
                  </p>
                </div>
              )}

              {/* Projets */}
              {userData?.projects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 
                               bg-clip-text text-transparent mb-6">
                    Projets
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.projects.map((project) => (
                      <div
                        key={project._id}
                        className="transform hover:scale-[1.02] transition-all duration-300"
                      >
                        <ProjectPreview 
                          project={project}
                          isOwner={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaborations */}
              {userData?.collaborations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 
                               bg-clip-text text-transparent mb-6">
                    Collaborations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.collaborations.map((project) => (
                      <div
                        key={project._id}
                        className="transform hover:scale-[1.02] transition-all duration-300"
                      >
                        <ProjectPreview 
                          project={project}
                          isOwner={false}
                          collaborationRole={
                            project.collaborators?.find(
                              c => c.user._id === userData.user._id
                            )?.role
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Barre latérale */}
            <div className="space-y-8">
              {/* Disponibilité */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaClock className="text-indigo-500" />
                  Disponibilité
                </h3>
                <span className={`
                  inline-flex px-4 py-2 rounded-xl text-sm font-medium
                  ${userData?.user.availability === 'disponible'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : userData?.user.availability === 'occupé'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }
                `}>
                  {userData?.user.availability?.replace('_', ' ')}
                </span>
              </div>

              {/* Compétences */}
              {userData?.user.skills && userData.user.skills.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 
                                 text-indigo-700 border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies préférées */}
              {userData?.user.favoriteTechnologies && userData.user.favoriteTechnologies.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies préférées</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.user.favoriteTechnologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 
                                 text-green-700 border border-green-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations professionnelles */}
              {(userData?.user.hourlyRate || userData?.user.yearsOfExperience) && (
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>
                  <div className="space-y-3">
                    {userData.user.hourlyRate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">{userData.user.hourlyRate}€</span>
                        <span>/ heure</span>
                      </div>
                    )}
                    {userData.user.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">{userData.user.yearsOfExperience}</span>
                        <span>années d'expérience</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de proposition de mission */}
      <MissionProposalModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        targetUserId={userData?.user._id || ''}
        targetUserName={userData?.user.name || ''}
        isAvailable={userData?.user.availability !== 'occupé'}
      />
    </div>
  );
}
