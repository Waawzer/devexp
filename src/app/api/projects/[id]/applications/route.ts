import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { handleApplication } from '@/lib/services/applicationService';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    
    const { message, targetUserId, type = 'application' } = await req.json();
    
    // Si c'est une proposition de mission à un utilisateur
    if (type === 'mission_proposal' && targetUserId) {
      // Garder la logique existante pour les propositions de mission
      // Cette partie est spécifique et ne sera pas consolidée pour l'instant
      const project = await Project.findById(params.id);
      if (!project) {
        return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
      }

      // Vérifier que l'utilisateur est le propriétaire du projet
      if (project.userId.toString() !== session.user.id) {
        return NextResponse.json(
          { message: 'Seul le propriétaire du projet peut proposer des missions' },
          { status: 403 }
        );
      }

      // Vérifier que l'utilisateur cible existe
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ message: 'Utilisateur cible non trouvé' }, { status: 404 });
      }

      // Créer une application de type mission_proposal
      const updatedProject = await Project.findByIdAndUpdate(
        params.id,
        {
          $push: {
            applications: {
              user: targetUserId,
              message,
              type: 'mission_proposal',
              status: 'en_attente',
              createdAt: new Date()
            }
          }
        },
        { new: true }
      );

      // Créer une notification pour l'utilisateur cible
      await Notification.create({
        type: 'mission_proposal',
        from: session.user.id,
        to: targetUserId,
        projectId: params.id,
        missionId: null, // Pas de mission associée pour l'instant
        title: 'Proposition de mission',
        message: `Vous avez reçu une proposition de mission pour le projet "${project.title}"`,
        status: 'pending'
      });

      return NextResponse.json(updatedProject);
    } 
    // Pour les candidatures standard, utiliser le service
    else {
      const project = await Project.findById(params.id);
      if (!project) {
        return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
      }

      // Utiliser le service applicationService
      const result = await handleApplication({
        type: 'project',
        itemId: params.id,
        userId: session.user.id,
        message,
        model: Project,
        creatorId: project.userId,
        itemTitle: project.title
      });

      if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 400 });
      }

      return NextResponse.json(result.item);
    }
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi de la candidature' },
      { status: 500 }
    );
  }
}

// Route pour mettre à jour le statut d'une candidature
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { notificationId, userId, action, type } = await req.json();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Si c'est une notification, vérifier que l'utilisateur est le destinataire
    if (notificationId) {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return NextResponse.json({ message: 'Notification non trouvée' }, { status: 404 });
      }

      // Vérifier que l'utilisateur est bien le destinataire de la notification
      if (notification.to.toString() !== session.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
      }

      // Mettre à jour le statut de la notification
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      await Notification.findByIdAndUpdate(notificationId, {
        status: newStatus,
        read: true
      });

      if (action === 'accept') {
        // Ajouter l'utilisateur comme collaborateur
        await Project.findByIdAndUpdate(
          params.id,
          {
            $push: {
              collaborators: {
                user: session.user.id,
                role: 'developer',
                joinedAt: new Date()
              }
            },
            $set: {
              'applications.$[elem].status': 'accepté'
            }
          },
          {
            arrayFilters: [{ 'elem.user': session.user.id }],
            new: true
          }
        );
      } else {
        // Mettre à jour le statut de la candidature comme refusée
        await Project.findByIdAndUpdate(
          params.id,
          {
            $set: {
              'applications.$[elem].status': 'refusé'
            }
          },
          {
            arrayFilters: [{ 'elem.user': session.user.id }],
            new: true
          }
        );
      }
    } else {
      // Pour les actions directes, vérifier que l'utilisateur est le propriétaire du projet
      if (project.userId.toString() !== session.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
      }

      // AJOUTER CETTE LOGIQUE POUR LES ACTIONS DIRECTES
      if (action === 'accept') {
        // Déterminer le rôle (utiliser 'developer' par défaut)
        const role = type === 'mission_proposal' ? 'developer' : 'developer';
        
        // Ajouter l'utilisateur comme collaborateur et mettre à jour le statut de sa candidature
        await Project.findByIdAndUpdate(
          params.id,
          {
            $push: {
              collaborators: {
                user: userId,
                role: role
              }
            },
            $set: {
              'applications.$[elem].status': 'accepté'
            }
          },
          {
            arrayFilters: [{ 'elem.user': userId }],
            new: true
          }
        );
        
        // Créer une notification pour informer l'utilisateur
        await Notification.create({
          type: 'application_accepted',
          from: session.user.id,
          to: userId,
          projectId: project._id,
          title: 'Candidature acceptée',
          message: `Votre candidature pour le projet "${project.title}" a été acceptée`,
          status: 'pending'
        });
      } else if (action === 'reject') {
        // Mettre à jour le statut de la candidature comme refusée
        await Project.findByIdAndUpdate(
          params.id,
          {
            $set: {
              'applications.$[elem].status': 'refusé'
            }
          },
          {
            arrayFilters: [{ 'elem.user': userId }],
            new: true
          }
        );
        
        // Créer une notification pour informer l'utilisateur
        await Notification.create({
          type: 'application_rejected',
          from: session.user.id,
          to: userId,
          projectId: project._id,
          title: 'Candidature refusée',
          message: `Votre candidature pour le projet "${project.title}" a été refusée`,
          status: 'pending'
        });
      }
    }

    const updatedProject = await Project.findById(params.id)
      .populate('collaborators.user', 'name _id')
      .populate('applications.user', 'name image');

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// Route pour récupérer les candidatures d'un projet
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('notificationId');

    await dbConnect();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Si pas de notificationId, retourner toutes les applications
    if (!notificationId) {
      return NextResponse.json(project.applications || []);
    }

    // Vérifier si la notification existe
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.to.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Notification non trouvée' }, { status: 404 });
    }

    // Trouver l'application correspondante
    const application = project.applications?.find(
      app => app.user.toString() === session.user.id && app.type === 'mission_proposal'
    );

    if (!application) {
      return NextResponse.json({ message: 'Proposition non trouvée' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la proposition' },
      { status: 500 }
    );
  }
} 