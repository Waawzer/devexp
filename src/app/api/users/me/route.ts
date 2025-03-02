import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authService } from '@/services/authService';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    const user = await User.findById(decoded.userId).select('username email description');

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur dans GET /api/users/me:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    const { username, description } = await req.json();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { username, description },
      { new: true }
    ).select('username email description');

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur dans PUT /api/users/me:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}