import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vous pouvez ajouter d'autres logiques de middleware ici si nécessaire
  return NextResponse.next();
}

// Configurer les limites de taille pour les routes spécifiques
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  matcher: [
    '/api/projects/project-services',
    '/api/users/me/image',
  ],
} 