import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

// Mettre à jour le profil utilisateur
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // Mise à jour des données utilisateur
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: data },
      { new: true }
    );

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
} 