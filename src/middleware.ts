import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vous pouvez ajouter d'autres logiques de middleware ici si nécessaire
  return NextResponse.next();
}

// Configurer les routes sur lesquelles le middleware s'applique
export const config = {
  matcher: [
    '/api/projects/project-services',
    '/api/users/me/image',
  ],
} 