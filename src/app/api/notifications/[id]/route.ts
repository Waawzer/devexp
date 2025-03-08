import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const notification = await Notification.findById(params.id);

    if (!notification) {
      return NextResponse.json({ message: 'Notification non trouvée' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la notification' },
      { status: 500 }
    );
  }
}