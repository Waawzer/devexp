import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import cloudinary from '@/lib/cloudinary';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Nouvelle fonction pour gérer l'upload d'images de projet
async function handleProjectImageUpload(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Convertir le fichier en base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload vers Cloudinary dans un dossier spécifique pour les captures d'écran
    const cloudinaryUrl = await uploadImageToCloudinary(base64Image, 'project-screenshots');
    
    return cloudinaryUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    throw error;
  }
}

async function generateDetailedDescription(description: string) {
  try {
    const prompt = `En tant qu'expert en communication technique, améliore et structure la description suivante d'un projet informatique pour la rendre plus détaillée et professionnelle. Utilise des puces (•) pour lister les fonctionnalités principales. La description doit être claire, concise et bien organisée.

Description actuelle: ${description}

Format souhaité:
- Un paragraphe d'introduction expliquant le concept général
- Liste des fonctionnalités principales avec des puces
- Un paragraphe de conclusion sur les cas d'usage`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de la génération de la description:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const imageUrl = await handleProjectImageUpload(formData);
      return NextResponse.json({ url: imageUrl });
    }

    const body = await req.json();
    
    // Nouvelle route pour la génération de description
    if (body.type === 'generate-description') {
      const detailedDescription = await generateDetailedDescription(body.description);
      return NextResponse.json({ description: detailedDescription });
    }

    // Sinon, traiter comme une requête de génération de contenu
    const { title, description, skills } = await req.json();

    // Génération du cahier des charges
    const specificationPrompt = `En tant qu'expert en gestion de projet informatique, génère un cahier des charges détaillé pour le projet suivant:
    Titre: ${title}
    Description: ${description}
    Compétences requises: ${skills}
    
    Format souhaité:
    1. Objectifs du projet
    2. Fonctionnalités principales
    3. Spécifications techniques
    4. Planning estimatif
    5. Livrables attendus`;

    const specResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: specificationPrompt }],
    });

    const specifications = specResponse.choices[0].message.content;

    // Génération de l'image avec DALL-E
    const imagePrompt = `Une illustration moderne et professionnelle pour un projet informatique intitulé "${title}". 
    Le projet concerne: ${description}. 
    Style: Minimaliste, technologique, avec des couleurs douces et professionnelles.`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const dalleImageUrl = imageResponse.data[0]?.url;
    
    if (!dalleImageUrl) {
      throw new Error("Aucune image n'a été générée");
    }

    // Upload l'image vers Cloudinary
    const cloudinaryUrl = await uploadImageToCloudinary(dalleImageUrl);

    return NextResponse.json({
      specifications,
      imageUrl: cloudinaryUrl,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}
