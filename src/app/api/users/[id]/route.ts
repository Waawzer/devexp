import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';

// Récupérer un utilisateur spécifique avec ses projets
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    // Récupérer l'utilisateur avec plus d'informations
    const user = await User.findById(params.id, 'username email description skills');
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
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'utilisateur', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Mettre à jour un utilisateur spécifique
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { username, email, role } = await req.json();
    const user = await User.findByIdAndUpdate(params.id, { username, email, role }, { new: true });
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Profil mis à jour', user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Supprimer un utilisateur spécifique
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Utilisateur supprimé' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur lors de la suppression', error: (error as Error).message },
      { status: 500 }
    );
  }
}