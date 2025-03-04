import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const project = await Project.findById(params.id)
      .populate('userId', 'name _id')
      .populate('collaborators.user', 'name _id');

    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
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
    ).populate('userId', 'name _id')
     .populate('collaborators.user', 'name _id');

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