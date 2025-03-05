import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Project from '@/models/Project';

// Récupérer un utilisateur spécifique avec ses projets
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // Récupérer l'utilisateur avec plus d'informations
    const user = await User.findById(params.id, 'username email description skills favoriteTechnologies image');
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les projets de l'utilisateur
    const projects = await Project.find({ userId: params.id });

    return NextResponse.json({
      user,
      projects
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'utilisateur', error: (error as Error).message },
      { status: 500 }
    );
  }
}
