import { useState } from 'react';

interface Collaborator {
  user: {
    _id: string;
    username: string;
  };
  role: string;
}

interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCollaboratorAdded: () => void;
  currentCollaborators: Collaborator[];
}

export default function AddCollaboratorModal({
  isOpen,
  onClose,
  projectId,
  onCollaboratorAdded,
  currentCollaborators
}: AddCollaboratorModalProps) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Développeur');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['Développeur', 'Marketing', 'Designer', 'Chef de projet'];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'ajout du collaborateur');
      }

      onCollaboratorAdded();
      setUsername('');
      setRole('Développeur');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Collaborateurs du projet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Liste des collaborateurs actuels */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Collaborateurs actuels</h3>
          <div className="space-y-2">
            {currentCollaborators.map((collab) => (
              <div 
                key={collab.user._id} 
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{collab.user.username}</span>
                <span className="text-sm text-gray-600">{collab.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez le nom d'utilisateur"
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
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 