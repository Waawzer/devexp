import { ObjectId } from 'mongoose';
import { Model } from 'mongoose';
import { createNotification } from './notificationService';

interface Application {
  user: any;
  status: string;
}

interface ApplicationParams {
  type: 'project' | 'mission';
  itemId: string;
  userId: string;
  message: string;
  model: Model<any>;
  creatorId: string;
  itemTitle: string;
}

/**
 * Gère les candidatures pour les projets et missions
 */
export async function handleApplication({
  type, // 'project' ou 'mission'
  itemId, // ID du projet ou de la mission
  userId, // ID de l'utilisateur qui postule
  message, // Message de candidature
  model, // Modèle (Project ou Mission)
  creatorId, // ID du créateur
  itemTitle // Titre du projet ou de la mission
}: ApplicationParams) {
  // Vérifier si l'utilisateur n'a pas déjà une candidature active
  const item = await model.findById(itemId);
  
  if (!item) {
    return { success: false, message: `${type === 'project' ? 'Projet' : 'Mission'} non trouvé(e)` };
  }
  
  // Vérifier si l'utilisateur n'est pas déjà le créateur
  if (item.userId?.toString() === userId || item.creatorId?.toString() === userId) {
    return { 
      success: false, 
      message: `Vous ne pouvez pas candidater à votre propre ${type === 'project' ? 'projet' : 'mission'}`
    };
  }
  
  // Vérifier si l'utilisateur n'a pas déjà une candidature active
  const existingApplication = item.applications?.find(
    (app: Application) => app.user.toString() === userId && 
          (app.status === 'en_attente' || app.status === 'accepté' || app.status === 'acceptée')
  );
  
  if (existingApplication) {
    return { 
      success: false, 
      message: `Vous avez déjà une candidature active pour ce ${type === 'project' ? 'projet' : 'mission'}`
    };
  }
  
  // Créer la notification
  await createNotification({
    type: type === 'project' ? 'application' : 'mission_application',
    from: userId,
    to: creatorId,
    projectId: type === 'project' ? itemId : undefined,
    missionId: type === 'mission' ? itemId : undefined,
    title: 'Nouvelle candidature',
    message: `Un utilisateur a postulé à votre ${type === 'project' ? 'projet' : 'mission'} "${itemTitle}"`
  });
  
  // Ajouter la candidature
  const updatedItem = await model.findByIdAndUpdate(
    itemId,
    {
      $push: {
        applications: {
          user: userId,
          message,
          type: 'application',
          status: 'en_attente',
          createdAt: new Date()
        }
      }
    },
    { new: true }
  );
  
  return { success: true, item: updatedItem };
} 