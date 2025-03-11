"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Cercle décoratif central */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full filter blur-3xl opacity-20"></div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center z-10">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 drop-shadow-sm">
            Bienvenue sur DevExp
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
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
                      className="rounded-full border-2 border-indigo-500/50 shadow-md"
                    />
                  )}
                  <p className="text-lg text-gray-200 font-medium">
                    Ravi de vous revoir, <span className="font-bold text-white">{session.user?.name}</span> !
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/projects" className="button-primary shadow-md">
                    Découvrir les projets
                  </Link>
                  <Link href="/projects?view=my-projects" className="button-secondary shadow-md">
                    Mes projets
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-center gap-4">
                  <Link href="/projects" className="button-primary animate-float shadow-md">
                    Explorer les projets
                  </Link>
                  <button className="button-secondary shadow-md">
                    En savoir plus
                  </button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                  <div className="card p-6 shadow-md">
                    <div className="text-3xl font-bold text-indigo-400 mb-2">100+</div>
                    <div className="text-gray-300 font-medium">Projets actifs</div>
                  </div>
                  <div className="card p-6 shadow-md">
                    <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                    <div className="text-gray-300 font-medium">Développeurs</div>
                  </div>
                  <div className="card p-6 shadow-md">
                    <div className="text-3xl font-bold text-teal-400 mb-2">50+</div>
                    <div className="text-gray-300 font-medium">Collaborations réussies</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}