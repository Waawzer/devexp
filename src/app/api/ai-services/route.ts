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

// Configure the route for longer execution time
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set to 60 seconds (maximum allowed on Hobby plan)
export const runtime = 'nodejs';

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

          // Utiliser une approche séquentielle au lieu de parallèle pour éviter de surcharger
          // Générer d'abord les spécifications (priorité plus haute)
          console.log('Génération des spécifications pour:', data.title);
          const projectSpecs = await generateSpecifications(
            data.title,
            data.description,
            skillsString
          ).catch(error => {
            console.error('Erreur lors de la génération des spécifications:', error);
            // Fallback pour les spécifications
            return `# Cahier des charges: ${data.title}\n\n## Contexte et objectifs\n${data.description}\n\n## Compétences techniques\n${skillsString}`;
          });

          // Vérifier le temps restant avant de générer l'image
          // Utiliser une image par défaut si Cloudinary n'est pas configuré
          if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Configuration Cloudinary manquante');
            // Retourner les spécifications sans image
            return NextResponse.json({
              specifications: projectSpecs,
              imageUrl: 'https://res.cloudinary.com/dpoi45ksk/image/upload/v1741953000/project-images/default-project_ixhzqz.jpg' // Image par défaut personnalisée
            });
          }

          // Générer l'image avec un timeout plus court
          console.log('Génération de l\'image pour:', data.title);
          let imageUrl = 'https://res.cloudinary.com/dpoi45ksk/image/upload/v1741953000/project-images/default-project_ixhzqz.jpg'; // Image par défaut
          
          try {
            // Essayer de générer l'image avec un timeout court
            const generatedImageUrl = await generateProjectImage(data.title, data.description);
            
            if (generatedImageUrl) {
              // Essayer d'uploader l'image sur Cloudinary
              try {
                imageUrl = await uploadImageToCloudinary(generatedImageUrl);
              } catch (uploadError) {
                console.error('Erreur lors de l\'upload sur Cloudinary:', uploadError);
                // Utiliser l'URL générée directement si l'upload échoue
                imageUrl = generatedImageUrl;
              }
            }
          } catch (imageError) {
            console.error('Erreur lors de la génération de l\'image:', imageError);
            // L'image par défaut sera utilisée
          }
          
          // Retourner les résultats
          return NextResponse.json({
            specifications: projectSpecs,
            imageUrl: imageUrl
          });
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