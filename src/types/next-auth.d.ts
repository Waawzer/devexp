import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      description?: string;
      skills?: string[];
      username?: string;
      favoriteTechnologies?: string[];
      availability?: 'disponible' | 'occupé' | 'en_recherche';
    }
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    description?: string;
    skills?: string[];
    username?: string;
    favoriteTechnologies?: string[];
    availability?: 'disponible' | 'occupé' | 'en_recherche';
  }
} 