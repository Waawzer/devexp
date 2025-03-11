"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        throw new Error(data.message || 'Erreur l&apos;ajout du collaborateur');
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
      <div className="bg-gray-800 rounded-2xl w-[600px] max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
          <h2 className="text-xl font-bold text-white">Gérer les collaborateurs</h2>
        </div>
        
        {/* Onglets */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${activeTab === 'applications' 
                ? 'text-indigo-400' 
                : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('applications')}
          >
            Candidatures ({localApplications.length})
            {activeTab === 'applications' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            )}
          </button>
          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${activeTab === 'manual' 
                ? 'text-indigo-400' 
                : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('manual')}
          >
            Ajouter manuellement
            {activeTab === 'manual' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'applications' ? (
            <div className="space-y-4">
              {localApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">Aucune candidature en attente</p>
                </div>
              ) : (
                localApplications.map((application) => (
                  <div key={`${application._id || ''}-${application.user._id}`} 
                       className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {application.user.image ? (
                          <Image
                            src={application.user.image}
                            alt={application.user.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full ring-2 ring-gray-700 shadow-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 
                                      flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {application.user.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-100">{application.user.name}</h3>
                          <p className="text-sm text-gray-400">
                            Candidature du {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplicationAction(application.user._id, 'accept')}
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white 
                                   rounded-lg font-medium hover:from-emerald-600 hover:to-green-600 
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
                          className="px-4 py-2 text-indigo-400 hover:text-indigo-300 font-medium 
                                   hover:underline transition-colors"
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </div>
                    {application.message && (
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-300">{application.message}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 
                           text-gray-100 placeholder-gray-500
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                           transition-all duration-200"
                  placeholder="Entrez le nom d'utilisateur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 
                           text-gray-100
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                           transition-all duration-200"
                >
                  <option value="developer">Développeur</option>
                  <option value="designer">Designer</option>
                  <option value="project_manager">Chef de projet</option>
                  <option value="tester">Testeur</option>
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 
                    text-white rounded-xl font-medium
                    hover:from-indigo-600 hover:to-blue-600 
                    focus:ring-2 focus:ring-indigo-500/20 
                    transform transition-all duration-200 
                    hover:-translate-y-0.5
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${loading ? 'animate-pulse' : ''}
                  `}
                >
                  {loading ? 'Ajout en cours...' : 'Ajouter le collaborateur'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 