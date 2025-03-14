"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaPlus, FaArrowLeft, FaClock, FaExclamationTriangle, FaUser } from "react-icons/fa";
import { toast } from "react-hot-toast";
import CreateMissionModal from "@/components/modals/CreateMissionModal";
import MissionFilters from "@/components/missions/MissionFilters";
import { 
  formatDate, 
  isOverdue, 
  getPriorityColor, 
  getStatusColor,
  sortMissions,
  filterMissionsBySearchTerm
} from "@/lib/services/missionUIService";

// Interface pour les missions
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
  createdAt: string;
}

export default function MissionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <MissionsContent />
    </Suspense>
  );
}

function MissionsContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewType = searchParams.get('view') || 'all'; // 'all', 'my-missions', 'assigned'
  
  const [missions, setMissions] = useState<Mission[]>([]);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'toutes',
    priority: 'toutes',
    searchTerm: '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchMissions();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/");
    }
  }, [sessionStatus, router, viewType, filters.status, filters.priority]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      
      // Construire l'URL avec les paramètres de filtrage
      let url = "/api/missions";
      const params = new URLSearchParams();
      
      // Ajouter le paramètre view si ce n'est pas la vue par défaut (all)
      if (viewType !== 'all') {
        params.append('view', viewType);
      }
      
      // Ajouter les autres filtres
      if (filters.status !== 'toutes') params.append('status', filters.status);
      if (filters.priority !== 'toutes') params.append('priority', filters.priority);
      
      // Ajouter les paramètres à l'URL
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log("Fetching missions from:", url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des missions");
      }
      
      const data = await response.json();
      console.log("Missions received:", data);
      setMissions(data);
      
      // Récupérer également les missions en attente d'acceptation si on est dans la vue "assigned"
      if (viewType === 'assigned') {
        const pendingResponse = await fetch("/api/missions/pending");
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingMissions(pendingData);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les missions");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les missions par terme de recherche
  const filteredMissions = filterMissionsBySearchTerm(missions, filters.searchTerm);
  
  // Trier les missions
  const sortedMissions = sortMissions(filteredMissions, sortBy, sortOrder);

  // Appliquer les filtres et rafraîchir les données
  const applyFilters = () => {
    fetchMissions();
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: 'toutes',
      priority: 'toutes',
      searchTerm: '',
    });
    fetchMissions();
  };

  // Gérer l'acceptation ou le refus d'une mission en attente
  const handlePendingMissionAction = async (missionId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/missions/${missionId}/applications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement de la mission');
      }

      toast.success(action === 'accept' ? 'Mission acceptée' : 'Mission refusée');
      setPendingMissions(prev => prev.filter(m => m._id !== missionId));
      
      if (action === 'accept') {
        fetchMissions();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    }
  };

  // Déterminer le titre et la description en fonction du type de vue
  const getViewTitle = () => {
    switch (viewType) {
      case 'my-missions':
        return {
          title: "Mes missions",
          description: "Missions que vous avez créées et que vous gérez."
        };
      case 'assigned':
        return {
          title: "Missions qui me sont assignées",
          description: "Gérez les missions qui vous ont été assignées par d'autres utilisateurs."
        };
      default:
        return {
          title: "Toutes les missions",
          description: "Explorez toutes les missions disponibles."
        };
    }
  };

  const { title, description } = getViewTitle();

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Barre d'actions pour mes missions */}
      {viewType === 'my-missions' && (
        <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md p-4 mb-5 border border-gray-700/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-100">Gérer vos missions</h2>
              <p className="text-sm text-gray-400">Créez et suivez les missions que vous avez créées</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600/90 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm backdrop-blur-sm border border-indigo-500/30"
            >
              <FaPlus size={12} />
              <span>Nouvelle mission</span>
            </button>
          </div>
        </div>
      )}

      {/* Filtres communs à toutes les vues */}
      <MissionFilters 
        filters={filters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={setFilters}
        onSortChange={(newSortBy, newSortOrder) => {
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
        }}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
      />

      {/* Affichage des missions en attente (pour la vue "assigned") */}
      {viewType === 'assigned' && pendingMissions.length > 0 && (
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-white">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500/90 text-black text-xs font-bold rounded-full">
              {pendingMissions.length}
            </span>
            <span>Missions en attente d'acceptation</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMissions.map((mission) => (
              <div key={mission._id} className="bg-gray-800/40 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-amber-700/30">
                <div className="p-3 bg-amber-900/20 border-b border-amber-800/20">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base text-gray-100 line-clamp-1">{mission.title}</h3>
                    <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 rounded-full text-xs font-medium border border-amber-500/20 backdrop-blur-sm">
                      En attente
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{mission.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {mission.creatorId.image ? (
                        <Image 
                          src={mission.creatorId.image} 
                          alt={mission.creatorId.name} 
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-gray-500 text-xs" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{mission.creatorId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <Link 
                      href={`/mission/${mission._id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                    >
                      Voir les détails
                    </Link>
                    <div className="flex gap-2">
                      <button 
                        className="px-2 py-1 bg-emerald-600/70 text-white text-xs rounded-lg hover:bg-emerald-600 border border-emerald-500/30 backdrop-blur-sm"
                        onClick={() => handlePendingMissionAction(mission._id, 'accept')}
                      >
                        Accepter
                      </button>
                      <button 
                        className="px-2 py-1 bg-red-600/70 text-white text-xs rounded-lg hover:bg-red-600 border border-red-500/30 backdrop-blur-sm"
                        onClick={() => handlePendingMissionAction(mission._id, 'reject')}
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des missions */}
      {sortedMissions.length === 0 ? (
        <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md p-8 text-center border border-gray-700/30">
          <div className="mx-auto w-12 h-12 bg-gray-700/70 rounded-full flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-100 mb-2">Aucune mission trouvée</h3>
          <p className="text-sm text-gray-400 mb-4">
            {viewType === 'my-missions' 
              ? "Vous n'avez pas encore créé de missions ou aucune mission ne correspond à vos filtres."
              : viewType === 'assigned'
                ? "Aucune mission ne vous a été assignée ou aucune mission ne correspond à vos filtres."
                : "Aucune mission ne correspond à vos critères de recherche."}
          </p>
          {viewType === 'my-missions' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600/90 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm backdrop-blur-sm border border-indigo-500/30"
            >
              <FaPlus size={12} />
              <span>Créer une mission</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sortedMissions.map((mission) => (
            <Link
              key={mission._id}
              href={`/mission/${mission._id}`}
              className="block bg-gray-800/40 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 group"
            >
              <div className="p-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors mb-1">{mission.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mission.status)} backdrop-blur-sm`}>
                        {mission.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(mission.priority)} backdrop-blur-sm`}>
                        {mission.priority}
                      </span>
                      {mission.projectId && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
                          Projet: {mission.projectId.title}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {mission.deadline && (
                      <div className="flex items-center gap-1 text-xs">
                        {isOverdue(mission.deadline) && mission.status !== 'terminée' ? (
                          <FaExclamationTriangle className="text-red-500" size={12} />
                        ) : (
                          <FaClock className="text-gray-400" size={12} />
                        )}
                        <span className={`${
                          isOverdue(mission.deadline) && mission.status !== 'terminée' 
                            ? 'text-red-400 font-medium' 
                            : 'text-gray-400'
                        }`}>
                          {formatDate(mission.deadline)}
                        </span>
                      </div>
                    )}
                    
                    {mission.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-700/70 rounded-full flex items-center justify-center overflow-hidden border border-gray-600/30">
                          {mission.assignedTo.image ? (
                            <Image 
                              src={mission.assignedTo.image} 
                              alt={mission.assignedTo.name} 
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-500">
                              {mission.assignedTo.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{mission.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Non assignée</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">{mission.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {mission.skills && mission.skills.slice(0, 3).map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-800/70 text-gray-300 rounded text-xs border border-gray-700/50 backdrop-blur-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {mission.skills && mission.skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{mission.skills.length - 3} autres
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/30 text-xs text-gray-500">
                  <span>Créée le {formatDate(mission.createdAt)}</span>
                  {mission.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <FaClock className="text-gray-500" size={10} />
                      <span>
                        {mission.completedHours}/{mission.estimatedHours}h
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal de création de mission */}
      <CreateMissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMissionCreated={fetchMissions}
      />
    </div>
  );
}
