"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProjectPreview from "@/components/layout/ProjectPreview";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

interface Project {
  _id: string;
  title: string;
  description: string;
  userId: {
    _id: string;
    name: string;
  };
  img: string;
  skills: string[];
  status: string;
  createdAt: string;
  collaborators?: Array<{
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }>;
}

export default function MyCollaborationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session?.user) {
      fetchCollaborations();
    }
  }, [session, status, router]);

  const fetchCollaborations = async () => {
    try {
      // Récupérer mes collaborations
      const collaborationsResponse = await fetch("/api/projects/my-collaborations");
      if (!collaborationsResponse.ok) throw new Error("Erreur lors de la récupération des collaborations");
      const collaborationsData = await collaborationsResponse.json();
      setCollaborations(collaborationsData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête avec navigation */}
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/projects" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft />
          <span>Retour aux projets</span>
        </Link>
      </div>

      {/* En-tête avec fond dégradé */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative px-8 py-12 text-white">
          <h1 className="text-3xl font-bold mb-4">Mes collaborations</h1>
          <p className="text-white/80 max-w-2xl">
            Projets sur lesquels vous collaborez avec d'autres développeurs.
          </p>
        </div>
      </div>

      {/* Liste des collaborations */}
      {collaborations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune collaboration trouvée</h3>
          <p className="text-gray-500 mb-4">
            Vous ne collaborez sur aucun projet pour le moment.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Découvrir des projets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.map((project) => (
            <ProjectPreview 
              key={project._id} 
              project={project}
              isOwner={false}
              collaborationRole={
                project.collaborators?.find(
                  c => c.user._id === session?.user?.id
                )?.role
              }
            />
          ))}
        </div>
      )}
    </div>
  );
} 