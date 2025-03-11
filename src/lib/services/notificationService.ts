import Notification from '@/models/Notification';
import dbConnect from '@/lib/dbConnect';

/**
 * Crée une notification
 */
export async function createNotification({
  type,
  from,
  to,
  projectId = null,
  missionId = null,
  messageId = null,
  title,
  message,
}) {
  await dbConnect();
  
  return await Notification.create({
    type,
    from,
    to,
    projectId,
    missionId,
    messageId,
    title,
    message,
    status: 'pending',
    createdAt: new Date()
  });
} 