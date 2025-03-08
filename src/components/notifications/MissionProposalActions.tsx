import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface MissionProposalActionsProps {
  projectId: string;
  applicationId: string;
  targetUserId: string;
  onActionComplete: () => void;
}

export default function MissionProposalActions({ 
  projectId, 
  applicationId, 
  targetUserId,
  onActionComplete 
}: MissionProposalActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const isTargetUser = session?.user?.id === targetUserId;

  if (!isTargetUser) {
    return null;
  }

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/applications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: action === 'accept' ? 'accepté' : 'refusé',
          action: 'mission_proposal_response'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement de la réponse');
      }

      toast.success(action === 'accept' ? 
        'Vous avez accepté la proposition de mission' : 
        'Vous avez refusé la proposition de mission'
      );
      onActionComplete();
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
      <button
        onClick={() => handleAction('accept')}
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        Accepter la mission
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={isLoading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        Refuser la mission
      </button>
    </div>
  );
} 