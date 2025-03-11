import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";
import User from "@/models/User";
import { withAuth } from "@/lib/services/authService";
import { checkProjectPermissions } from "@/lib/services/projectService";
import { createNotification } from "@/lib/services/notificationService";
import { Session } from "next-auth";

// Récupérer toutes les missions avec filtres
export async function GET(req: NextRequest) {
  return withAuth(req, async (session) => {
    await dbConnect();
    
    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view'); // 'my-missions', 'assigned', ou null (toutes)
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    // Construire la requête
    const query: any = {};
    
    // Filtrer par vue
    if (view === 'my-missions') {
      // Missions que j'ai créées
      query.creatorId = session.user.id;
    } else if (view === 'assigned') {
      // Missions qui me sont assignées par d'autres
      query.assignedTo = session.user.id;
      query.creatorId = { $ne: session.user.id }; // Exclure les missions que j'ai créées
    } else {
      // Toutes les missions (vue par défaut)
      // Pas de filtre spécifique
    }
    
    // Filtrer par projet si spécifié
    if (projectId) {
      query.projectId = projectId;
    }
    
    // Filtrer par statut si spécifié
    if (status && status !== 'toutes') {
      query.status = status;
    }
    
    // Filtrer par priorité si spécifiée
    if (priority && priority !== 'toutes') {
      query.priority = priority;
    }
    
    console.log("Query:", JSON.stringify(query));
    
    // Récupérer les missions
    const missions = await Mission.find(query)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id')
      .sort({ createdAt: -1 });

    return NextResponse.json(missions);
  });
}

// Créer une nouvelle mission
export async function POST(req: NextRequest) {
  return withAuth(req, async (session) => {
    await dbConnect();
    const data = await req.json();
    
    // Si c'est une action spécifique (comme dans mission-services)
    if (data.action) {
      return handleMissionAction(req, session);
    }
    
    // Vérifier si le projet existe si un projectId est fourni
    if (data.projectId) {
      const { exists, hasEditRights } = await checkProjectPermissions(data.projectId, session.user.id);
      
      if (!exists) {
        return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
      }
      
      if (!hasEditRights) {
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

    // Si la mission est assignée, créer une notification
    if (data.assignedTo && data.assignedTo !== session.user.id) {
      await createNotification({
        type: 'mission_assigned',
        from: session.user.id,
        to: data.assignedTo,
        missionId: mission._id,
        title: 'Nouvelle mission',
        message: `${session.user.name} vous a assigné une mission: "${mission.title}"`
      });
    }

    return NextResponse.json(populatedMission, { status: 201 });
  });
}

// Gérer les actions spécifiques de mission (anciennement dans mission-services)
async function handleMissionAction(req: NextRequest, session: Session) {
  const { action, missionData, missionId } = await req.json();
  
  // Rediriger vers les endpoints appropriés
  switch (action) {
    case 'create':
      // Créer une nouvelle mission
      return createMission(missionData, session);
      
    case 'update':
      // Mettre à jour une mission existante
      const updateUrl = new URL(`/api/missions/${missionId}`, req.url);
      const updateRequest = new Request(updateUrl, {
        method: 'PUT',
        headers: req.headers,
        body: JSON.stringify(missionData)
      });
      return fetch(updateRequest);
      
    case 'delete':
      // Supprimer une mission
      const deleteUrl = new URL(`/api/missions/${missionId}`, req.url);
      const deleteRequest = new Request(deleteUrl, {
        method: 'DELETE',
        headers: req.headers
      });
      return fetch(deleteRequest);
      
    case 'addComment':
      // Ajouter un commentaire
      const commentUrl = new URL(`/api/missions/${missionId}/comments`, req.url);
      const commentRequest = new Request(commentUrl, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify({ content: missionData.content })
      });
      return fetch(commentRequest);
      
    default:
      return NextResponse.json(
        { message: "Action non reconnue" },
        { status: 400 }
      );
  }
}

// Fonction auxiliaire pour créer une mission
async function createMission(missionData: any, session: Session) {
  await dbConnect();
  
  // Vérifier si le projet existe si un projectId est fourni
  if (missionData.projectId) {
    const { exists, hasEditRights } = await checkProjectPermissions(missionData.projectId, session.user.id);
    
    if (!exists) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    
    if (!hasEditRights) {
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
  const mission = await Mission.create({
    ...missionData,
    creatorId: session.user.id,
    createdAt: new Date(),
  });

  const populatedMission = await Mission.findById(mission._id)
    .populate('creatorId', 'name _id image')
    .populate('assignedTo', 'name _id image')
    .populate('projectId', 'title _id');

  // Si la mission est assignée, créer une notification
  if (missionData.assignedTo && missionData.assignedTo !== session.user.id) {
    await createNotification({
      type: 'mission_assigned',
      from: session.user.id,
      to: missionData.assignedTo,
      missionId: mission._id,
      title: 'Nouvelle mission',
      message: `${session.user.name} vous a assigné une mission: "${mission.title}"`
    });
  }

  return NextResponse.json(populatedMission, { status: 201 });
} 