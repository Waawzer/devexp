import { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

interface ProjectFiltersProps {
  filters: {
    projectType: string;
    skills: string[];
    searchTerm: string;
  };
  availableSkills: string[];
  onFilterChange: (newFilters: any) => void;
  onReset: () => void;
}

export default function ProjectFilters({ 
  filters, 
  availableSkills, 
  onFilterChange, 
  onReset 
}: ProjectFiltersProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const toggleSkillFilter = (skill: string) => {
    onFilterChange({
      ...filters,
      skills: filters.skills.includes(skill)
        ? filters.skills.filter(s => s !== skill)
        : [...filters.skills, skill]
    });
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Barre de recherche avec icône */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 
                     focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          />
        </div>

        {/* Bouton pour ouvrir/fermer les filtres sur mobile */}
        <button
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaFilter />
          <span>Filtres</span>
        </button>

        {/* Conteneur des filtres */}
        <div className={`
          md:flex flex-wrap gap-6
          ${isFilterMenuOpen ? 'block' : 'hidden md:block'}
        `}>
          {/* Type de projet */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Type de projet</h3>
            <select
              value={filters.projectType}
              onChange={(e) => onFilterChange({ ...filters, projectType: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 
                       focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
            >
              <option value="tous">Tous les projets</option>
              <option value="personnel">Projets personnels</option>
              <option value="collaboratif">Projets collaboratifs</option>
            </select>
          </div>

          {/* Compétences */}
          <div className="flex-[2] min-w-[300px] space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Compétences requises</h3>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                            transform hover:-translate-y-0.5 ${
                    filters.skills.includes(skill)
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        {(filters.skills.length > 0 || filters.projectType !== 'tous' || filters.searchTerm) && (
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Filtres actifs :</span>
            <div className="flex flex-wrap gap-2">
              {filters.projectType !== 'tous' && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                               bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                  {filters.projectType === 'personnel' ? 'Projets personnels' : 'Projets collaboratifs'}
                  <button
                    onClick={() => onFilterChange({ ...filters, projectType: 'tous' })}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
              {filters.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                           bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkillFilter(skill)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
              {filters.searchTerm && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                               bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                  Recherche: {filters.searchTerm}
                  <button
                    onClick={() => onFilterChange({ ...filters, searchTerm: '' })}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={onReset}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Réinitialiser tout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 