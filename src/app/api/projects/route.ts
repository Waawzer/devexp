import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { authService } from "@/services/authService";
import mongoose from "mongoose";

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
    console.log("Token reçu :", token);
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    console.log("Token décodé :", decoded);

    const { title, description, skills, githubUrl } = await req.json();
    console.log("Données reçues :", { title, description, skills, githubUrl });

    if (!title || !description) {
      return NextResponse.json({ message: "Titre et description sont requis" }, { status: 400 });
    }

    const skillsString = Array.isArray(skills) ? skills.join(',') : skills || '';

    const project = new Project({
      title,
      description,
      userId: new mongoose.Types.ObjectId(decoded.userId),
      skills: skillsString,
      img: '/dev.bmp',
      githubUrl,
      createdAt: new Date(),
    });

    await project.save();
    console.log("Projet sauvegardé avec skills:", project.skills);

    return NextResponse.json({ message: "Projet créé avec succès", projectId: project._id }, { status: 201 });
  } catch (error) {
    console.error("Erreur dans POST /api/projects :", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du projet", error: (error as Error).message },
      { status: 500 }
    );
  }
}