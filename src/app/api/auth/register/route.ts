import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();
    console.log('Données reçues:', { username, email, password });

    // Vérifier les champs obligatoires
    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByEmail) {
      return NextResponse.json({ message: 'Utilisateur déjà existant avec cet email' }, { status: 400 });
    }

    if (existingUserByUsername) {
      return NextResponse.json({ message: 'Utilisateur déjà existant avec ce username' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    console.log('Enregistrement de l’utilisateur:', user);

    await user.save();
    console.log('Utilisateur enregistré avec succès:', user);
    return NextResponse.json({ message: 'Inscription réussie', userId: user._id }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l’enregistrement:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l’enregistrement', error: (error as Error).message },
      { status: 500 }
    );
  }
}