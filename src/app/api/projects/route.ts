import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    // S'assurer que les modèles sont chargés
    require('@/models/User');
    require('@/models/Project');
    
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
    // S'assurer que les modèles sont chargés
    require('@/models/User');
    require('@/models/Project');
    
    const data = await req.json();

    const project = await Project.create({
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
      status: 'en développement',
    });

    const populatedProject = await Project.findById(project._id)
      .populate('userId', 'name _id');

    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}