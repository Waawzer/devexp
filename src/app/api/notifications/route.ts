import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    if (!Notification) {
      throw new Error('Le modèle Notification n\'est pas initialisé');
    }

    // Récupérer uniquement les notifications non lues et en attente
    const notifications = await Notification.find({ 
      to: session.user.id,
      read: false,
      status: 'pending'
    })
      .populate('from', 'name image')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .lean(); // Utiliser lean() pour optimiser les performances

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des notifications', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Pour marquer une notification comme lue ou mettre à jour son statut
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const data = await req.json();
    const { notificationId, status = 'read' } = data;

    if (!notificationId) {
      return NextResponse.json(
        { message: 'ID de notification requis' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Accepter différents types de statuts
    const validStatuses = ['read', 'pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour la notification
    const updateData: Record<string, any> = { read: true };
    if (status !== 'read') {
      updateData.status = status;
    }

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId,
        to: session.user.id
      },
      { $set: updateData },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la notification', error: (error as Error).message },
      { status: 500 }
    );
  }
} 