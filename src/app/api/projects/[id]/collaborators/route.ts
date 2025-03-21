import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import User from '@/models/User';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { userId, role, applicationId } = await req.json();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur actuel est le propriétaire du projet
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à modifier les collaborateurs' },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur existe avant de l'ajouter
    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Ajouter le collaborateur et supprimer la candidature
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        $push: {
          collaborators: {
            user: userId,
            role: role
          }
        },
        // Supprimer la candidature
        $pull: {
          applications: { user: userId }
        }
      },
      { new: true }
    ).populate('collaborators.user', 'name _id')
      .populate('applications.user', 'name image');

    if (!updatedProject) {
      return NextResponse.json({ message: 'Erreur lors de la mise à jour' }, { status: 400 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout du collaborateur' },
      { status: 500 }
    );
  }
}

// Ajout de la route DELETE dans le même fichier
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { userId } = await req.json();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
    }

    // Supprimer le collaborateur ET sa candidature
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        $pull: { 
          collaborators: { user: userId },
          applications: { user: userId }  // Supprimer complètement la candidature
        }
      },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du collaborateur' },
      { status: 500 }
    );
  }
} 