import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { withAuth } from "@/lib/services/authService";
import { getAuthSession } from "@/lib/services/authService";
import { Session } from "next-auth";

// Add interface for query type
interface ProjectQuery {
  visibility?: string;
  userId?: string;
  $or?: Array<{
    visibility?: string;
    userId?: string;
    'collaborators.user'?: string;
  }>;
}

// Fonction utilitaire pour filtrer les projets selon les droits d'accès
async function getProjectsQuery(session: Session | null): Promise<ProjectQuery> {
  if (!session?.user) {
    // Si non connecté, ne montrer que les projets publics
    return { visibility: 'public' };
  } else {
    // Si connecté, montrer les projets publics ET les projets privés où l'utilisateur est impliqué
    return {
      $or: [
        { visibility: 'public' },
        { userId: session.user.id },
        { 'collaborators.user': session.user.id }
      ]
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await dbConnect();

    const query: ProjectQuery = await getProjectsQuery(session);
    
    // Paramètres de filtrage supplémentaires
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    // Filtrer par type si spécifié (my-projects, my-collaborations)
    if (session?.user && type === 'my-projects') {
      query.userId = session.user.id;
    } else if (session?.user && type === 'my-collaborations') {
      query.$or = [{ 'collaborators.user': session.user.id }];
    }

    const projects = await Project.find(query)
      .populate('userId', 'name _id')
      .sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (session) => {
    await dbConnect();
    const data = await req.json();

    const project = await Project.create({
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
      status: data.status || 'en développement',
      visibility: data.visibility || 'public'
    });

    const populatedProject = await Project.findById(project._id)
      .populate('userId', 'name _id');

    return NextResponse.json(populatedProject, { status: 201 });
  });
}