import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import OpenAI from 'openai';
import cloudinary from '@/lib/cloudinary';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateProjectImage(title: string, description: string) {
  try {
    const prompt = `Create a modern, professional project thumbnail for a software project titled "${title}". ${description}. Style: Minimalist, tech-focused, professional.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("Image URL is undefined");
    }

    // Télécharger l'image dans Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: 'project-thumbnails',
    });

    return uploadResponse.secure_url; // URL permanente de Cloudinary
  } catch (error) {
    console.error("Erreur lors de la génération de l'image:", error);
    return '/dev.bmp'; // Image par défaut en cas d'erreur
  }
}

export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find()
      .populate('userId', 'name _id')
      .sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    const project = await Project.create({
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}