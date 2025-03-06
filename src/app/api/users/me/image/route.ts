import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import cloudinary from '@/lib/cloudinary';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'Aucune image fournie' }, { status: 400 });
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'profile_pictures',
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
    });

    // Mise à jour de l'URL de l'image dans la base de données
    await dbConnect();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { image: result.secure_url } },
      { new: true }
    );

    return NextResponse.json({ image: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléchargement de l\'image' },
      { status: 500 }
    );
  }
} 