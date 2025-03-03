import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Project {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  createdAt: string;
  status: string;
}

interface ProjectPreviewProps {
  project: Project;
  isOwner: boolean;
}

export default function ProjectPreview({ project, isOwner }: ProjectPreviewProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const statusText = {
    open: 'Ouvert',
    in_progress: 'En cours',
    completed: 'Terminé',
  };

  return (
    <Link href={`/projects/${project._id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              statusColors[project.status as keyof typeof statusColors]
            }`}
          >
            {statusText[project.status as keyof typeof statusText]}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          {isOwner && (
            <span className="text-blue-600 font-medium">Votre projet</span>
          )}
        </div>
      </div>
    </Link>
  );
}
