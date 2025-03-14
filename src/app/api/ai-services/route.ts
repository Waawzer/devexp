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
    // Vérifier que l'URL est valide
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('URL d\'image invalide pour Cloudinary:', imageUrl);
      throw new Error('URL d\'image invalide');
    }

    // Vérifier que la configuration Cloudinary est présente
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Configuration Cloudinary manquante');
      throw new Error('Configuration Cloudinary manquante');
    }

    console.log('Tentative d\'upload sur Cloudinary:', { folder });
    
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: 'image',
    });
    
    console.log('Upload Cloudinary réussi, URL:', uploadResponse.secure_url);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'upload sur Cloudinary:', error);
    
    // Fournir des informations plus détaillées sur l'erreur
    if (error instanceof Error) {
      throw new Error(`Erreur Cloudinary: ${error.message}`);
    } else {
      throw new Error('Erreur inconnue lors de l\'upload sur Cloudinary');
    }
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
        
        try {
          // Convertir les skills en string si c'est un tableau, ou utiliser une chaîne vide par défaut
          const skillsString = Array.isArray(data.skills) 
            ? data.skills.join(', ') 
            : typeof data.skills === 'string' 
              ? data.skills 
              : '';

          // Vérifier que les clés API sont configurées
          if (!process.env.OPENAI_API_KEY) {
            console.error('Clé API OpenAI manquante');
            return NextResponse.json(
              { message: 'Configuration du service IA manquante' },
              { status: 500 }
            );
          }

          if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Configuration Cloudinary manquante');
            return NextResponse.json(
              { message: 'Configuration du service de stockage d\'images manquante' },
              { status: 500 }
            );
          }

          // Générer les spécifications et l'image en parallèle
          const [projectSpecs, generatedImageUrl] = await Promise.all([
            generateSpecifications(
              data.title,
              data.description,
              skillsString
            ).catch(error => {
              console.error('Erreur lors de la génération des spécifications:', error);
              return 'Erreur lors de la génération des spécifications. Veuillez réessayer.';
            }),
            generateProjectImage(data.title, data.description).catch(error => {
              console.error('Erreur lors de la génération de l\'image:', error);
              return null;
            })
          ]);

          if (!generatedImageUrl) {
            console.warn('Impossible de générer l\'image, utilisation d\'une image par défaut');
            // Utiliser une image par défaut au lieu d'échouer
            const defaultImageUrl = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; // Remplacez par votre URL d'image par défaut
            
            return NextResponse.json({
              specifications: projectSpecs,
              imageUrl: defaultImageUrl
            });
          }

          try {
            const uploadedImageUrl = await uploadImageToCloudinary(generatedImageUrl);
            
            return NextResponse.json({
              specifications: projectSpecs,
              imageUrl: uploadedImageUrl
            });
          } catch (uploadError) {
            console.error('Erreur lors de l\'upload sur Cloudinary:', uploadError);
            return NextResponse.json(
              { message: 'Erreur lors de l\'upload de l\'image', error: (uploadError as Error).message },
              { status: 500 }
            );
          }
        } catch (error) {
          console.error('Erreur lors de la génération:', error);
          return NextResponse.json(
            { message: 'Erreur lors de la génération du contenu', error: (error as Error).message },
            { status: 500 }
          );
        }

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
        
        try {
          // Normaliser les skills
          const skillsInput = data.skills || '';
          
          const specifications = await generateSpecifications(
            data.title,
            data.description,
            skillsInput
          );
          return NextResponse.json({ specifications });
        } catch (error) {
          console.error('Erreur lors de la génération des spécifications:', error);
          return NextResponse.json(
            { message: 'Erreur lors de la génération des spécifications', error: (error as Error).message },
            { status: 500 }
          );
        }

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