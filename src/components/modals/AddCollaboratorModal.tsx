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
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  message: string;
  status: 'en_attente' | 'accepté' | 'refusé';
  createdAt: string;
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
  const [localApplications, setLocalApplications] = useState(applications);
  const [activeTab, setActiveTab] = useState<'manual' | 'applications'>('applications');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mettre à jour localApplications quand applications change
  useEffect(() => {
    setLocalApplications(applications);
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

  const handleAcceptApplication = async (userId: string) => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: 'développeur',
          applicationId: userId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'ajout du collaborateur');
      }

      // Mettre à jour l'état local en supprimant la candidature acceptée
      setLocalApplications(prev => prev.filter(app => app.user._id !== userId));
      
      // Rafraîchir les données du projet
      onCollaboratorAdded();

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Gérer les collaborateurs</h2>
        
        {/* Onglets */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'applications' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Candidatures ({localApplications.length})
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'manual' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Ajouter manuellement
          </button>
        </div>

        {activeTab === 'applications' ? (
          <div className="space-y-4">
            {localApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune candidature en attente</p>
            ) : (
              localApplications.map((application) => (
                <div key={application.user._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {application.user.image && (
                        <img
                          src={application.user.image}
                          alt={application.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{application.user.name}</h3>
                        <p className="text-sm text-gray-500">
                          Candidature envoyée {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptApplication(application.user._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Accepter
                      </button>
                      <Link
                        href={`/profile/${application.user._id}`}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Voir le profil
                      </Link>
                    </div>
                  </div>
                  {application.message && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {application.message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="developer">Développeur</option>
                <option value="designer">Designer</option>
                <option value="project_manager">Chef de projet</option>
              </select>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 