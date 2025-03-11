import { useState } from 'react';
import { FaFilter, FaSort, FaSearch, FaTimes } from 'react-icons/fa';

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
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Filtrer et trier</h2>
          <p className="text-gray-400">Affinez votre liste de missions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
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
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-xl shadow-xl z-20 p-4 border border-gray-700">
                  <h3 className="font-medium text-gray-300 mb-3">Filtrer par</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Statut
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Priorité
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="toutes">Toutes les priorités</option>
                        <option value="basse">Basse</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="haute">Haute</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <button
                        onClick={onResetFilters}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Réinitialiser
                      </button>
                      <button
                        onClick={() => {
                          onApplyFilters();
                          setIsFilterMenuOpen(false);
                        }}
                        className="text-sm bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-3 py-1 rounded hover:from-indigo-600 hover:to-blue-600"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
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
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl z-20 p-2 border border-gray-700">
                  <button
                    onClick={() => {
                      onSortChange('createdAt', sortBy === 'createdAt' && sortOrder === 'desc' ? 'asc' : 'desc');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg flex justify-between items-center"
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
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg flex justify-between items-center"
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
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg flex justify-between items-center"
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
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg flex justify-between items-center"
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

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une mission..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
          className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 placeholder-gray-500
                   focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-500" />
        </div>
        {filters.searchTerm && (
          <button
            onClick={() => onFilterChange({ ...filters, searchTerm: '' })}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FaTimes className="h-5 w-5 text-gray-500 hover:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
} 