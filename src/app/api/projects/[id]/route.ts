import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    
    // Trouver d'abord le projet de base sans population pour éviter des références corrompues
    const projectBasic = await Project.findById(params.id);
    
    if (!projectBasic) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }
    
    // Vérifier les droits d'accès du projet avant de faire des requêtes supplémentaires
    let isOwner = false;
    let isCollaborator = false;
    
    if (session?.user?.id) {
      isOwner = projectBasic.userId.toString() === session.user.id;
      
      if (projectBasic.collaborators && projectBasic.collaborators.length > 0) {
        isCollaborator = projectBasic.collaborators.some(
          collab => collab.user.toString() === session.user.id
        );
      }
    }
    
    // Si c'est un projet privé et l'utilisateur n'a pas accès, renvoyer seulement les infos de base
    if (projectBasic.visibility === 'private' && !isOwner && !isCollaborator) {
      return NextResponse.json({
        _id: projectBasic._id,
        title: projectBasic.title,
        userId: projectBasic.userId,
        visibility: projectBasic.visibility,
        projectType: projectBasic.projectType,
        status: projectBasic.status,
        createdAt: projectBasic.createdAt,
      }, { status: 200 });
    }
    
    // Si nous arrivons ici, l'utilisateur a le droit de voir toutes les informations
    // Récupérer le projet avec toutes les relations peuplées
    const populatedProject = await Project.findById(params.id)
      .populate('userId', 'name _id')
      .populate({
        path: 'collaborators.user',
        select: 'name _id',
        model: 'User' // Spécifier explicitement le modèle
      })
      .populate({
        path: 'applications.user',
        select: 'name image _id',
        model: 'User' // Spécifier explicitement le modèle
      });
      
    return NextResponse.json(populatedProject);
  } catch (error) {
    console.error("Erreur API détaillée:", error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message, stack: (error as Error).stack },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à modifier ce projet' },
        { status: 403 }
      );
    }

    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true }
    );

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à supprimer ce projet' },
        { status: 403 }
      );
    }

    await Project.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
      { status: 500 }
    );
  }
}