"use client";

import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  technologies: string[];
  stars: number;
}

interface ProjectGridProps {
  projects: Project[];
  className?: string;
}

export function ProjectGrid({ projects, className = "" }: ProjectGridProps) {
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/ProjectPage/${projectId}`);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {projects.map((project) => (
        <Card 
          key={project.id}
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar 
              src={project.owner.avatarUrl}
              alt={project.owner.name}
              userId={project.owner.id}
            />
            <div>
              <h3 className="font-semibold">{project.owner.name}</h3>
              <p className="text-sm text-gray-500">Proprietário</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2">{project.name}</h2>
          <p className="text-gray-600 mb-4">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech) => (
              <span 
                key={tech}
                className="px-2 py-1 bg-gray-100 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center text-gray-500">
            <span>⭐ {project.stars}</span>
          </div>
        </Card>
      ))}
    </div>
  );
} 