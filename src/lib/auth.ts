import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
// Importez vos providers et autres configurations

function generateUsername(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Vérification de la connexion MongoDB
          const dbConnect = (await import('@/lib/dbConnect')).default;
          await dbConnect();
          console.log('Connexion MongoDB établie');

          if (!credentials?.email || !credentials?.password) {
            console.error('Informations de connexion manquantes');
            throw new Error('Informations de connexion manquantes');
          }

          console.log('Tentative de connexion pour:', credentials.email);
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            console.error('Utilisateur non trouvé:', credentials.email);
            throw new Error('Utilisateur non trouvé');
          }

          console.log('Utilisateur trouvé, vérification du mot de passe');
          if (!user.password) {
            console.error('Utilisateur sans mot de passe (probablement compte Google):', credentials.email);
            throw new Error('Ce compte ne peut pas se connecter avec un mot de passe. Utilisez Google pour vous connecter.');
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error('Mot de passe incorrect pour:', credentials.email);
            throw new Error('Mot de passe incorrect');
          }

          console.log('Connexion réussie pour:', credentials.email);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error('Erreur dans authorize:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      // Ne s'exécute que pour les connexions OAuth (Google, GitHub)
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await dbConnect();
          
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await User.findOne({ email: user.email });
          
          // Si l'utilisateur n'existe pas, le créer
          if (!existingUser && user.email) {
            const username = generateUsername(user.name || 'user');
            
            await User.create({
              email: user.email,
              name: user.name || username,
              image: user.image,
              username: username,
              availability: 'en_recherche'
            });
            
            console.log(`Nouvel utilisateur créé via ${account.provider}:`, user.email);
          }
        } catch (error) {
          console.error(`Erreur lors de la création de l'utilisateur via ${account.provider}:`, error);
        }
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET
}; 