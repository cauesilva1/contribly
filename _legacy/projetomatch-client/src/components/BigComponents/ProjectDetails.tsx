"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProjectDetailsProps {
  projectData: {
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
    contributors: {
      id: string;
      name: string;
      avatarUrl: string;
    }[];
    repositoryUrl: string;
    createdAt: string;
  };
  onStarProject: () => Promise<void>;
  onContribute: () => Promise<void>;
}

export function ProjectDetails({ 
  projectData, 
  onStarProject, 
  onContribute 
}: ProjectDetailsProps) {
  const router = useRouter();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar 
          src={projectData.owner.avatarUrl}
          alt={projectData.owner.name}
          userId={projectData.owner.id}
          className="w-16 h-16"
        />
        <div>
          <h2 className="text-2xl font-bold">{projectData.name}</h2>
          <p className="text-gray-600">Criado por {projectData.owner.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Descrição</h3>
          <p className="text-gray-600">{projectData.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Tecnologias</h3>
          <div className="flex flex-wrap gap-2">
            {projectData.technologies.map((tech) => (
              <span 
                key={tech}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Contribuidores</h3>
          <div className="flex flex-wrap gap-4">
            {projectData.contributors.map((contributor) => (
              <div 
                key={contributor.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push(`/Profile/${contributor.id}`)}
              >
                <UserAvatar 
                  src={contributor.avatarUrl}
                  alt={contributor.name}
                  userId={contributor.id}
                />
                <span>{contributor.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={onStarProject}>
            ⭐ {projectData.stars} Stars
          </Button>
          <Button variant="outline" onClick={onContribute}>
            Contribuir
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open(projectData.repositoryUrl, '_blank')}
          >
            Ver Repositório
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Criado em {new Date(projectData.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
} 