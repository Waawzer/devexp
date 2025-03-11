import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns Session utilisateur ou null
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Middleware pour vérifier l'authentification
 * @param req Requête Next
 * @param handler Fonction à exécuter si authentifié
 */
export async function withAuth(req: NextRequest, handler: (session: Session) => Promise<any>) {
  const session = await getAuthSession();
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }
  
  return handler(session);
} 