"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  createdAt: string;
  status: 'en développement' | 'en production' | 'en pause' | 'abandonné';
  projectType: 'personnel' | 'collaboratif';
  collaborators?: Array<{
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
}

interface Mission {
  _id: string;
  title: string;
  assignedTo?: {
    _id: string;
    name: string;
  };
  projectId?: string;
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
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMission, setSelectedMission] = useState('');
  const [proposalType, setProposalType] = useState<'project' | 'mission'>('project');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const response = await fetch('/api/projects?type=my-projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
      }
    };

    const fetchMyMissions = async () => {
      try {
        const response = await fetch('/api/missions?view=my-missions');
        if (response.ok) {
          const data = await response.json();
          // Filtrer les missions qui ne sont pas encore assignées
          const availableMissions = data.filter((mission: Mission) => !mission.assignedTo);
          setMissions(availableMissions);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des missions:', error);
      }
    };

    if (isOpen) {
      fetchMyProjects();
      fetchMyMissions();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (proposalType === 'project') {
        // Proposition de mission via un projet
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
          throw new Error('Erreur lors de l\'envoi de la proposition de projet');
        }
      } else {
        // Proposition d'une mission existante
        const response = await fetch(`/api/missions/${selectedMission}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetUserId: targetUserId,
            message: message,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi de la proposition de mission');
        }
      }

      toast.success('Proposition envoyée avec succès');
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto border border-gray-700 shadow-xl transform transition-all duration-300">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 
                     bg-clip-text text-transparent mb-6">
          Proposer une mission à {targetUserName}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de proposition avec design amélioré */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Type de proposition
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProposalType('project')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                          ${proposalType === 'project'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                          }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
                <span>Nouveau projet</span>
              </button>
              <button
                type="button"
                onClick={() => setProposalType('mission')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                          ${proposalType === 'mission'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                          }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Mission existante</span>
              </button>
            </div>
          </div>

          {/* Sélection du projet ou de la mission avec style amélioré */}
          {proposalType === 'project' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Sélectionner un projet
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-700 bg-gray-900/50 text-gray-100
                         placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         transition-all duration-200"
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
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Sélectionner une mission
              </label>
              <select
                value={selectedMission}
                onChange={(e) => setSelectedMission(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-700 bg-gray-900/50 text-gray-100
                         placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         transition-all duration-200"
                required
              >
                <option value="">Choisir une mission</option>
                {missions.map((mission) => (
                  <option key={mission._id} value={mission._id}>
                    {mission.title}
                  </option>
                ))}
              </select>
              {missions.length === 0 && (
                <p className="mt-2 text-sm text-amber-400">
                  Vous n'avez pas de missions disponibles à proposer.
                </p>
              )}
            </div>
          )}

          {/* Message avec style amélioré */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-700 bg-gray-900/50 text-gray-100
                       placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       transition-all duration-200 min-h-[120px] resize-y"
              placeholder={proposalType === 'project' 
                ? "Décrivez brièvement la mission et vos attentes..." 
                : "Expliquez pourquoi vous proposez cette mission à cet utilisateur..."}
              required
            />
          </div>

          {/* Boutons avec style amélioré */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 
                       transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !isAvailable || (proposalType === 'project' && !selectedProject) || (proposalType === 'mission' && !selectedMission)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 
                       text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed
                       hover:from-indigo-600 hover:to-blue-600 transform hover:-translate-y-0.5 
                       transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                "Envoyer la proposition"
              )}
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
  const router = useRouter();

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
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-700">
        {/* En-tête avec fond dégradé */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-600 to-blue-500">
          <div className="absolute inset-0 bg-grid-white/10"></div>
        </div>

        <div className="relative px-8 pb-8">
          {/* Avatar et informations principales */}
          <div className="relative -mt-32 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {userData?.user.image ? (
                  <div className="w-48 h-48 rounded-2xl border-4 border-gray-800 shadow-lg overflow-hidden">
                    <Image
                      src={userData.user.image}
                      alt={userData.user.name}
                      width={192}
                      height={192}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl border-4 border-gray-800 shadow-lg 
                                bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <span className="text-5xl text-gray-400">
                      {userData?.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="flex-grow space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-100">{userData?.user.name}</h1>
                    <div className="flex items-center gap-6 text-gray-300">
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="text-indigo-400" />
                        <span>{userData?.projects.length || 0} projets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCode className="text-blue-400" />
                        <span>{userData?.collaborations.length || 0} collaborations</span>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  {session?.user?.id !== userData?.user._id && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Bouton Contacter */}
                      <button
                        onClick={() => router.push(`/messages?user=${userData?.user._id}`)}
                        className="px-6 py-3 rounded-xl font-medium shadow-md
                                  transition-all duration-300 transform hover:-translate-y-0.5
                                  flex items-center justify-center gap-2
                                  bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg"
                      >
                        <FaEnvelope />
                        Contacter
                      </button>
                      
                      {/* Bouton de proposition de mission */}
                      <button
                        onClick={() => setIsMissionModalOpen(true)}
                        disabled={userData?.user.availability === 'occupé'}
                        className={`px-6 py-3 rounded-xl font-medium shadow-md
                                  transition-all duration-300 transform hover:-translate-y-0.5
                                  flex items-center justify-center gap-2
                                  ${userData?.user.availability !== 'occupé'
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                  }`}
                      >
                        <FaBriefcase />
                        {userData?.user.availability !== 'occupé' ? 'Proposer une mission' : 'Non disponible'}
                      </button>
                    </div>
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
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 
                               bg-clip-text text-transparent">
                    À propos
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    {userData.user.description}
                  </p>
                </div>
              )}

              {/* Projets */}
              {userData?.projects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 
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
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 
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
                          collaborationRole={project.collaborators?.find(
                            c => c.user._id === userData.user._id
                          )?.role}
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
              <div className="bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <FaClock className="text-indigo-500" />
                  Disponibilité
                </h3>
                <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium
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

              {/* Technologies préférées - Déplacé avant Compétences */}
              {userData?.user.favoriteTechnologies && userData.user.favoriteTechnologies.length > 0 && (
                <div className="bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Technologies préférées</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.user.favoriteTechnologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-green-900/50 text-green-300 
                                 border border-green-500/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compétences - Déplacé après Technologies préférées */}
              {userData?.user.skills && userData.user.skills.length > 0 && (
                <div className="bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-indigo-900/50 text-indigo-300 
                                 border border-indigo-500/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations professionnelles */}
              {(userData?.user.hourlyRate || userData?.user.yearsOfExperience) && (
                <div className="bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Informations professionnelles</h3>
                  <div className="space-y-3">
                    {userData.user.hourlyRate && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-medium text-gray-200">{userData.user.hourlyRate}€</span>
                        <span>/ heure</span>
                      </div>
                    )}
                    {userData.user.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-medium text-gray-200">{userData.user.yearsOfExperience}</span>
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
