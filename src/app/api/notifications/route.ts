import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

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

    const notifications = await Notification.find({ 
      to: session.user.id,
      status: 'pending'
    })
      .populate('from', 'name image')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des notifications', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Pour marquer une notification comme lue
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { notificationId, status } = await req.json();

    await dbConnect();

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId,
        to: session.user.id
      },
      { 
        $set: { 
          status,
          read: true
        }
      },
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
      { message: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    );
  }
} 