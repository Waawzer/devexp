import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { authService } from "@/services/authService";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const projects = await Project.find({});
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la récupération des projets", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    const decoded = authService.verifyToken(token);
    const { title, description } = await req.json();
    const project = new Project({ title, description, createdBy: decoded.userId }); // Typé correctement
    await project.save();

    return NextResponse.json({ message: "Projet créé", projectId: project._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Non autorisé", error: (error as Error).message },
      { status: 403 }
    );
  }
}