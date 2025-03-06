import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Project from '@/models/Project';

// Récupérer un utilisateur spécifique avec ses projets
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // Récupérer l'utilisateur
    const user = await User.findById(params.id)
      .select('name email image description skills favoriteTechnologies');

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les projets créés par l'utilisateur
    const projects = await Project.find({ userId: params.id })
      .populate('userId', 'name _id')
      .sort({ createdAt: -1 });

    // Récupérer les projets où l'utilisateur est collaborateur
    const collaborations = await Project.find({
      'collaborators.user': params.id
    })
      .populate('userId', 'name _id')
      .populate('collaborators.user', 'name _id')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      user,
      projects,
      collaborations
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'utilisateur', error: (error as Error).message },
      { status: 500 }
    );
  }
}
