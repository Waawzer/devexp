import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { verifyAuth } from "@/lib/auth"; // Changement ici

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const decoded = await verifyAuth(req);

    const projects = await Project.find({
      $or: [
        { developer: decoded.userId },
        { client: decoded.userId },
      ],
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}