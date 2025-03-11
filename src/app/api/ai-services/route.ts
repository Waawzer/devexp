import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  generateProjectDescription, 
  generateMissionDescription, 
  generateSpecifications, 
  generateProjectImage 
} from '@/lib/services/aiService';
import cloudinary from '@/lib/cloudinary';

async function uploadImageToCloudinary(imageUrl: string, folder = 'project-images') {
  try {
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: 'image',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Erreur lors de l\'upload sur Cloudinary:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'generate-project-content':
        if (!data.title || !data.description) {
          return NextResponse.json(
            { message: 'Titre et description requis' },
            { status: 400 }
          );
        }
        
        // Générer les spécifications et l'image en parallèle
        const [projectSpecs, generatedImageUrl] = await Promise.all([
          generateSpecifications(data.title, data.description, data.skills || []),
          generateProjectImage(data.title, data.description)
        ]);

        if (!generatedImageUrl) {
          return NextResponse.json(
            { message: 'Impossible de générer l\'image' },
            { status: 500 }
          );
        }

        const uploadedImageUrl = await uploadImageToCloudinary(generatedImageUrl);
        
        return NextResponse.json({
          specifications: projectSpecs,
          imageUrl: uploadedImageUrl
        });

      case 'generate-project-description':
        if (!data.description) {
          return NextResponse.json(
            { message: 'Description requise' },
            { status: 400 }
          );
        }
        
        const projectDescription = await generateProjectDescription(data.description);
        return NextResponse.json({ description: projectDescription });

      case 'generate-mission-description':
        if (!data.description) {
          return NextResponse.json(
            { message: 'Description requise' },
            { status: 400 }
          );
        }
        
        const missionDescription = await generateMissionDescription(data.description);
        return NextResponse.json({ description: missionDescription });

      case 'generate-specifications':
        if (!data.title || !data.description) {
          return NextResponse.json(
            { message: 'Titre et description requis' },
            { status: 400 }
          );
        }
        
        const specifications = await generateSpecifications(
          data.title,
          data.description,
          data.skills || []
        );
        return NextResponse.json({ specifications });

      case 'generate-image':
        if (!data.title || !data.description) {
          return NextResponse.json(
            { message: 'Titre et description requis' },
            { status: 400 }
          );
        }
        
        const imageUrl = await generateProjectImage(data.title, data.description);
        if (!imageUrl) {
          return NextResponse.json(
            { message: 'Impossible de générer l\'image' },
            { status: 500 }
          );
        }
        
        const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, data.folder || 'project-images');
        return NextResponse.json({ imageUrl: cloudinaryUrl });

      default:
        return NextResponse.json(
          { message: 'Action non reconnue' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
      { status: 500 }
    );
  }
} 