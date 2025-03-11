import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Mission from "@/models/Mission";
import Notification from "@/models/Notification";

export const dynamic = 'force-dynamic';

/**
 * Route API pour récupérer les missions proposées à l'utilisateur
 * qui sont en attente d'acceptation
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();

    // Trouver les notifications de type mission_proposal qui sont en attente
    const pendingNotifications = await Notification.find({
      to: session.user.id,
      type: 'mission_proposal',
      status: 'pending'
    }).populate('from', 'name _id image');

    // Récupérer les IDs des missions associées à ces notifications
    const missionIds = pendingNotifications.map(notif => notif.missionId).filter(Boolean);

    // Récupérer les missions correspondantes
    const pendingMissions = await Mission.find({
      _id: { $in: missionIds }
    })
      .populate('creatorId', 'name _id image')
      .populate('projectId', 'title _id')
      .sort({ createdAt: -1 });

    // Combiner les données des missions avec les notifications
    const missionsWithNotifications = pendingMissions.map(mission => {
      const notification = pendingNotifications.find(
        notif => notif.missionId && notif.missionId.toString() === mission._id.toString()
      );
      
      return {
        ...mission.toObject(),
        notification: notification ? {
          _id: notification._id,
          from: notification.from,
          createdAt: notification.createdAt,
          message: notification.message
        } : null
      };
    });

    return NextResponse.json(missionsWithNotifications);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
} 