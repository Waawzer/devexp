"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaPlus, FaFilter, FaTimes, FaSort, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import CreateMissionModal from "@/components/modals/CreateMissionModal";

// Types pour les missions
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
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'toutes',
    priority: 'toutes',
    assignedToMe: false,
    createdByMe: false,
    searchTerm: '',
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchMissions();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/");
    }
  }, [sessionStatus, router]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      
      // Construire l'URL avec les paramètres de filtrage
      let url = "/api/missions?";
      if (filters.status !== 'toutes') url += `&status=${filters.status}`;
      if (filters.priority !== 'toutes') url += `&priority=${filters.priority}`;
      if (filters.assignedToMe) url += `&assignedToMe=true`;
      if (filters.createdByMe) url += `&createdByMe=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors de la récupération des missions");
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les missions");
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres côté client pour la recherche
  const filteredMissions = missions.filter(mission => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        mission.title.toLowerCase().includes(searchLower) ||
        mission.description.toLowerCase().includes(searchLower) ||
        mission.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Fonction pour trier les missions
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'urgente': 0, 'haute': 1, 'moyenne': 2, 'basse': 3 };
        valueA = priorityOrder[a.priority];
        valueB = priorityOrder[b.priority];
        break;
      case 'deadline':
        valueA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        valueB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        break;
      case 'status':
        const statusOrder = { 'en cours': 0, 'à faire': 1, 'en révision': 2, 'terminée': 3, 'annulée': 4 };
        valueA = statusOrder[a.status];
        valueB = statusOrder[b.status];
        break;
      default: // createdAt
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
    }

    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'haute': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moyenne': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basse': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'à faire': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'en cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en révision': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terminée': return 'bg-green-100 text-green-800 border-green-200';
      case 'annulée': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fonction pour vérifier si une date est dépassée
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Appliquer les filtres et rafraîchir les données
  const applyFilters = () => {
    fetchMissions();
    setIsFilterMenuOpen(false);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: 'toutes',
      priority: 'toutes',
      assignedToMe: false,
      createdByMe: false,
      searchTerm: '',
    });
    fetchMissions();
    setIsFilterMenuOpen(false);
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête avec fond dégradé */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative px-8 py-12 text-white">
          <h1 className="text-3xl font-bold mb-4">Gérer mes missions</h1>
          <p className="text-white/80 max-w-2xl">
            Suivez et gérez vos missions, qu'elles soient liées à un projet ou indépendantes.
          </p>
        </div>
      </div>

      {/* Barre d'actions et filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Nouvelle mission</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaFilter />
                <span>Filtres</span>
              </button>

              {isFilterMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsFilterMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl z-20 p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3">Filtrer par</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Statut
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="toutes">Tous les statuts</option>
                          <option value="à faire">À faire</option>
                          <option value="en cours">En cours</option>
                          <option value="en révision">En révision</option>
                          <option value="terminée">Terminée</option>
                          <option value="annulée">Annulée</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priorité
                        </label>
                        <select
                          value={filters.priority}
                          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="toutes">Toutes les priorités</option>
                          <option value="basse">Basse</option>
                          <option value="moyenne">Moyenne</option>
                          <option value="haute">Haute</option>
                          <option value="urgente">Urgente</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="assignedToMe"
                          checked={filters.assignedToMe}
                          onChange={(e) => setFilters(prev => ({ ...prev, assignedToMe: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="assignedToMe" className="text-sm text-gray-700">
                          Assignées à moi
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="createdByMe"
                          checked={filters.createdByMe}
                          onChange={(e) => setFilters(prev => ({ ...prev, createdByMe: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="createdByMe" className="text-sm text-gray-700">
                          Créées par moi
                        </label>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <button
                          onClick={resetFilters}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Réinitialiser
                        </button>
                        <button
                          onClick={applyFilters}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaSort />
                <span>Trier</span>
              </button>
              
              {isSortMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsSortMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-20 p-2 border border-gray-100">
                    <button
                      onClick={() => {
                        setSortBy('createdAt');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                        setIsSortMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex justify-between items-center"
                    >
                      <span>Date de création</span>
                      {sortBy === 'createdAt' && (
                        <span className="text-blue-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('priority');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                        setIsSortMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex justify-between items-center"
                    >
                      <span>Priorité</span>
                      {sortBy === 'priority' && (
                        <span className="text-blue-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('deadline');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                        setIsSortMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex justify-between items-center"
                    >
                      <span>Date d'échéance</span>
                      {sortBy === 'deadline' && (
                        <span className="text-blue-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('status');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                        setIsSortMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex justify-between items-center"
                    >
                      <span>Statut</span>
                      {sortBy === 'status' && (
                        <span className="text-blue-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une mission..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {filters.searchTerm && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des missions */}
      {sortedMissions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission trouvée</h3>
          <p className="text-gray-500 mb-4">
            Créez votre première mission ou modifiez vos filtres pour voir les missions existantes.
          </p>
          <Link
            href="/mission/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Créer une mission</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedMissions.map((mission) => (
            <Link
              key={mission._id}
              href={`/mission/${mission._id}`}
              className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{mission.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                        {mission.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(mission.priority)}`}>
                        {mission.priority}
                      </span>
                      {mission.projectId && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Projet: {mission.projectId.title}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {mission.deadline && (
                      <div className="flex items-center gap-1 text-sm">
                        {isOverdue(mission.deadline) && mission.status !== 'terminée' ? (
                          <FaExclamationTriangle className="text-red-500" />
                        ) : (
                          <FaClock className="text-gray-400" />
                        )}
                        <span className={`${
                          isOverdue(mission.deadline) && mission.status !== 'terminée' 
                            ? 'text-red-500 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          {formatDate(mission.deadline)}
                        </span>
                      </div>
                    )}
                    
                    {mission.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {mission.assignedTo.image ? (
                            <img 
                              src={mission.assignedTo.image} 
                              alt={mission.assignedTo.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {mission.assignedTo.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{mission.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Non assignée</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 line-clamp-2 mb-4">{mission.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {mission.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {mission.skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{mission.skills.length - 3} autres
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <span>Créée le {formatDate(mission.createdAt)}</span>
                  {mission.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <FaClock className="text-gray-400" />
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
