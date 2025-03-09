import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";
import Project from "@/models/Project";
import User from "@/models/User";
import { MissionStatus, MissionPriority } from "@/models/Mission";

// Récupérer toutes les missions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    
    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status') as MissionStatus | null;
    const priority = searchParams.get('priority') as MissionPriority | null;
    const assignedToMe = searchParams.get('assignedToMe') === 'true';
    const createdByMe = searchParams.get('createdByMe') === 'true';
    
    // Construire la requête
    const query: any = {};
    
    // Filtrer par projet si spécifié
    if (projectId) {
      query.projectId = projectId;
    }
    
    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }
    
    // Filtrer par priorité si spécifié
    if (priority) {
      query.priority = priority;
    }
    
    // Filtrer par assignation à l'utilisateur courant
    if (assignedToMe) {
      query.assignedTo = session.user.id;
    }
    
    // Filtrer par création par l'utilisateur courant
    if (createdByMe) {
      query.creatorId = session.user.id;
    }
    
    // Si aucun filtre spécifique n'est appliqué, montrer les missions où l'utilisateur est impliqué
    if (!projectId && !assignedToMe && !createdByMe) {
      query.$or = [
        { creatorId: session.user.id },
        { assignedTo: session.user.id }
      ];
    }
    
    // Récupérer les missions
    const missions = await Mission.find(query)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id')
      .sort({ createdAt: -1 });

    return NextResponse.json(missions);
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Créer une nouvelle mission
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    // Vérifier si le projet existe si un projectId est fourni
    if (data.projectId) {
      const project = await Project.findById(data.projectId);
      if (!project) {
        return NextResponse.json(
          { message: "Projet non trouvé" },
          { status: 404 }
        );
      }
      
      // Vérifier que l'utilisateur est propriétaire ou collaborateur du projet
      const isOwner = project.userId.toString() === session.user.id;
      const isCollaborator = project.collaborators?.some(
        collab => collab.user.toString() === session.user.id
      );
      
      if (!isOwner && !isCollaborator) {
        return NextResponse.json(
          { message: "Non autorisé à créer une mission pour ce projet" },
          { status: 403 }
        );
      }
    }
    
    // Vérifier si l'utilisateur assigné existe
    if (data.assignedTo) {
      const assignedUser = await User.findById(data.assignedTo);
      if (!assignedUser) {
        return NextResponse.json(
          { message: "Utilisateur assigné non trouvé" },
          { status: 404 }
        );
      }
    }

    // Créer la mission
    const mission = await Mission.create({
      ...data,
      creatorId: session.user.id,
      createdAt: new Date(),
    });

    const populatedMission = await Mission.findById(mission._id)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id');

    return NextResponse.json(populatedMission, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la mission:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
} 