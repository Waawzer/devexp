import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { verifyToken } from "@/services/authService";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ message: "Titre et description sont requis" }, { status: 400 });
    }

    const project = new Project({
      title,
      description,
      userId: decoded.userId, // Associe le projet à l'utilisateur
      createdAt: new Date(),
    });

    await project.save();
    return NextResponse.json({ message: "Projet créé avec succès", projectId: project._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la création du projet", error: (error as Error).message },
      { status: 500 }
    );
  }
}