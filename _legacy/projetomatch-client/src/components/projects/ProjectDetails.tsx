"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { ReactNode } from "react";

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
}

interface ProjectHeaderProps {
  children: ReactNode;
}

interface ProjectContentProps {
  children: ReactNode;
}

interface ProjectActionsProps {
  children: ReactNode;
}

function ProjectHeader({ children }: ProjectHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {children}
    </div>
  );
}

function ProjectContent({ children }: ProjectContentProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}

function ProjectActions({ children }: ProjectActionsProps) {
  return (
    <div className="flex gap-4">
      {children}
    </div>
  );
}

export function ProjectDetails({ projectData }: ProjectDetailsProps) {
  const router = useRouter();
  const { project, isLoading, handleStarProject, handleContribute } = useProject(projectData);

  return (
    <Card className="p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        ← Voltar
      </Button>
      <ProjectHeader>
        <UserAvatar 
          src={project.owner.avatarUrl}
          alt={project.owner.name}
          userId={project.owner.id}
          className="w-16 h-16"
        />
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-gray-600">Criado por {project.owner.name}</p>
        </div>
      </ProjectHeader>

      <ProjectContent>
        <div>
          <h3 className="text-lg font-semibold mb-2">Descrição</h3>
          <p className="text-gray-600">{project.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Tecnologias</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
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
            {project.contributors.map((contributor) => (
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

        <ProjectActions>
          <Button onClick={handleStarProject} disabled={isLoading}>
            ⭐ {project.stars} Stars
          </Button>
          <Button variant="outline" onClick={handleContribute} disabled={isLoading}>
            Contribuir
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open(project.repositoryUrl, '_blank')}
          >
            Ver Repositório
          </Button>
        </ProjectActions>

        <div className="text-sm text-gray-500">
          Criado em {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </ProjectContent>
    </Card>
  );
}

ProjectDetails.Header = ProjectHeader;
ProjectDetails.Content = ProjectContent;
ProjectDetails.Actions = ProjectActions; 