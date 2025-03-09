import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";
import Project from "@/models/Project";

// Ajouter un commentaire à une mission
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const { content } = await req.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: "Le contenu du commentaire est requis" },
        { status: 400 }
      );
    }
    
    // Récupérer la mission
    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json({ message: "Mission non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est autorisé à commenter cette mission
    const isCreator = mission.creatorId.toString() === session.user.id;
    const isAssigned = mission.assignedTo && mission.assignedTo.toString() === session.user.id;
    
    // Si la mission est liée à un projet, vérifier si l'utilisateur est propriétaire ou collaborateur
    let isProjectMember = false;
    if (mission.projectId) {
      const project = await Project.findById(mission.projectId);
      if (project) {
        const isProjectOwner = project.userId.toString() === session.user.id;
        const isProjectCollaborator = project.collaborators?.some(
          collab => collab.user.toString() === session.user.id
        );
        isProjectMember = isProjectOwner || isProjectCollaborator;
      }
    }

    if (!isCreator && !isAssigned && !isProjectMember) {
      return NextResponse.json(
        { message: "Non autorisé à commenter cette mission" },
        { status: 403 }
      );
    }

    // Ajouter le commentaire
    const comment = {
      userId: session.user.id,
      content,
      createdAt: new Date()
    };
    
    const updatedMission = await Mission.findByIdAndUpdate(
      params.id,
      { $push: { comments: comment } },
      { new: true }
    )
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id')
      .populate('comments.userId', 'name _id image');

    return NextResponse.json(updatedMission);
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
} 