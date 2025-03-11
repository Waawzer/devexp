import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/hooks/useNotifications';

interface MissionProposalActionsProps {
  projectId: string;
  applicationId: string;
  targetUserId: string;
  notificationId?: string;
  onActionComplete: () => void;
}

export default function MissionProposalActions({ 
  projectId, 
  applicationId, 
  targetUserId,
  notificationId,
  onActionComplete 
}: MissionProposalActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { markNotificationAsRead } = useNotifications();

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

      if (notificationId) {
        await markNotificationAsRead(notificationId, action === 'accept' ? 'accepted' : 'rejected');
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
    <div className="flex gap-4 mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <button
        onClick={() => handleAction('accept')}
        disabled={isLoading}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg 
                 hover:from-green-600 hover:to-emerald-600 transform hover:-translate-y-0.5 
                 transition-all duration-300 disabled:opacity-50"
      >
        Accepter la mission
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={isLoading}
        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg 
                 hover:from-red-600 hover:to-pink-600 transform hover:-translate-y-0.5 
                 transition-all duration-300 disabled:opacity-50"
      >
        Refuser la mission
      </button>
    </div>
  );
} 