import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { authService } from '@/services/authService';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    const { username, role } = await req.json();

    // Vérifier si l'utilisateur existe
    const collaborator = await User.findOne({ username });
    if (!collaborator) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le projet existe et si l'utilisateur est le propriétaire
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }

    if (project.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Non autorisé à modifier ce projet" },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà collaborateur
    if (project.collaborators?.some(collab => collab.user.toString() === collaborator._id.toString())) {
      return NextResponse.json(
        { message: "Cet utilisateur est déjà collaborateur" },
        { status: 400 }
      );
    }

    // Ajouter le collaborateur avec son rôle
    project.collaborators = [
      ...(project.collaborators || []),
      { user: collaborator._id, role }
    ];
    await project.save();

    // Recharger le projet avec les données des collaborateurs
    const updatedProject = await Project.findById(params.id)
      .populate('collaborators.user', 'username _id');

    return NextResponse.json({
      message: "Collaborateur ajouté avec succès",
      project: updatedProject
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'ajout du collaborateur" },
      { status: 500 }
    );
  }
} 