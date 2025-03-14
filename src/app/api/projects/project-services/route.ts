import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    // Augmenter la limite de taille à 10MB (10 * 1024 * 1024 octets)
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier la taille du fichier (limite à 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en octets
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'Le fichier est trop volumineux. La taille maximale est de 5MB.' },
        { status: 413 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'project-images',
        },
        (error, result) => {
          if (error) {
            console.error('Erreur Cloudinary:', error);
            reject(error);
            return;
          }
          resolve(result);
        }
      );
      
      // Écrire le buffer dans le stream
      uploadStream.write(buffer);
      uploadStream.end();
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléchargement de l\'image', error: (error as Error).message },
      { status: 500 }
    );
  }
} 