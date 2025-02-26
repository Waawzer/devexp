import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur lors de la récupération du projet', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const decoded = await verifyAuth(req);
    const { title, description } = await req.json();
    const project = await Project.findByIdAndUpdate(
      params.id,
      { title, description },
      { new: true }
    );
    
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Projet mis à jour', project }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Non autorisé', error: (error as Error).message }, { status: 403 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const decoded = await verifyAuth(req);
    const project = await Project.findByIdAndDelete(params.id);
    
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Projet supprimé' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Non autorisé', error: (error as Error).message }, { status: 403 });
  }
}