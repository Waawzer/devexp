interface ProjectPreviewProps {
  project: {
    _id: string;
    title: string;
    description: string;
    img: string;
    skills: string;
    userId: string;
  };
  isOwner?: boolean;
}

export default function ProjectPreview({ project, isOwner = false }: ProjectPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]">
      <div className="relative">
        <div className="relative h-48">
          <img 
            src={project.img || '/dev.bmp'} 
            alt={project.title}
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 p-4 text-white">
            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
            <p className="text-sm line-clamp-3">{project.description}</p>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {project.skills?.split(',').map((skill, index) => (
            <span 
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {skill.trim()}
            </span>
          )) || null}
        </div>
        {isOwner && (
          <span className="mt-2 inline-block text-sm text-green-500">Votre projet</span>
        )}
      </div>
    </div>
  );
}
