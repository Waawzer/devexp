import { useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';

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
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  
  const toggleSkillFilter = (skill: string) => {
    onFilterChange({
      ...filters,
      skills: filters.skills.includes(skill)
        ? filters.skills.filter(s => s !== skill)
        : [...filters.skills, skill]
    });
  };
  
  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md p-3 mb-5 border border-gray-700/30 transition-all duration-300">
      <div className="flex flex-col gap-3">
        {/* Barre de recherche et bouton de filtre */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-700/50 bg-gray-900/60 
                       text-gray-300 placeholder-gray-500
                       focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 
                       transition-all duration-300"
            />
            {filters.searchTerm && (
              <button
                onClick={() => onFilterChange({ ...filters, searchTerm: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/60 border border-gray-700/50 
                     text-gray-300 hover:border-indigo-500/30 transition-all duration-300"
          >
            <FaFilter size={14} />
            <span className="text-sm">Filtres</span>
            <FaChevronDown 
              size={12} 
              className={`text-gray-500 transition-transform duration-300 ${isFilterMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Conteneur des filtres avancés */}
        {isFilterMenuOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-700/30">
            {/* Type de projet */}
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-gray-400">Type de projet</h3>
              <select
                value={filters.projectType}
                onChange={(e) => onFilterChange({ ...filters, projectType: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-700/50 bg-gray-900/60 
                         text-gray-300 text-sm focus:border-indigo-500/50 focus:ring-1 
                         focus:ring-indigo-500/20 transition-all duration-300"
              >
                <option value="tous">Tous les projets</option>
                <option value="personnel">Projets personnels</option>
                <option value="collaboratif">Projets collaboratifs</option>
              </select>
            </div>

            {/* Compétences */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-medium text-gray-400">Compétences requises</h3>
                <button 
                  onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {isSkillsExpanded ? 'Réduire' : 'Voir tout'}
                </button>
              </div>
              <div className={`flex flex-wrap gap-1.5 ${isSkillsExpanded ? '' : 'max-h-10 overflow-hidden'}`}>
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 
                              ${
                      filters.skills.includes(skill)
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm'
                        : 'bg-gray-800/70 text-gray-400 border border-gray-700/50 hover:border-gray-600/70 backdrop-blur-sm'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Résumé des filtres actifs */}
        {(filters.skills.length > 0 || filters.projectType !== 'tous') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-700/30">
            <span className="text-xs text-gray-500">Filtres:</span>
            <div className="flex flex-wrap gap-1.5">
              {filters.projectType !== 'tous' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs 
                               bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
                  {filters.projectType === 'personnel' ? 'Personnels' : 'Collaboratifs'}
                  <button
                    onClick={() => onFilterChange({ ...filters, projectType: 'tous' })}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              {filters.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs 
                           bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkillFilter(skill)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              {(filters.skills.length > 0 || filters.projectType !== 'tous') && (
                <button
                  onClick={onReset}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 