// Fonctions utilitaires partagées pour les interfaces de missions
export const formatDate = (dateString?: string) => {
  if (!dateString) return 'Non définie';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const isOverdue = (dateString?: string) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
    case 'haute': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'moyenne': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'basse': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'à faire': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'en cours': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'en révision': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'terminée': return 'bg-green-100 text-green-800 border-green-200';
    case 'annulée': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Fonction pour trier les missions
export const sortMissions = (missions: any[], sortBy: string, sortOrder: string) => {
  return [...missions].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'urgente': 0, 'haute': 1, 'moyenne': 2, 'basse': 3 };
        valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
        break;
      case 'deadline':
        valueA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        valueB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        break;
      case 'status':
        const statusOrder = { 'en cours': 0, 'à faire': 1, 'en révision': 2, 'terminée': 3, 'annulée': 4 };
        valueA = statusOrder[a.status as keyof typeof statusOrder] || 5;
        valueB = statusOrder[b.status as keyof typeof statusOrder] || 5;
        break;
      default: // createdAt
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
    }

    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });
};

// Fonction pour filtrer les missions par terme de recherche
export const filterMissionsBySearchTerm = (missions: any[], searchTerm: string) => {
  if (!searchTerm) return missions;
  
  const term = searchTerm.toLowerCase();
  return missions.filter(mission => 
    mission.title.toLowerCase().includes(term) ||
    mission.description.toLowerCase().includes(term) ||
    (mission.skills && mission.skills.some((skill: string) => skill.toLowerCase().includes(term)))
  );
}; 