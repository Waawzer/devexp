import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";

/**
 * Route API pour récupérer les missions assignées à l'utilisateur connecté
 * mais créées par d'autres utilisateurs
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session utilisateur:", session?.user?.id);

    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();

    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    
    console.log("Paramètres de recherche:", { status, priority, projectId });
    
    // Construire la requête
    const query: any = {
      assignedTo: session.user.id,
      creatorId: { $ne: session.user.id }
    };
    
    // Filtrer par statut si spécifié
    if (status && status !== 'toutes') {
      query.status = status;
    }
    
    // Filtrer par priorité si spécifiée
    if (priority && priority !== 'toutes') {
      query.priority = priority;
    }
    
    // Filtrer par projet si spécifié
    if (projectId) {
      query.projectId = projectId;
    }

    console.log("Requête MongoDB:", JSON.stringify(query));

    // Récupérer les missions assignées à l'utilisateur mais créées par d'autres
    const missions = await Mission.find(query)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id')
      .sort({ createdAt: -1 });

    console.log(`Missions trouvées: ${missions.length}`);
    
    return NextResponse.json(missions);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
} 