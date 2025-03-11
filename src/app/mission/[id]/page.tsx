"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  FaArrowLeft, 
  FaClock, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaCheck, 
  FaPaperPlane,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaHourglassHalf,
  FaProjectDiagram,
  FaSave,
  FaTimes,
  FaPlus,
  FaMinus
} from "react-icons/fa";
import { toast } from "react-hot-toast";

interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string;
}

interface Mission {
  _id: string;
  title: string;
  description: string;
  projectId?: {
    _id: string;
    title: string;
  };
  creatorId: {
    _id: string;
    name: string;
    image?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    image?: string;
  };
  status: 'à faire' | 'en cours' | 'en révision' | 'terminée' | 'annulée';
  priority: 'basse' | 'moyenne' | 'haute' | 'urgente';
  skills: string[];
  deadline?: string;
  estimatedHours?: number;
  completedHours: number;
  startedAt?: string;
  completedAt?: string;
  comments: Comment[];
  applications?: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      image?: string;
    };
    message: string;
    status: 'en_attente' | 'acceptée' | 'refusée';
    createdAt: string;
  }>;
  attachments: Array<{
    url: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function MissionDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMission, setEditedMission] = useState<Partial<Mission>>({});
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchMission();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/");
    }
  }, [sessionStatus, params.id, router]);

  useEffect(() => {
    // Scroll to bottom of comments when new comments are added
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mission?.comments]);

  const fetchMission = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/missions/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Mission non trouvée");
          router.push("/mission");
          return;
        }
        throw new Error("Erreur lors de la récupération de la mission");
      }
      const data = await response.json();
      setMission(data);
      setEditedMission(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger la mission");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");
      
      const updatedMission = await response.json();
      setMission(updatedMission);
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompletedHoursChange = async (hours: number) => {
    if (!mission) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completedHours: hours })
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour des heures complétées");
      
      const updatedMission = await response.json();
      setMission(updatedMission);
      toast.success(`Heures complétées mises à jour: ${hours}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de mettre à jour les heures complétées");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");
      
      const updatedMission = await response.json();
      setMission(updatedMission);
      setNewComment("");
      toast.success("Commentaire ajouté");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'ajouter le commentaire");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedMission),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour de la mission");
      
      const updatedMission = await response.json();
      setMission(updatedMission);
      setIsEditing(false);
      toast.success("Mission mise à jour avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de mettre à jour la mission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMission = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression de la mission");
      
      toast.success("Mission supprimée avec succès");
      router.push("/mission");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de supprimer la mission");
    } finally {
      setSubmitting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleApply = async () => {
    if (!session?.user) {
      toast.error("Vous devez être connecté pour candidater");
      return;
    }

    // Si l'utilisateur est le créateur ou déjà assigné, ne pas permettre la candidature
    if (isCreator || isAssigned) {
      return;
    }

    setApplyModalOpen(true);
  };

  const submitApplication = async (message: string) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi de la candidature");
      }
      
      toast.success("Candidature envoyée avec succès");
      setApplyModalOpen(false);
      fetchMission(); // Rafraîchir les données de la mission
    } catch (error) {
      console.error("Erreur:", error);
      toast.error((error as Error).message || "Impossible d'envoyer la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour gérer les actions sur les candidatures
  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/missions/${params.id}/applications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId, action }),
      });

      if (!response.ok) throw new Error("Erreur lors de la gestion de la candidature");
      
      const updatedMission = await response.json();
      setMission(updatedMission);
      toast.success(`Candidature ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de gérer la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour vérifier si une date est dépassée
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-500/10 text-red-400 border border-red-500/50';
      case 'haute': return 'bg-orange-500/10 text-orange-400 border border-orange-500/50';
      case 'moyenne': return 'bg-blue-500/10 text-blue-400 border border-blue-500/50';
      case 'basse': return 'bg-green-500/10 text-green-400 border border-green-500/50';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/50';
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'à faire': return 'bg-gray-500/10 text-gray-400 border border-gray-500/50';
      case 'en cours': return 'bg-blue-500/10 text-blue-400 border border-blue-500/50';
      case 'en révision': return 'bg-purple-500/10 text-purple-400 border border-purple-500/50';
      case 'terminée': return 'bg-green-500/10 text-green-400 border border-green-500/50';
      case 'annulée': return 'bg-red-500/10 text-red-400 border border-red-500/50';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/50';
    }
  };

  // Vérifier si l'utilisateur est le créateur de la mission
  const isCreator = mission && session?.user?.id === mission.creatorId._id;
  
  // Vérifier si l'utilisateur est assigné à la mission
  const isAssigned = mission && mission.assignedTo && session?.user?.id === mission.assignedTo._id;

  // Déterminer le lien de retour en fonction du type de mission
  const getBackLink = () => {
    if (mission) {
      // Si l'utilisateur est le créateur de la mission
      if (mission.creatorId._id === session?.user?.id) {
        return "/mission?view=my-missions";
      }
      // Si l'utilisateur est assigné à la mission
      else if (mission.assignedTo && mission.assignedTo._id === session?.user?.id) {
        return "/mission?view=assigned";
      }
    }
    // Par défaut, retour à toutes les missions
    return "/mission";
  };

  // Ajouter cette nouvelle fonction pour générer une description améliorée
  const handleGenerateDescription = async () => {
    if (!editedMission.description) return;
    
    try {
      setIsGeneratingDescription(true);
      
      const response = await fetch('/api/ai-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-mission-description',
          data: {
            description: editedMission.description,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la description');
      }

      const data = await response.json();
      setEditedMission(prev => ({
        ...prev,
        description: data.description,
      }));
      
      toast.success('Description améliorée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de générer une description améliorée');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Mission non trouvée</h2>
        <p className="mt-2 text-gray-500">La mission que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link 
          href={getBackLink()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaArrowLeft />
          <span>Retour aux missions</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête avec navigation */}
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href={getBackLink()}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <FaArrowLeft />
          <span>Retour aux missions</span>
        </Link>
      </div>

      {/* Carte principale de la mission */}
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-700">
        {/* En-tête avec titre et actions */}
        <div className="relative p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {isEditing ? (
              <input
                type="text"
                value={editedMission.title || ''}
                onChange={(e) => setEditedMission({ ...editedMission, title: e.target.value })}
                className="text-2xl font-bold w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                placeholder="Titre de la mission"
              />
            ) : (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{mission.title}</h1>
            )}

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
                  >
                    <FaSave />
                    <span>Enregistrer</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedMission(mission);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FaTimes />
                    <span>Annuler</span>
                  </button>
                </>
              ) : (
                <>
                  {isCreator && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300"
                      >
                        <FaEdit />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <FaTrash />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Badges de statut et priorité */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mission.status)}`}>
              {mission.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(mission.priority)}`}>
              Priorité: {mission.priority}
            </span>
            {mission.projectId && (
              <Link 
                href={`/projects/${mission.projectId._id}`}
                className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-900/70 transition-colors flex items-center gap-1"
              >
                <FaProjectDiagram className="text-xs" />
                <span>Projet: {mission.projectId.title}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Corps de la mission */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">Description</h2>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedMission.description || ''}
                  onChange={(e) => setEditedMission({ ...editedMission, description: e.target.value })}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg min-h-[150px] text-gray-100"
                  placeholder="Description de la mission"
                />
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription || !editedMission.description}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium 
                           text-indigo-300 bg-indigo-900/50 rounded-xl hover:bg-indigo-900/70 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                           focus:ring-indigo-500 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGeneratingDescription ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-300" 
                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" 
                                stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Améliorer la description
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {mission.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2 text-gray-300">{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Colonne gauche */}
            <div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">Informations</h2>
              <div className="space-y-4">
                {/* Créateur */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {mission.creatorId.image ? (
                      <Image 
                        src={mission.creatorId.image} 
                        alt={mission.creatorId.name} 
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Créée par</p>
                    <Link 
                      href={`/profile/${mission.creatorId._id}`}
                      className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {mission.creatorId.name}
                    </Link>
                  </div>
                </div>

                {/* Assigné à */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {mission.assignedTo?.image ? (
                      <Image 
                        src={mission.assignedTo.image} 
                        alt={mission.assignedTo.name} 
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Assignée à</p>
                    {mission.assignedTo ? (
                      <Link 
                        href={`/profile/${mission.assignedTo._id}`}
                        className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {mission.assignedTo.name}
                      </Link>
                    ) : (
                      <span className="text-gray-500 italic">Non assignée</span>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaCalendarAlt className="text-gray-500" />
                    <span>Créée le: {formatDate(mission.createdAt)}</span>
                  </div>
                  {mission.startedAt && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaCalendarAlt className="text-indigo-400" />
                      <span>Démarrée le: {formatDate(mission.startedAt)}</span>
                    </div>
                  )}
                  {mission.completedAt && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaCalendarAlt className="text-green-400" />
                      <span>Terminée le: {formatDate(mission.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">Détails</h2>
              <div className="space-y-4">
                {/* Deadline */}
                <div className="flex items-center gap-2">
                  <FaClock className={`${
                    isOverdue(mission.deadline) && mission.status !== 'terminée' 
                      ? 'text-red-400' 
                      : 'text-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-400">Date d'échéance</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedMission.deadline ? new Date(editedMission.deadline).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedMission({ ...editedMission, deadline: e.target.value })}
                        className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                      />
                    ) : (
                      <p className={`font-medium ${
                        isOverdue(mission.deadline) && mission.status !== 'terminée' 
                          ? 'text-red-400' 
                          : 'text-gray-300'
                      }`}>
                        {mission.deadline ? formatDate(mission.deadline) : 'Non définie'}
                        {isOverdue(mission.deadline) && mission.status !== 'terminée' && (
                          <span className="ml-2 text-red-400 flex items-center gap-1">
                            <FaExclamationTriangle />
                            <span>En retard</span>
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Heures estimées / complétées */}
                <div className="flex items-center gap-2">
                  <FaHourglassHalf className="text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Temps</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editedMission.estimatedHours || ''}
                          onChange={(e) => setEditedMission({ ...editedMission, estimatedHours: parseInt(e.target.value) || 0 })}
                          className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 w-20"
                          min="0"
                        />
                        <span className="text-gray-300">heures estimées</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {mission.estimatedHours ? (
                          <>
                            <span className="font-medium text-gray-300">
                              {mission.completedHours}/{mission.estimatedHours} heures
                            </span>
                            {isAssigned && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => handleCompletedHoursChange(Math.max(0, mission.completedHours - 1))}
                                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                  disabled={mission.completedHours <= 0 || submitting}
                                >
                                  <FaMinus className="text-xs text-gray-300" />
                                </button>
                                <button
                                  onClick={() => handleCompletedHoursChange(mission.completedHours + 1)}
                                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                  disabled={mission.completedHours >= (mission.estimatedHours || 0) || submitting}
                                >
                                  <FaPlus className="text-xs text-gray-300" />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Non estimé</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Compétences requises</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedMission.skills?.join(', ') || ''}
                      onChange={(e) => setEditedMission({ 
                        ...editedMission, 
                        skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      })}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                      placeholder="Compétences séparées par des virgules"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {mission.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm border border-indigo-500/50"
                        >
                          {skill}
                        </span>
                      ))}
                      {mission.skills.length === 0 && (
                        <span className="text-gray-500 italic">Aucune compétence spécifiée</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions de statut */}
          {(isCreator || isAssigned) && !isEditing && (
            <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">
                Changer le statut
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange('à faire')}
                  disabled={mission.status === 'à faire' || submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mission.status === 'à faire'
                      ? 'bg-gray-200 text-gray-700 cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  À faire
                </button>
                <button
                  onClick={() => handleStatusChange('en cours')}
                  disabled={mission.status === 'en cours' || submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mission.status === 'en cours'
                      ? 'bg-blue-200 text-blue-700 cursor-default'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  } disabled:opacity-50`}
                >
                  En cours
                </button>
                <button
                  onClick={() => handleStatusChange('en révision')}
                  disabled={mission.status === 'en révision' || submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mission.status === 'en révision'
                      ? 'bg-purple-200 text-purple-700 cursor-default'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  } disabled:opacity-50`}
                >
                  En révision
                </button>
                <button
                  onClick={() => handleStatusChange('terminée')}
                  disabled={mission.status === 'terminée' || submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mission.status === 'terminée'
                      ? 'bg-green-200 text-green-700 cursor-default'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  <FaCheck className="inline-block mr-1" />
                  Terminée
                </button>
                <button
                  onClick={() => handleStatusChange('annulée')}
                  disabled={mission.status === 'annulée' || submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mission.status === 'annulée'
                      ? 'bg-red-200 text-red-700 cursor-default'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } disabled:opacity-50`}
                >
                  Annulée
                </button>
              </div>
            </div>
          )}

          {/* Bouton de candidature */}
          {!isCreator && !isAssigned && !mission.assignedTo && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Intéressé par cette mission ?</h2>
              <p className="text-gray-600 mb-4">
                Vous pouvez candidater à cette mission pour montrer votre intérêt et vos compétences.
              </p>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaUser />
                <span>Candidater à cette mission</span>
              </button>
            </div>
          )}

          {/* Commentaires */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-4">Commentaires</h2>
            
            {/* Liste des commentaires */}
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto p-2">
              {mission.comments && mission.comments.length > 0 ? (
                mission.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.userId.image ? (
                        <Image 
                          src={comment.userId.image} 
                          alt={comment.userId.name} 
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <Link 
                          href={`/profile/${comment.userId._id}`}
                          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {comment.userId.name}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 italic py-4">
                  Aucun commentaire pour le moment
                </p>
              )}
              <div ref={commentsEndRef} />
            </div>
            
            {/* Formulaire d'ajout de commentaire */}
            <form onSubmit={handleSubmitComment} className="mt-4">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
                  rows={2}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 self-end"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMission}
                disabled={submitting}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {submitting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section des candidatures pour le créateur */}
      {isCreator && mission.applications && mission.applications.length > 0 && (
        <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-md border border-gray-700">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Candidatures ({mission.applications.length})
          </h2>
          <div className="space-y-4">
            {mission.applications.map((application) => (
              <div key={application._id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {application.user.image ? (
                        <Image 
                          src={application.user.image} 
                          alt={application.user.name} 
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link 
                        href={`/profile/${application.user._id}`}
                        className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {application.user.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {application.status === 'en_attente' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplicationAction(application._id, 'accept')}
                        disabled={submitting || (mission.assignedTo && mission.assignedTo._id !== application.user._id)}
                        className="px-3 py-1 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleApplicationAction(application._id, 'reject')}
                        disabled={submitting}
                        className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === 'acceptée' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {application.status === 'acceptée' ? 'Acceptée' : 'Refusée'}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-300">{application.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de candidature */}
      {applyModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Candidater à cette mission</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const message = formData.get('message') as string;
              submitApplication(message);
            }}>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Message de candidature
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
                  placeholder="Expliquez pourquoi vous êtes intéressé par cette mission et quelles sont vos compétences pertinentes..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? "Envoi en cours..." : "Envoyer ma candidature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
