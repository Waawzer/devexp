import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    
    const message = await Message.findById(params.id);
    if (!message) {
      return NextResponse.json({ message: 'Message non trouvé' }, { status: 404 });
    }
    
    // Vérifier que l'utilisateur est bien le destinataire
    if (message.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à marquer ce message comme lu' },
        { status: 403 }
      );
    }
    
    // Marquer comme lu
    message.read = true;
    await message.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
      { status: 500 }
    );
  }
} 