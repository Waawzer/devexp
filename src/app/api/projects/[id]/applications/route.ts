import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { message } = await req.json();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier si l'utilisateur n'a pas déjà postulé
    const existingApplication = project.applications?.find(
      app => app.user.toString() === session.user.id
    );
    if (existingApplication) {
      return NextResponse.json(
        { message: 'Vous avez déjà postulé pour ce projet' },
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

    // Ajouter la candidature
    const updatedProject = await Project.findByIdAndUpdate(
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

// Route pour mettre à jour le statut d'une candidature
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { applicationId, status } = await req.json();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à modifier les candidatures' },
        { status: 403 }
      );
    }

    // Mettre à jour le statut de la candidature
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: params.id,
        'applications.user': applicationId
      },
      {
        $set: {
          'applications.$.status': status
        }
      },
      { new: true }
    ).populate('applications.user', 'name image');

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la candidature' },
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

    await dbConnect();

    const project = await Project.findById(params.id)
      .populate('applications.user', 'name image')
      .select('applications userId');

    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à voir les candidatures' },
        { status: 403 }
      );
    }

    return NextResponse.json(project.applications);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des candidatures' },
      { status: 500 }
    );
  }
} 