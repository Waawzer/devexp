import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Connexion à la base de données
import User from '@/models/User';     // Modèle utilisateur
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Utilisateur déjà existant' }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    return NextResponse.json({ message: 'Inscription réussie', userId: user._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur', error: (error as Error).message }, { status: 500 });
  }
}