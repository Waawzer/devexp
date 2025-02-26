import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return NextResponse.json({ message: 'Connexion réussie', token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur', error: (error as Error).message }, { status: 500 });
  }
}