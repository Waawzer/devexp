import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

interface MessageNotificationActionsProps {
  messageId: string;
  senderId: string;
  notificationId?: string;
  onActionComplete: () => void;
}

export default function MessageNotificationActions({ 
  messageId, 
  senderId,
  notificationId,
  onActionComplete 
}: MessageNotificationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { markMessageAsRead, markNotificationAsRead } = useNotifications();

  const handleViewMessage = async () => {
    setIsLoading(true);
    try {
      await markMessageAsRead(messageId);
      
      if (notificationId) {
        await markNotificationAsRead(notificationId);
      }

      router.push(`/messages?user=${senderId}`);
      onActionComplete();
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIgnore = async () => {
    if (notificationId) {
      try {
        await markNotificationAsRead(notificationId);
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    }
    onActionComplete();
  };

  return (
    <div className="flex gap-4 mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <button
        onClick={handleViewMessage}
        disabled={isLoading}
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg 
                 hover:from-indigo-600 hover:to-blue-600 transform hover:-translate-y-0.5 
                 transition-all duration-300 disabled:opacity-50"
      >
        Voir le message
      </button>
      <button
        onClick={handleIgnore}
        disabled={isLoading}
        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 
                 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
      >
        Ignorer
      </button>
    </div>
  );
} 