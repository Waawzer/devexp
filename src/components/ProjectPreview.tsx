import Link from 'next/link';

interface ProjectPreviewProps {
  project: {
    _id: string;
    title: string;
    description: string;
    img: string;
    skills: string;
    userId: string;
    createdAt: string;
    status: string;
    creator?: {
      _id: string;
      username: string;
    };
  };
  isOwner?: boolean;
}

export default function ProjectPreview({ project, isOwner = false }: ProjectPreviewProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'En développement':
        return 'bg-yellow-100 text-yellow-800';
      case 'En production':
        return 'bg-green-100 text-green-800';
      case 'Abandonné':
        return 'bg-red-100 text-red-800';
      case 'En pause':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] h-[400px]">
      <Link href={`/projects/${project._id}`} className="block h-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
          {/* Image et titre */}
          <div className="relative h-48 flex-shrink-0">
            <img 
              src={project.img || '/dev.bmp'} 
              alt={project.title}
              className="w-full h-full object-cover brightness-50"
            />
            <div className="absolute inset-0 p-4 text-white">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{project.title}</h3>
              <p className="text-sm line-clamp-3">{project.description}</p>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            {/* Status */}
            <div className="mb-2">
              <span className={`${getStatusColor(project.status)} text-xs px-2 py-1 rounded-full`}>
                {project.status}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-auto">
              {project.skills?.split(',').map((skill, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {skill.trim()}
                </span>
              )) || null}
            </div>

            {/* Footer */}
            <div className="mt-4">
              <Link 
                href={`/profile/${project.creator?._id}`}
                className="text-sm text-gray-600 hover:text-blue-500 block mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                Par {project.creator?.username || "Utilisateur inconnu"}
              </Link>
              <span className="text-xs text-gray-500">
                Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
