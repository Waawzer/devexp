import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { FaUser, FaCode, FaCircle } from 'react-icons/fa';

interface Project {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  createdAt: string;
  status: 'en développement' | 'en production' | 'en pause' | 'abandonné';
  img: string;
  userId: {
    _id: string;
    name: string;
  };
  projectType: 'personnel' | 'collaboratif';
}

interface ProjectPreviewProps {
  project: Project;
  isOwner: boolean;
  collaborationRole?: string;
}

export default function ProjectPreview({ project, isOwner, collaborationRole }: ProjectPreviewProps) {
  const router = useRouter();
  
  const statusColors = {
    'en développement': 'bg-amber-500/80 border-amber-400/30',
    'en production': 'bg-emerald-500/80 border-emerald-400/30',
    'en pause': 'bg-blue-500/80 border-blue-400/30',
    'abandonné': 'bg-red-500/80 border-red-400/30',
  };

  const statusIcons = {
    'en développement': '🔨',
    'en production': '🚀',
    'en pause': '⏸️',
    'abandonné': '⛔',
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${project.userId._id}`);
  };

  return (
    <Link href={`/projects/${project._id}`} className="block w-full">
      <div className="relative bg-gray-900/40 backdrop-blur-md rounded-2xl overflow-hidden 
                    border border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300
                    group hover:border-gray-600/50">
        {/* Image de fond avec overlay */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
          <Image
            src={project.img || '/default-project.jpg'}
            alt=""
            fill
            className="object-cover"
            quality={60}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90" />
        </div>
        
        {/* Contenu principal */}
        <div className="relative p-5 flex flex-col h-full">
          {/* En-tête avec statut et type */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                              ${statusColors[project.status]} backdrop-blur-sm`}>
                <span>{statusIcons[project.status]}</span>
                <span>{project.status}</span>
              </span>
              
              {collaborationRole && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                               bg-purple-500/70 border border-purple-400/30 backdrop-blur-sm">
                  {collaborationRole}
                </span>
              )}
            </div>
            
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            ${project.projectType === 'collaboratif' 
                              ? 'bg-indigo-500/70 border border-indigo-400/30' 
                              : 'bg-gray-600/70 border border-gray-500/30'} backdrop-blur-sm`}>
              {project.projectType === 'collaboratif' ? 'Collaboratif' : 'Personnel'}
            </span>
          </div>
          
          {/* Titre et description */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-indigo-200 transition-colors">
              {project.title}
            </h2>
            <p className="text-gray-300/90 text-sm line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>
          
          {/* Compétences */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                         bg-gray-800/70 text-gray-300 border border-gray-700/50 backdrop-blur-sm"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 5 && (
              <span className="text-xs text-gray-400 px-1.5 py-0.5">
                +{project.skills.length - 5}
              </span>
            )}
          </div>
          
          {/* Pied de page avec auteur et date */}
          <div className="mt-auto pt-3 border-t border-gray-700/30 flex justify-between items-center">
            <button 
              onClick={handleAuthorClick}
              className="flex items-center gap-2 text-sm group/author"
            >
              <div className="w-6 h-6 rounded-full bg-gray-800/80 flex items-center justify-center border border-gray-700/50">
                <FaUser className="text-gray-400 text-xs" />
              </div>
              <span className="text-gray-300 group-hover/author:text-indigo-300 transition-colors">
                {project.userId.name}
                {isOwner && <span className="ml-1 text-indigo-400 font-medium">(Vous)</span>}
              </span>
            </button>
            
            <span className="text-xs text-gray-500 italic">
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
          
          {/* Effet de brillance au survol */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700
                        bg-gradient-to-tr from-indigo-500/5 via-transparent to-indigo-500/5" />
        </div>
      </div>
    </Link>
  );
}
