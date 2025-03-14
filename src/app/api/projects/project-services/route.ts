import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

// The new way to configure route handlers in Next.js App Router
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set maximum duration to 60 seconds
export const runtime = 'nodejs';

// Configure bodyParser for larger payloads
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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

    // Upload vers Cloudinary avec compression et optimisation
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'project-images',
          // Options d'optimisation pour Cloudinary
          quality: 'auto', // Optimisation automatique de la qualité
          fetch_format: 'auto', // Format optimal (webp si supporté)
          transformation: [
            { width: 1200, crop: 'limit' }, // Limiter la largeur max à 1200px
            { quality: 'auto:good' } // Bonne qualité mais optimisée
          ]
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