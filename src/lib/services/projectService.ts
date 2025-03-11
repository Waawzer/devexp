import Project from '@/models/Project';
import { ObjectId } from 'mongoose';

/**
 * Vérifie si un utilisateur a des droits sur un projet
 */
export async function checkProjectPermissions(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  
  if (!project) {
    return { exists: false };
  }
  
  const isOwner = project.userId.toString() === userId;
  const isCollaborator = project.collaborators?.some(
    collab => collab.user.toString() === userId
  );
  
  return {
    exists: true,
    project,
    isOwner,
    isCollaborator,
    hasEditRights: isOwner,
    hasViewRights: isOwner || isCollaborator || project.visibility === 'public'
  };
} 