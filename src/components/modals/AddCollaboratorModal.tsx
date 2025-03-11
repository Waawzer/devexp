"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Collaborator {
  user: {
    _id: string;
    username: string;
  };
  role: string;
}

interface Application {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  message: string;
  status: 'en_attente' | 'accepté' | 'refusé';
  createdAt: string;
  type: 'application' | 'mission_proposal';
}

interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCollaboratorAdded: () => void;
  currentCollaborators: Collaborator[];
  applications?: Application[];
}

export default function AddCollaboratorModal({
  isOpen,
  onClose,
  projectId,
  onCollaboratorAdded,
  currentCollaborators,
  applications = []
}: AddCollaboratorModalProps) {
  const [localApplications, setLocalApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'applications'>('applications');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Applications reçues:', applications);
    // Filtrer pour n'avoir que les candidatures en attente
    const filteredApplications = applications.filter(
      (app: Application) => 
        app.status === 'en_attente' && 
        (!app.type || app.type === 'application')
    );
    console.log('Applications filtrées:', filteredApplications);
    setLocalApplications(filteredApplications);
  }, [applications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'ajout du collaborateur');
      }

      onCollaboratorAdded();
      onClose();
      setUsername('');
      setRole('developer');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (userId: string, action: 'accept' | 'reject') => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch(`/api/projects/${projectId}/applications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          type: 'application'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Erreur lors du traitement de la candidature`);
      }

      // Mettre à jour l'état local immédiatement
      setLocalApplications(prev => prev.filter(app => app.user._id !== userId));
      
      // Rafraîchir les données du projet
      onCollaboratorAdded();

    } catch (error) {
      setError((error as Error).message);
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[600px] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
          <h2 className="text-xl font-bold text-white">Gérer les collaborateurs</h2>
        </div>
        
        {/* Onglets */}
        <div className="flex border-b">
          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${activeTab === 'applications' 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('applications')}
          >
            Candidatures ({localApplications.length})
            {activeTab === 'applications' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            )}
          </button>
          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${activeTab === 'manual' 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('manual')}
          >
            Ajouter manuellement
            {activeTab === 'manual' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'applications' ? (
            <div className="space-y-4">
              {localApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Aucune candidature en attente</p>
                </div>
              ) : (
                localApplications.map((application) => (
                  <div key={`${application._id || ''}-${application.user._id}`} 
                       className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {application.user.image ? (
                          <img
                            src={application.user.image}
                            alt={application.user.name}
                            className="w-12 h-12 rounded-full ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 
                                      flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {application.user.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{application.user.name}</h3>
                          <p className="text-sm text-gray-500">
                            Candidature du {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplicationAction(application.user._id, 'accept')}
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white 
                                   rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 
                                   transition-all duration-200 disabled:opacity-50 transform hover:-translate-y-0.5"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.user._id, 'reject')}
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white 
                                   rounded-lg font-medium hover:from-red-600 hover:to-pink-600 
                                   transition-all duration-200 disabled:opacity-50 transform hover:-translate-y-0.5"
                        >
                          Refuser
                        </button>
                        <Link
                          href={`/profile/${application.user._id}`}
                          target="_blank"
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium 
                                   hover:underline transition-colors"
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </div>
                    {application.message && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700">{application.message}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 
                           focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 
                           focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="developer">Développeur</option>
                  <option value="designer">Designer</option>
                  <option value="project_manager">Chef de projet</option>
                </select>
              </div>
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 
                           transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 
                           text-white rounded-lg font-medium hover:from-blue-600 
                           hover:to-indigo-600 transition-all duration-200 
                           disabled:opacity-50 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Ajout en cours...
                    </span>
                  ) : "Ajouter"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 