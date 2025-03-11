// Fonctions utilitaires partagées pour les interfaces de projets
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getProjectStatusColor = (status: string) => {
  switch (status) {
    case 'en développement': return 'bg-blue-100 text-blue-800';
    case 'en production': return 'bg-green-100 text-green-800';
    case 'en pause': return 'bg-yellow-100 text-yellow-800';
    case 'abandonné': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getProjectTypeLabel = (type: string) => {
  return type === 'collaboratif' ? 'Projet collaboratif' : 'Projet personnel';
};

export const getVisibilityLabel = (visibility: string) => {
  return visibility === 'private' ? 'Privé' : 'Public';
}; 