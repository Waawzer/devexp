import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { authService } from "@/services/authService";
import mongoose from "mongoose";
import OpenAI from 'openai';

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

    return response.data[0].url;
  } catch (error) {
    console.error("Erreur lors de la génération de l'image:", error);
    return '/dev.bmp'; // Image par défaut en cas d'erreur
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const projects = await Project.find()
      .populate('userId', 'username _id')
      .sort({ createdAt: -1 });

    const projectsWithCreator = projects.map(project => ({
      ...project.toObject(),
      creator: {
        _id: project.userId._id,
        username: project.userId.username
      }
    }));

    return NextResponse.json(projectsWithCreator, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    console.log("Connexion à MongoDB réussie");

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    const { title, description, skills, githubUrl, specifications } = await req.json();
    
    // Ajout de logs pour déboguer
    console.log("Données reçues:", {
      title,
      description,
      skills,
      githubUrl,
      specifications: specifications ? "Présent" : "Absent"
    });

    if (!title || !description) {
      return NextResponse.json({ message: "Titre et description sont requis" }, { status: 400 });
    }

    // Générer l'image avec DALL-E
    const imageUrl = await generateProjectImage(title, description);

    const project = new Project({
      title,
      description,
      userId: new mongoose.Types.ObjectId(decoded.userId),
      skills: Array.isArray(skills) ? skills.join(',') : skills,
      img: imageUrl,
      githubUrl,
      specifications, // S'assurer que specifications est bien inclus ici
      createdAt: new Date(),
    });

    // Log avant la sauvegarde
    console.log("Projet à sauvegarder:", {
      ...project.toObject(),
      specifications: project.specifications ? "Présent" : "Absent"
    });

    await project.save();
    
    // Log après la sauvegarde
    console.log("Projet sauvegardé avec succès, ID:", project._id);

    return NextResponse.json({ 
      message: "Projet créé avec succès", 
      projectId: project._id,
      imageUrl: project.img,
      hasSpecifications: !!project.specifications
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur complète dans POST /api/projects:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du projet", error: (error as Error).message },
      { status: 500 }
    );
  }
}