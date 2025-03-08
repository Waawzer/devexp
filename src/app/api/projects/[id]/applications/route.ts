import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { message, type, targetUserId } = await req.json();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Cas d'une proposition de mission (du propriétaire vers un utilisateur)
    if (type === 'mission_proposal') {
      // Vérifier que l'utilisateur est le propriétaire du projet
      if (project.userId.toString() !== session.user.id) {
        return NextResponse.json(
          { message: 'Non autorisé à faire des propositions pour ce projet' },
          { status: 403 }
        );
      }

      // Vérifier si l'utilisateur cible existe et est disponible
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
      }

      if (targetUser.availability === 'occupé') {
        return NextResponse.json(
          { message: 'L\'utilisateur n\'est pas disponible pour des missions' },
          { status: 400 }
        );
      }

      // Créer la notification
      await Notification.create({
        type: 'mission_proposal',
        from: session.user.id,
        to: targetUserId,
        projectId: project._id,
        title: 'Nouvelle proposition de mission',
        message: `${session.user.name} vous propose une mission sur le projet "${project.title}"`,
        status: 'pending'
      });

      // Ajouter la proposition au projet
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
      ).populate('applications.user', 'name image');

      return NextResponse.json({
        message: 'Proposition de mission envoyée avec succès',
        project: updatedProject
      });
    }

    // Cas d'une candidature spontanée (d'un utilisateur vers le projet)
    // Vérifier si l'utilisateur n'a pas déjà une candidature active
    const existingApplication = project.applications?.find(
      app => app.user.toString() === session.user.id && 
            (app.status === 'en_attente' || app.status === 'accepté')
    );
    if (existingApplication) {
      return NextResponse.json(
        { message: 'Vous avez déjà une candidature active pour ce projet' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà collaborateur
    const isCollaborator = project.collaborators?.some(
      collab => collab.user.toString() === session.user.id
    );
    if (isCollaborator) {
      return NextResponse.json(
        { message: 'Vous êtes déjà collaborateur sur ce projet' },
        { status: 400 }
      );
    }

    // Créer la notification
    await Notification.create({
      type: 'application',
      from: session.user.id,
      to: project.userId,
      projectId: project._id,
      title: 'Nouvelle candidature',
      message: `${session.user.name} a postulé à votre projet "${project.title}"`,
      status: 'pending'
    });

    // Ajouter la candidature
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        $push: {
          applications: {
            user: session.user.id,
            message,
            type: 'application',
            status: 'en_attente',
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('applications.user', 'name image');

    return NextResponse.json(
      { message: 'Candidature envoyée avec succès' },
      { status: 200 }
    );
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

      // Logique existante pour les actions directes...
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