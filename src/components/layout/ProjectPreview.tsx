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
    'en développement': 'bg-yellow-100 text-yellow-800',
    'en production': 'bg-green-100 text-green-800',
    'en pause': 'bg-blue-100 text-blue-800',
    'abandonné': 'bg-red-100 text-red-800',
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${project.userId._id}`);
  };

  return (
    <div className="w-[280px] h-[300px]">
      <Link href={`/projects/${project._id}`} className="h-full block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
          <div className="relative h-[160px] w-full flex-shrink-0">
            <Image
              src={project.img || '/default-project.jpg'}
              alt={project.title}
              fill
              className="object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-t-lg" />
            
            <div className="absolute inset-0 p-3 flex flex-col text-white">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h2 className="text-base font-semibold truncate flex-grow">
                  {project.title}
                </h2>
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                      statusColors[project.status]
                    }`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                      project.projectType === 'collaboratif' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.projectType === 'collaboratif' ? 'Collaboratif' : 'Personnel'}
                  </span>
                </div>
              </div>
              <p className="text-xs line-clamp-2 text-gray-100">
                {project.description}
              </p>
            </div>

            {collaborationRole && (
              <div className="absolute top-2 left-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  {collaborationRole}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 flex flex-col flex-grow">
            <div className="flex-grow overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {project.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-xs inline-block"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t mt-2">
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">Par</span>
                <button 
                  onClick={handleAuthorClick}
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {project.userId.name}
                </button>
                {isOwner && (
                  <span className="text-blue-600 font-medium">(Vous)</span>
                )}
              </div>
              <span className="text-gray-500">
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
