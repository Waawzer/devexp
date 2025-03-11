import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MessageNotificationActionsProps {
  messageId: string;
  senderId: string;
  onActionComplete: () => void;
}

export default function MessageNotificationActions({ 
  messageId, 
  senderId,
  onActionComplete 
}: MessageNotificationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleViewMessage = async () => {
    setIsLoading(true);
    try {
      // Marquer le message comme lu
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement de la réponse');
      }

      // Rediriger vers la conversation
      router.push(`/messages?user=${senderId}`);
      onActionComplete();
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIgnore = () => {
    onActionComplete();
  };

  return (
    <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
      <button
        onClick={handleViewMessage}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Voir le message
      </button>
      <button
        onClick={handleIgnore}
        disabled={isLoading}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
      >
        Ignorer
      </button>
    </div>
  );
} 