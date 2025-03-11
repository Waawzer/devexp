import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

// Mettre à jour le profil utilisateur
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await req.json();

    // Mise à jour de l'utilisateur avec les nouvelles données
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: data.name,
          description: data.description,
          skills: data.skills,
          favoriteTechnologies: data.favoriteTechnologies,
          availability: data.availability
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Ajouter une route GET pour récupérer les données du profil
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email })
      .select('name email image description skills favoriteTechnologies availability');

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les projets créés par l'utilisateur
    const projects = await Project.find({ userId: user._id });

    // Récupérer les projets où l'utilisateur est collaborateur
    const collaborations = await Project.find({
      'collaborators.user': user._id
    });

    // Retourner toutes les données
    return NextResponse.json({
      ...user.toObject(),
      projects,
      collaborations,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 