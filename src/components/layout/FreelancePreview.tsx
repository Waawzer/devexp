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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupé':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'en_recherche':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Link href={`/profile/${freelance._id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4 mb-4">
          {freelance.image ? (
            <Image
              src={freelance.image}
              alt={freelance.name}
              width={60}
              height={60}
              className="rounded-full"
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {freelance.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold">{freelance.name}</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAvailabilityColor(freelance.availability)}`}>
              {formatAvailability(freelance.availability)}
            </div>
          </div>
        </div>

        {freelance.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              {freelance.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              {freelance.skills.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{freelance.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {freelance.favoriteTechnologies.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies préférées</h4>
            <div className="flex flex-wrap gap-2">
              {freelance.favoriteTechnologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
} 