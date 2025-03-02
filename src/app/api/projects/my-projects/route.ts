import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { authService } from "@/services/authService";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    const decoded = authService.verifyToken(token);

    const projects = await Project.find({
      userId: decoded.userId,
    }).populate('userId', 'username _id');

    // Transformer les projets pour avoir le même format que la route principale
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