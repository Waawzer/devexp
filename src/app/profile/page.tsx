"use client";

import { useState, useEffect } from "react";
import FreelancePreview from "@/components/layout/FreelancePreview";

interface User {
  _id: string;
  name: string;
  image: string | null;
  skills: string[];
  favoriteTechnologies: string[];
  availability: 'disponible' | 'occupé' | 'en_recherche';
}

export default function ProfilesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    availability: 'tous',
    searchTerm: '',
    skills: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.availability !== 'tous' && user.availability !== filters.availability) {
      return false;
    }

    if (filters.skills.length > 0) {
      const hasAllSelectedSkills = filters.skills.every(skill =>
        user.skills.includes(skill)
      );
      if (!hasAllSelectedSkills) return false;
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full p-2 border rounded-md"
          />
          
          <select
            value={filters.availability}
            onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="tous">Tous les utilisateurs</option>
            <option value="disponible">Disponibles</option>
            <option value="en_recherche">En recherche</option>
            <option value="occupé">Occupés</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <FreelancePreview key={user._id} freelance={user} />
        ))}
      </div>
    </div>
  );
} 