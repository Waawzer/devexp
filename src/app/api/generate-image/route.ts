import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    // Créer un prompt pour DALL-E basé sur le titre et la description
    const prompt = `Create a modern, professional project thumbnail for a software project titled "${title}". ${description}. Style: Minimalist, tech-focused, professional.`;

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "256x256",
    });

    const imageUrl = response.data[0].url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
} 