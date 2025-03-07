import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const { message } = await req.json();

    // Vérifier si l'utilisateur existe et est disponible
    const targetUser = await User.findById(params.id);
    if (!targetUser) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (targetUser.availability !== 'disponible') {
      return NextResponse.json(
        { message: 'L\'utilisateur n\'est pas disponible pour des missions' },
        { status: 400 }
      );
    }

    // Ici, vous pouvez implémenter l'envoi d'email ou la sauvegarde de la proposition
    // Pour l'exemple, nous allons juste simuler un succès
    
    return NextResponse.json(
      { message: 'Proposition envoyée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi de la proposition' },
      { status: 500 }
    );
  }
} 