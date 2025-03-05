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

    // Mise à jour des données utilisateur avec sélection explicite des champs
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: data },
      { 
        new: true,
        select: 'name email image description skills favoriteTechnologies username' 
      }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Log pour déboguer
    console.log('Updated user data:', updatedUser);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

// Ajouter une route GET pour récupérer les données du profil
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne(
      { email: session.user.email },
      'name email image description skills favoriteTechnologies username'
    );

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
} 