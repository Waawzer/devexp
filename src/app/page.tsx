"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold mb-6">
        Bienvenue sur DevExp
      </h1>
      
      <p className="text-xl text-gray-600 mb-8">
        Une plateforme pour connecter développeurs et clients dans un esprit de collaboration.
      </p>

      <div className="space-y-6">
        {session ? (
          <div className="space-y-4">
            <p className="text-lg">
              Bonjour, {session.user?.name} !
            </p>
            <div className="space-x-4">
              <Link 
                href="/projects" 
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                Voir les projets
              </Link>
              <Link 
                href="/projects/my-projects" 
                className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
              >
                Mes projets
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">
              Rejoignez notre communauté pour collaborer sur des projets passionnants !
            </p>
            <Link 
              href="/projects" 
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Découvrir les projets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}