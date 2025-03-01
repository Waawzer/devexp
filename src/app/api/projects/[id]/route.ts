import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { authService } from '@/services/authService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const project = await Project.findById(params.id)
      .populate('userId', 'username _id');
    
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Transformer le projet pour inclure le userId directement
    const projectData = {
      ...project.toObject(),
      userId: project.userId._id, // Garder l'ID original
      creator: {
        _id: project.userId._id,
        username: project.userId.username
      }
    };

    console.log("Projet envoyé:", projectData); // Pour debug
    
    return NextResponse.json(projectData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du projet', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    const project = await Project.findById(params.id);

    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier si l'utilisateur est le propriétaire du projet
    if (project.userId.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
    }

    const { title, description, skills, githubUrl } = await req.json();
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        skills,
        githubUrl
      },
      { new: true }
    );
    
    return NextResponse.json({ message: 'Projet mis à jour', project: updatedProject }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du projet", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {

    const project = await Project.findByIdAndDelete(params.id);
    
    if (!project) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Projet supprimé' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Non autorisé', error: (error as Error).message }, { status: 403 });
  }
}