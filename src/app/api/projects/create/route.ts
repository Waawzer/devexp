import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { authService } from "@/services/authService";
import mongoose from "mongoose";

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
    if (!decoded.userId) {
      return NextResponse.json({ message: "ID utilisateur manquant dans le token" }, { status: 400 });
    }

    const { title, description } = await req.json();
    console.log("Données reçues :", { title, description });

    if (!title || !description) {
      return NextResponse.json({ message: "Titre et description sont requis" }, { status: 400 });
    }

    const project = new Project({
      title,
      description,
      userId: new mongoose.Types.ObjectId(decoded.userId), // Conversion explicite en ObjectId
      createdAt: new Date(),
    });

    await project.save();
    console.log("Projet enregistré avec succès :", project._id);

    return NextResponse.json({ message: "Projet créé avec succès", projectId: project._id }, { status: 201 });
  } catch (error) {
    console.error("Erreur dans POST /api/projects/create :", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du projet", error: (error as Error).message },
      { status: 500 }
    );
  }
}