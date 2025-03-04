import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
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

    const imageUrl = imageResponse.data[0]?.url || '/default-project.jpg';

    return NextResponse.json({
      specifications,
      imageUrl,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu" },
      { status: 500 }
    );
  }
}
