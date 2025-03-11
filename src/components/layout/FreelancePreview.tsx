"use client";

import Image from "next/image";
import Link from "next/link";

interface UserPreviewProps {
  freelance: {
    _id: string;
    name: string;
    image: string | null;
    skills: string[];
    favoriteTechnologies: string[];
    availability?: 'disponible' | 'occupé' | 'en_recherche';
  };
}

export default function FreelancePreview({ freelance }: UserPreviewProps) {
  const formatAvailability = (availability?: string) => {
    if (!availability) return 'Non spécifié';
    return availability.replace('_', ' ');
  };

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'disponible':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600';
      case 'occupé':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-600';
      case 'en_recherche':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600';
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border-gray-600';
    }
  };

  return (
    <Link href={`/profile/${freelance._id}`}>
      <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-700">
        <div className="relative p-6">
          {/* Effet de fond décoratif */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 rounded-bl-full opacity-50"></div>

          <div className="relative">
            {/* En-tête avec avatar et nom */}
            <div className="flex items-center gap-4 mb-6">
              {freelance.image ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full blur-sm opacity-50"></div>
                  <Image
                    src={freelance.image}
                    alt={freelance.name}
                    width={60}
                    height={60}
                    className="rounded-full relative ring-2 ring-gray-700"
                  />
                </div>
              ) : (
                <div className="w-[60px] h-[60px] bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white ring-2 ring-gray-700">
                  <span className="text-2xl font-semibold">
                    {freelance.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {freelance.name}
                </h3>
                <div className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  transform transition-transform hover:scale-105 border
                  ${getAvailabilityColor(freelance.availability)}
                `}>
                  {formatAvailability(freelance.availability)}
                </div>
              </div>
            </div>

            {/* Compétences */}
            {freelance.skills.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {freelance.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 
                               rounded-full text-sm font-medium border border-gray-600
                               shadow-sm transform transition-transform hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                  {freelance.skills.length > 3 && (
                    <span className="text-sm text-indigo-400 font-medium">
                      +{freelance.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Technologies préférées */}
            {freelance.favoriteTechnologies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Technologies préférées</h4>
                <div className="flex flex-wrap gap-2">
                  {freelance.favoriteTechnologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 
                               text-indigo-300 rounded-full text-sm font-medium border border-indigo-700/50
                               shadow-sm transform transition-transform hover:scale-105"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 