import { NextAuthOptions } from "next-auth";
// Importez vos providers et autres configurations

export const authOptions: NextAuthOptions = {
  providers: [
    // Vos providers...
  ],
  // Le reste de votre configuration NextAuth
  pages: {
    signIn: '/auth/signin',
    // autres pages personnalisées...
  },
  callbacks: {
    // vos callbacks...
  },
  // autres options...
}; 