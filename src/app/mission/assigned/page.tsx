"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaExclamationTriangle, 
  FaFilter, 
  FaSearch, 
  FaSortAmountDown, 
  FaUser 
} from "react-icons/fa";

// Interface pour les missions
interface Mission {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline?: string;
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
  projectId?: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AssignedMissionsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'toutes',
    priority: 'toutes',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchMissions();
    }
  }, [sessionStatus, filters.status, filters.priority]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      
      // Construire l'URL avec les paramètres de filtrage
      let url = "/api/missions/assigned";
      const params = new URLSearchParams();
      if (filters.status !== 'toutes') params.append('status', filters.status);
      if (filters.priority !== 'toutes') params.append('priority', filters.priority);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log("Fetching assigned missions from:", url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error("Erreur lors de la récupération des missions");
      }
      
      const data = await response.json();
      console.log("Assigned missions received:", data);
      setMissions(data);
      
      // Récupérer également les missions en attente d'acceptation
      const pendingResponse = await fetch("/api/missions/pending");
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        console.log("Pending missions received:", pendingData);
        setPendingMissions(pendingData);
      } else {
        console.error("Error fetching pending missions:", await pendingResponse.json());
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast.error("Impossible de charger les missions");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour filtrer les missions par recherche
  const filteredMissions = missions.filter(mission => 
    mission.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    mission.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  // Fonction pour trier les missions
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortOrder === 'desc' 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'urgente': 3, 'haute': 2, 'moyenne': 1, 'basse': 0 };
      return sortOrder === 'desc'
        ? priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        : priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    } else if (sortBy === 'deadline') {
      if (!a.deadline) return sortOrder === 'desc' ? 1 : -1;
      if (!b.deadline) return sortOrder === 'desc' ? -1 : 1;
      return sortOrder === 'desc'
        ? new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
        : new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  // Fonctions utilitaires pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'haute': return 'bg-orange-100 text-orange-800';
      case 'moyenne': return 'bg-blue-100 text-blue-800';
      case 'basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'à faire': return 'bg-gray-100 text-gray-800';
      case 'en cours': return 'bg-blue-100 text-blue-800';
      case 'en révision': return 'bg-purple-100 text-purple-800';
      case 'terminée': return 'bg-green-100 text-green-800';
      case 'annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Missions qui me sont assignées</h1>
        <p className="text-gray-600">
          Gérez les missions qui vous ont été assignées par d'autres utilisateurs.
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une mission..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="toutes">Tous les statuts</option>
            <option value="à faire">À faire</option>
            <option value="en cours">En cours</option>
            <option value="en révision">En révision</option>
            <option value="terminée">Terminée</option>
            <option value="annulée">Annulée</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="toutes">Toutes les priorités</option>
            <option value="basse">Basse</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <option value="createdAt-desc">Plus récentes</option>
            <option value="createdAt-asc">Plus anciennes</option>
            <option value="priority-desc">Priorité (haute à basse)</option>
            <option value="priority-asc">Priorité (basse à haute)</option>
            <option value="deadline-asc">Échéance (proche à lointaine)</option>
            <option value="deadline-desc">Échéance (lointaine à proche)</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {missions.length === 0 && pendingMissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune mission assignée trouvée.</p>
              <p className="text-gray-400 mt-2">
                Les missions qui vous sont assignées par d'autres utilisateurs apparaîtront ici.
              </p>
            </div>
          ) : (
            <div>
              {/* Affichage des missions en attente */}
              {pendingMissions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Missions en attente d'acceptation ({pendingMissions.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingMissions.map((mission) => (
                      <div key={mission._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-yellow-200">
                        <div className="p-4 bg-yellow-50 border-b border-yellow-100">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{mission.title}</h3>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              En attente
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{mission.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {mission.creatorId.image ? (
                                <Image 
                                  src={mission.creatorId.image} 
                                  alt={mission.creatorId.name} 
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FaUser className="text-gray-500 text-xs" />
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{mission.creatorId.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <Link 
                              href={`/mission/${mission._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Voir les détails
                            </Link>
                            <div className="flex gap-2">
                              <button 
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                onClick={() => {/* Fonction pour accepter */}}
                              >
                                Accepter
                              </button>
                              <button 
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                onClick={() => {/* Fonction pour refuser */}}
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
              
              {/* Affichage des missions assignées */}
              {sortedMissions.length > 0 ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">Missions assignées ({sortedMissions.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedMissions.map((mission) => (
                      <Link 
                        href={`/mission/${mission._id}`}
                        key={mission._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{mission.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mission.priority)}`}>
                              {mission.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{mission.description}</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                              {mission.status}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{formatDate(mission.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {mission.creatorId.image ? (
                                  <Image 
                                    src={mission.creatorId.image} 
                                    alt={mission.creatorId.name} 
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FaUser className="text-gray-500 text-xs" />
                                )}
                              </div>
                              <span className="text-sm text-gray-600">{mission.creatorId.name}</span>
                            </div>
                            
                            {mission.deadline && (
                              <div className={`flex items-center gap-1 text-sm ${
                                isOverdue(mission.deadline) && mission.status !== 'terminée'
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}>
                                <FaClock />
                                <span>{formatDate(mission.deadline)}</span>
                                {isOverdue(mission.deadline) && mission.status !== 'terminée' && (
                                  <FaExclamationTriangle className="text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune mission assignée active.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 