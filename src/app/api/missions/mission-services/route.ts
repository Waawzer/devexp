import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Mission from '@/models/Mission';
import Project from '@/models/Project';
import User from '@/models/User';

/**
 * Route API pour les services liés aux missions
 * Cette route gère la création, modification et suppression des missions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const { action, missionData, missionId } = await req.json();

    // Création d'une mission
    if (action === 'create') {
      try {
        console.log("Données reçues:", missionData);
        
        // Vérifier si le projet existe si un projectId est fourni
        if (missionData.projectId) {
          const project = await Project.findById(missionData.projectId);
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
        if (missionData.assignedTo) {
          const assignedUser = await User.findById(missionData.assignedTo);
          if (!assignedUser) {
            return NextResponse.json(
              { message: "Utilisateur assigné non trouvé" },
              { status: 404 }
            );
          }
        }

        // Créer la mission
        console.log("Création de la mission avec les données:", {
          ...missionData,
          creatorId: session.user.id,
          createdAt: new Date(),
        });
        
        const mission = await Mission.create({
          ...missionData,
          creatorId: session.user.id,
          createdAt: new Date(),
        });

        const populatedMission = await Mission.findById(mission._id)
          .populate('creatorId', 'name _id image')
          .populate('assignedTo', 'name _id image')
          .populate('projectId', 'title _id');

        return NextResponse.json(populatedMission, { status: 201 });
      } catch (error) {
        console.error("Erreur détaillée lors de la création:", error);
        throw error;
      }
    }
    
    // Modification d'une mission
    else if (action === 'update') {
      const mission = await Mission.findById(missionId);
      if (!mission) {
        return NextResponse.json(
          { message: "Mission non trouvée" },
          { status: 404 }
        );
      }

      // Vérifier que l'utilisateur est le créateur ou assigné à la mission
      const isCreator = mission.creatorId.toString() === session.user.id;
      const isAssigned = mission.assignedTo && mission.assignedTo.toString() === session.user.id;
      
      if (!isCreator && !isAssigned) {
        return NextResponse.json(
          { message: "Non autorisé à modifier cette mission" },
          { status: 403 }
        );
      }

      // Si l'utilisateur est assigné mais pas créateur, limiter les champs qu'il peut modifier
      if (!isCreator && isAssigned) {
        const allowedFields = ['status', 'completedHours'];
        const filteredData = Object.keys(missionData)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = missionData[key];
            return obj;
          }, {} as any);
          
        const updatedMission = await Mission.findByIdAndUpdate(
          missionId,
          { $set: filteredData },
          { new: true }
        )
          .populate('creatorId', 'name _id image')
          .populate('assignedTo', 'name _id image')
          .populate('projectId', 'title _id');
          
        return NextResponse.json(updatedMission);
      }

      // Si l'utilisateur est le créateur, il peut tout modifier
      const updatedMission = await Mission.findByIdAndUpdate(
        missionId,
        { $set: missionData },
        { new: true }
      )
        .populate('creatorId', 'name _id image')
        .populate('assignedTo', 'name _id image')
        .populate('projectId', 'title _id');
        
      return NextResponse.json(updatedMission);
    }
    
    // Suppression d'une mission
    else if (action === 'delete') {
      const mission = await Mission.findById(missionId);
      if (!mission) {
        return NextResponse.json(
          { message: "Mission non trouvée" },
          { status: 404 }
        );
      }

      // Vérifier que l'utilisateur est le créateur de la mission
      if (mission.creatorId.toString() !== session.user.id) {
        return NextResponse.json(
          { message: "Non autorisé à supprimer cette mission" },
          { status: 403 }
        );
      }

      await Mission.findByIdAndDelete(missionId);
      return NextResponse.json({ message: "Mission supprimée avec succès" });
    }
    
    // Ajout d'un commentaire à une mission
    else if (action === 'addComment') {
      const { content } = missionData;
      
      if (!content || !content.trim()) {
        return NextResponse.json(
          { message: "Le contenu du commentaire est requis" },
          { status: 400 }
        );
      }
      
      const mission = await Mission.findById(missionId);
      if (!mission) {
        return NextResponse.json(
          { message: "Mission non trouvée" },
          { status: 404 }
        );
      }

      // Vérifier que l'utilisateur est le créateur ou assigné à la mission
      const isCreator = mission.creatorId.toString() === session.user.id;
      const isAssigned = mission.assignedTo && mission.assignedTo.toString() === session.user.id;
      
      if (!isCreator && !isAssigned) {
        return NextResponse.json(
          { message: "Non autorisé à commenter cette mission" },
          { status: 403 }
        );
      }

      const updatedMission = await Mission.findByIdAndUpdate(
        missionId,
        {
          $push: {
            comments: {
              userId: session.user.id,
              content,
              createdAt: new Date()
            }
          }
        },
        { new: true }
      )
        .populate('creatorId', 'name _id image')
        .populate('assignedTo', 'name _id image')
        .populate('projectId', 'title _id')
        .populate('comments.userId', 'name _id image');
        
      return NextResponse.json(updatedMission);
    }
    
    // Action non reconnue
    else {
      return NextResponse.json(
        { message: "Action non reconnue" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Route pour obtenir des statistiques sur les missions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    
    // Récupérer les statistiques des missions
    const totalCreated = await Mission.countDocuments({ creatorId: session.user.id });
    const totalAssigned = await Mission.countDocuments({ assignedTo: session.user.id });
    
    // Statistiques par statut pour les missions créées
    const createdStats = await Mission.aggregate([
      { $match: { creatorId: session.user.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Statistiques par statut pour les missions assignées
    const assignedStats = await Mission.aggregate([
      { $match: { assignedTo: session.user.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Missions en retard (deadline dépassée et non terminées)
    const overdueCount = await Mission.countDocuments({
      $or: [
        { creatorId: session.user.id },
        { assignedTo: session.user.id }
      ],
      deadline: { $lt: new Date() },
      status: { $nin: ['terminée', 'annulée'] }
    });
    
    // Missions récemment mises à jour
    const recentlyUpdated = await Mission.find({
      $or: [
        { creatorId: session.user.id },
        { assignedTo: session.user.id }
      ]
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id');

    return NextResponse.json({
      totalCreated,
      totalAssigned,
      createdStats: createdStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      assignedStats: assignedStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      overdueCount,
      recentlyUpdated
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
} 