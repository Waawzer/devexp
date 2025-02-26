import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const projects = await Project.find({});
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur lors de la récupération des projets', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const decoded = await verifyAuth(req);
    const { title, description } = await req.json();
    const project = new Project({ title, description, createdBy: decoded.userId });
    await project.save();

    return NextResponse.json({ message: 'Projet créé', projectId: project._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Non autorisé', error: (error as Error).message }, { status: 403 });
  }
}