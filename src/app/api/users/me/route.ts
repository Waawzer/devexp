import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  // Connexion à la base de données
  await dbConnect();

  // Extraire le token depuis l'en-tête Authorization
  const token = req.headers.get('authorization')?.split(' ')[1]; // Format attendu : "Bearer <token>"

  // Vérifier si le token est présent
  if (!token) {
    return NextResponse.json({ message: 'Non autorisé, token manquant' }, { status: 401 });
  }

  try {
    // Vérifier et décoder le token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Récupérer l'utilisateur à partir de l'ID décodé
    const user = await User.findById(decoded.userId, 'username email role');
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Retourner les informations de l'utilisateur
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    // Gestion des erreurs spécifiques au token
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }
    // Gestion des erreurs générales
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
      { status: 500 }
    );
  }
}