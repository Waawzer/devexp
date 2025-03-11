import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";
import User from "@/models/User";
import Project from "@/models/Project";

// Add interface for collaborator
interface Collaborator {
  user: any;
}

// Récupérer une mission spécifique
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    
    const mission = await Mission.findById(params.id)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id')
      .populate('comments.userId', 'name _id image');

    if (!mission) {
      return NextResponse.json({ message: "Mission non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est autorisé à voir cette mission
    const isCreator = mission.creatorId._id.toString() === session.user.id;
    const isAssigned = mission.assignedTo && mission.assignedTo._id.toString() === session.user.id;
    
    // Si la mission est liée à un projet, vérifier si l'utilisateur est propriétaire ou collaborateur
    let isProjectMember = false;
    if (mission.projectId) {
      const project = await Project.findById(mission.projectId);
      if (project) {
        const isProjectOwner = project.userId.toString() === session.user.id;
        const isProjectCollaborator = project.collaborators?.some(
          (collab: Collaborator) => collab.user.toString() === session.user.id
        );
        isProjectMember = isProjectOwner || isProjectCollaborator;
      }
    }

    if (!isCreator && !isAssigned && !isProjectMember) {
      return NextResponse.json({ message: "Non autorisé à voir cette mission" }, { status: 403 });
    }

    return NextResponse.json(mission);
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Mettre à jour une mission
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    // Récupérer la mission existante
    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json({ message: "Mission non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est autorisé à modifier cette mission
    const isCreator = mission.creatorId.toString() === session.user.id;
    const isAssigned = mission.assignedTo && mission.assignedTo.toString() === session.user.id;
    
    // Si la mission est liée à un projet, vérifier si l'utilisateur est propriétaire
    let isProjectOwner = false;
    if (mission.projectId) {
      const project = await Project.findById(mission.projectId);
      if (project) {
        isProjectOwner = project.userId.toString() === session.user.id;
      }
    }

    // Déterminer quels champs l'utilisateur peut modifier
    const canModifyAll = isCreator || isProjectOwner;
    const canModifyStatus = isAssigned || canModifyAll;
    
    // Si l'utilisateur n'est pas autorisé à modifier tous les champs
    if (!canModifyAll) {
      // Si l'utilisateur est assigné, il peut uniquement modifier le statut et les heures complétées
      if (isAssigned) {
        const allowedFields = ['status', 'completedHours', 'comments'];
        const attemptedFields = Object.keys(data);
        
        const unauthorizedFields = attemptedFields.filter(field => !allowedFields.includes(field));
        if (unauthorizedFields.length > 0) {
          return NextResponse.json(
            { message: `Non autorisé à modifier les champs: ${unauthorizedFields.join(', ')}` },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { message: "Non autorisé à modifier cette mission" },
          { status: 403 }
        );
      }
    }
    
    // Vérifier si l'utilisateur assigné existe
    if (data.assignedTo && data.assignedTo !== mission.assignedTo?.toString()) {
      const assignedUser = await User.findById(data.assignedTo);
      if (!assignedUser) {
        return NextResponse.json(
          { message: "Utilisateur assigné non trouvé" },
          { status: 404 }
        );
      }
    }
    
    // Mettre à jour les champs spécifiques
    const updateData: any = {};
    
    // Champs que tout le monde peut modifier
    if (data.status !== undefined && canModifyStatus) {
      updateData.status = data.status;
      
      // Mettre à jour les dates de début et de fin en fonction du statut
      if (data.status === 'en cours' && !mission.startedAt) {
        updateData.startedAt = new Date();
      }
      
      if (data.status === 'terminée' && !mission.completedAt) {
        updateData.completedAt = new Date();
      }
    }
    
    if (data.completedHours !== undefined && isAssigned) {
      updateData.completedHours = data.completedHours;
    }
    
    // Champs que seuls le créateur ou le propriétaire du projet peuvent modifier
    if (canModifyAll) {
      const allowedFields = [
        'title', 'description', 'skills', 'deadline', 'estimatedHours',
        'priority', 'assignedTo', 'attachments'
      ];
      
      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });
    }
    
    // Ajouter un commentaire si fourni
    if (data.newComment) {
      const comment = {
        userId: session.user.id,
        content: data.newComment,
        createdAt: new Date()
      };
      
      updateData.$push = { comments: comment };
    }
    
    // Mettre à jour la mission
    const updatedMission = await Mission.findByIdAndUpdate(
      params.id,
      updateData,
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

// Supprimer une mission
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    
    // Récupérer la mission
    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json({ message: "Mission non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est autorisé à supprimer cette mission
    const isCreator = mission.creatorId.toString() === session.user.id;
    
    // Si la mission est liée à un projet, vérifier si l'utilisateur est propriétaire
    let isProjectOwner = false;
    if (mission.projectId) {
      const project = await Project.findById(mission.projectId);
      if (project) {
        isProjectOwner = project.userId.toString() === session.user.id;
      }
    }

    if (!isCreator && !isProjectOwner) {
      return NextResponse.json(
        { message: "Non autorisé à supprimer cette mission" },
        { status: 403 }
      );
    }

    // Supprimer la mission
    await Mission.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Mission supprimée avec succès" });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
} 