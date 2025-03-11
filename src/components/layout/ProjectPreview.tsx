import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

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
    'en développement': 'from-yellow-500 to-orange-500 text-white',
    'en production': 'from-emerald-500 to-green-500 text-white',
    'en pause': 'from-blue-500 to-indigo-500 text-white',
    'abandonné': 'from-red-500 to-pink-500 text-white',
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${project.userId._id}`);
  };

  return (
    <div className="w-[376px] group">
      <Link href={`/projects/${project._id}`} className="block">
        <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                    transform hover:-translate-y-1 overflow-hidden border border-gray-700">
          <div className="relative h-[160px] w-full">
            <Image
              src={project.img || '/default-project.jpg'}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-lg font-bold text-white drop-shadow-md line-clamp-2 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text">
                  {project.title}
                </h2>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium shadow-lg
                    bg-gradient-to-r ${statusColors[project.status]}
                  `}>
                    {project.status}
                  </span>
                  
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium shadow-lg
                    ${project.projectType === 'collaboratif' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200'}
                  `}>
                    {project.projectType === 'collaboratif' ? 'Collaboratif' : 'Personnel'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-300 line-clamp-2">
                {project.description}
              </p>
            </div>

            {collaborationRole && (
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 
                             text-white px-3 py-1 rounded-full text-xs font-medium 
                             shadow-lg">
                  {collaborationRole}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-600 
                           text-gray-200 rounded-full text-xs font-medium 
                           transition-transform hover:scale-105 border border-gray-600"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Par</span>
                <button 
                  onClick={handleAuthorClick}
                  className="font-medium text-indigo-400 hover:text-indigo-300 
                           transition-colors hover:underline"
                >
                  {project.userId.name}
                </button>
                {isOwner && (
                  <span className="text-indigo-400 font-medium">(Vous)</span>
                )}
              </div>
              <span className="text-gray-400">
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
