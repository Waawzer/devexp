import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";

/**
 * Route API pour récupérer les missions créées par l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();

    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type'); // 'all', 'assigned', 'unassigned'
    
    // Construire la requête
    const query: any = {
      creatorId: session.user.id
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
    
    // Filtrer par type d'assignation
    if (type === 'assigned') {
      // Missions que j'ai créées et qui sont assignées à quelqu'un
      query.assignedTo = { $ne: null };
    } else if (type === 'unassigned') {
      // Missions que j'ai créées et qui ne sont pas encore assignées
      query.assignedTo = null;
    }
    // Si type est 'all' ou non spécifié, on récupère toutes les missions créées

    // Récupérer les missions créées par l'utilisateur
    const missions = await Mission.find(query)
      .populate('creatorId', 'name _id image')
      .populate('assignedTo', 'name _id image')
      .populate('projectId', 'title _id')
      .sort({ createdAt: -1 });

    return NextResponse.json(missions);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}
