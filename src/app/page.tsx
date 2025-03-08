"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Cercles décoratifs en arrière-plan */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>

      <div className="max-w-4xl mx-auto text-center z-10 px-4">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
          Bienvenue sur DevExp
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Une plateforme innovante qui connecte développeurs et clients 
          pour créer des projets exceptionnels ensemble.
        </p>

        <div className="space-y-6">
          {session ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 mb-8">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ""}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-indigo-200"
                  />
                )}
                <p className="text-lg text-gray-700">
                  Ravi de vous revoir, <span className="font-semibold">{session.user?.name}</span> !
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/projects" className="button-primary">
                  Découvrir les projets
                </Link>
                <Link href="/projects/my-projects" className="button-secondary">
                  Mes projets
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-center gap-4">
                <Link href="/projects" className="button-primary animate-float">
                  Explorer les projets
                </Link>
                <button className="button-secondary">
                  En savoir plus
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="card p-6">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">100+</div>
                  <div className="text-gray-600">Projets actifs</div>
                </div>
                <div className="card p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600">Développeurs</div>
                </div>
                <div className="card p-6">
                  <div className="text-3xl font-bold text-teal-600 mb-2">50+</div>
                  <div className="text-gray-600">Collaborations réussies</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}