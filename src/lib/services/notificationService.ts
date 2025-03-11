import Notification from '@/models/Notification';
import dbConnect from '@/lib/dbConnect';
import { Schema } from 'mongoose';

interface NotificationParams {
  type: 'mission_proposal' | 'application' | 'mission_application' | 'new_message' | 'mission_assigned';
  from: Schema.Types.ObjectId | string;
  to: Schema.Types.ObjectId | string;
  projectId?: Schema.Types.ObjectId | string | undefined;
  missionId?: Schema.Types.ObjectId | string | undefined;
  messageId?: Schema.Types.ObjectId | string | undefined;
  title: string;
  message: string;
}

/**
 * Crée une notification
 */
export async function createNotification(params: NotificationParams) {
  await dbConnect();
  
  return await Notification.create({
    ...params,
    status: 'pending',
    createdAt: new Date()
  });
} 