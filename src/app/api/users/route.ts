import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({})
      .select('name image skills favoriteTechnologies availability')
      .sort({ name: 1 }); // Tri par nom pour une meilleure organisation

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 