import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const { username, role } = await req.json();

    const collaborator = await User.findOne({ name: username });
    if (!collaborator) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }

    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Non autorisé à modifier ce projet" },
        { status: 403 }
      );
    }

    if (project.collaborators?.some(collab => collab.user.toString() === collaborator._id.toString())) {
      return NextResponse.json(
        { message: "Cet utilisateur est déjà collaborateur" },
        { status: 400 }
      );
    }

    project.collaborators = [
      ...(project.collaborators || []),
      { user: collaborator._id, role }
    ];
    await project.save();

    const updatedProject = await Project.findById(params.id)
      .populate('collaborators.user', 'name _id');

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