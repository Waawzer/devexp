import { useState } from 'react';
import { FaFilter, FaSort, FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';

interface MissionFiltersProps {
  filters: {
    status: string;
    priority: string;
    searchTerm: string;
  };
  sortBy: string;
  sortOrder: string;
  onFilterChange: (newFilters: any) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export default function MissionFilters({
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortChange,
  onApplyFilters,
  onResetFilters
}: MissionFiltersProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md p-3 mb-5 border border-gray-700/30 transition-all duration-300">
      {/* Barre de recherche et boutons */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher une mission..."
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

        <div className="flex gap-2">
          <div className="relative">
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

            {isFilterMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsFilterMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-64 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl z-20 p-3 border border-gray-700/50">
                  <h3 className="text-xs font-medium text-gray-400 mb-2">Filtrer par</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Statut
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="w-full p-2 bg-gray-900/80 border border-gray-700/50 rounded-lg text-sm text-gray-300 
                                 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
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
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Priorité
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
                        className="w-full p-2 bg-gray-900/80 border border-gray-700/50 rounded-lg text-sm text-gray-300 
                                 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                      >
                        <option value="toutes">Toutes les priorités</option>
                        <option value="basse">Basse</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="haute">Haute</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-gray-700/50">
                      <button
                        onClick={onResetFilters}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Réinitialiser
                      </button>
                      <button
                        onClick={() => {
                          onApplyFilters();
                          setIsFilterMenuOpen(false);
                        }}
                        className="text-xs bg-indigo-500/80 text-white px-3 py-1 rounded-lg hover:bg-indigo-500 border border-indigo-400/30"
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/60 border border-gray-700/50 
                       text-gray-300 hover:border-indigo-500/30 transition-all duration-300"
            >
              <FaSort size={14} />
              <span className="text-sm">Trier</span>
              <FaChevronDown 
                size={12} 
                className={`text-gray-500 transition-transform duration-300 ${isSortMenuOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isSortMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsSortMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl z-20 p-2 border border-gray-700/50">
                  <button
                    onClick={() => {
                      onSortChange('createdAt', sortBy === 'createdAt' && sortOrder === 'desc' ? 'asc' : 'desc');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/70 rounded-lg flex justify-between items-center"
                  >
                    <span>Date de création</span>
                    {sortBy === 'createdAt' && (
                      <span className="text-indigo-400">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSortChange('priority', sortBy === 'priority' && sortOrder === 'desc' ? 'asc' : 'desc');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/70 rounded-lg flex justify-between items-center"
                  >
                    <span>Priorité</span>
                    {sortBy === 'priority' && (
                      <span className="text-indigo-400">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSortChange('deadline', sortBy === 'deadline' && sortOrder === 'desc' ? 'asc' : 'desc');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/70 rounded-lg flex justify-between items-center"
                  >
                    <span>Date d&apos;échéance</span>
                    {sortBy === 'deadline' && (
                      <span className="text-indigo-400">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSortChange('status', sortBy === 'status' && sortOrder === 'desc' ? 'asc' : 'desc');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/70 rounded-lg flex justify-between items-center"
                  >
                    <span>Statut</span>
                    {sortBy === 'status' && (
                      <span className="text-indigo-400">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Indicateurs de filtres actifs */}
      {(filters.status !== 'toutes' || filters.priority !== 'toutes') && (
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-700/30">
          <span className="text-xs text-gray-500">Filtres actifs:</span>
          <div className="flex flex-wrap gap-1.5">
            {filters.status !== 'toutes' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs 
                             bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
                Statut: {filters.status}
                <button
                  onClick={() => {
                    onFilterChange({ ...filters, status: 'toutes' });
                    onApplyFilters();
                  }}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            )}
            {filters.priority !== 'toutes' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs 
                             bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
                Priorité: {filters.priority}
                <button
                  onClick={() => {
                    onFilterChange({ ...filters, priority: 'toutes' });
                    onApplyFilters();
                  }}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            )}
            <span className="text-xs text-gray-400">
              Trié par: <span className="text-indigo-400">{getSortLabel(sortBy)}</span> {sortOrder === 'desc' ? '↓' : '↑'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour obtenir le libellé du tri
function getSortLabel(sortBy: string): string {
  switch (sortBy) {
    case 'createdAt': return 'Date de création';
    case 'priority': return 'Priorité';
    case 'deadline': return 'Échéance';
    case 'status': return 'Statut';
    default: return sortBy;
  }
} 