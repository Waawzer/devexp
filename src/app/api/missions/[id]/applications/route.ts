import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Mission from '@/models/Mission';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { message } = await req.json();

    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json({ message: 'Mission non trouvée' }, { status: 404 });
    }

    // Vérifier si l'utilisateur n'est pas déjà le créateur de la mission
    if (mission.creatorId.toString() === session.user.id) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas candidater à votre propre mission' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà assigné à la mission
    if (mission.assignedTo && mission.assignedTo.toString() === session.user.id) {
      return NextResponse.json(
        { message: 'Vous êtes déjà assigné à cette mission' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur n'a pas déjà une candidature active
    const existingApplication = mission.applications?.find(
      app => app.user.toString() === session.user.id && 
            (app.status === 'en_attente' || app.status === 'acceptée')
    );
    if (existingApplication) {
      return NextResponse.json(
        { message: 'Vous avez déjà une candidature active pour cette mission' },
        { status: 400 }
      );
    }

    // Créer la notification pour le créateur de la mission
    await Notification.create({
      type: 'mission_application',
      from: session.user.id,
      to: mission.creatorId,
      missionId: mission._id,
      title: 'Nouvelle candidature',
      message: `${session.user.name} a postulé à votre mission "${mission.title}"`,
      status: 'pending'
    });

    // Ajouter la candidature
    const updatedMission = await Mission.findByIdAndUpdate(
      params.id,
      {
        $push: {
          applications: {
            user: session.user.id,
            message,
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

// Route pour gérer les candidatures (accepter/refuser)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { applicationId, action } = await req.json();

    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json({ message: 'Mission non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le créateur de la mission
    if (mission.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Seul le créateur de la mission peut gérer les candidatures' },
        { status: 403 }
      );
    }

    // Trouver la candidature
    const application = mission.applications?.find(
      app => app._id.toString() === applicationId
    );

    if (!application) {
      return NextResponse.json(
        { message: 'Candidature non trouvée' },
        { status: 404 }
      );
    }

    if (action === 'accept') {
      // Si la mission est déjà assignée à quelqu'un d'autre
      if (mission.assignedTo && mission.assignedTo.toString() !== application.user.toString()) {
        return NextResponse.json(
          { message: 'Cette mission est déjà assignée à un autre utilisateur' },
          { status: 400 }
        );
      }

      // Accepter la candidature et assigner la mission
      const updatedMission = await Mission.findByIdAndUpdate(
        params.id,
        {
          assignedTo: application.user,
          $set: {
            'applications.$[elem].status': 'acceptée'
          }
        },
        {
          arrayFilters: [{ 'elem._id': applicationId }],
          new: true
        }
      ).populate('applications.user', 'name image');

      // Créer une notification pour l'utilisateur dont la candidature a été acceptée
      await Notification.create({
        type: 'mission_application_accepted',
        from: session.user.id,
        to: application.user,
        missionId: mission._id,
        title: 'Candidature acceptée',
        message: `Votre candidature pour la mission "${mission.title}" a été acceptée`,
        status: 'pending'
      });

      return NextResponse.json(updatedMission);
    } else if (action === 'reject') {
      // Refuser la candidature
      const updatedMission = await Mission.findByIdAndUpdate(
        params.id,
        {
          $set: {
            'applications.$[elem].status': 'refusée'
          }
        },
        {
          arrayFilters: [{ 'elem._id': applicationId }],
          new: true
        }
      ).populate('applications.user', 'name image');

      // Créer une notification pour l'utilisateur dont la candidature a été refusée
      await Notification.create({
        type: 'mission_application_rejected',
        from: session.user.id,
        to: application.user,
        missionId: mission._id,
        title: 'Candidature refusée',
        message: `Votre candidature pour la mission "${mission.title}" a été refusée`,
        status: 'pending'
      });

      return NextResponse.json(updatedMission);
    } else {
      return NextResponse.json(
        { message: 'Action non reconnue' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la gestion de la candidature' },
      { status: 500 }
    );
  }
}

// Route pour récupérer les candidatures d'une mission
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json({ message: 'Mission non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le créateur de la mission
    if (mission.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Seul le créateur de la mission peut voir les candidatures' },
        { status: 403 }
      );
    }

    // Récupérer la mission avec les candidatures peuplées
    const missionWithApplications = await Mission.findById(params.id)
      .populate('applications.user', 'name image');

    return NextResponse.json(missionWithApplications.applications || []);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des candidatures' },
      { status: 500 }
    );
  }
} 