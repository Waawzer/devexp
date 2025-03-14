import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { UploadApiResponse } from 'cloudinary';

// Configuration pour les routes API
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set maximum duration to 60 seconds
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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

    // Vérifier la taille du fichier (limite à 4MB pour Vercel)
    const maxSize = 4 * 1024 * 1024; // 4MB en octets
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'Le fichier est trop volumineux. La taille maximale est de 4MB.' },
        { status: 413 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary avec optimisation
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'profile_pictures',
          // Options d'optimisation pour Cloudinary
          quality: 'auto', // Optimisation automatique de la qualité
          fetch_format: 'auto', // Format optimal (webp si supporté)
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Optimisé pour les photos de profil
            { quality: 'auto:good' } // Bonne qualité mais optimisée
          ]
        },
        (error, result) => {
          if (error) reject(error);
          if (!result) reject(new Error('Upload failed'));
          resolve(result as UploadApiResponse);
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
      { message: 'Erreur lors du téléchargement de l\'image', error: (error as Error).message },
      { status: 500 }
    );
  }
} 