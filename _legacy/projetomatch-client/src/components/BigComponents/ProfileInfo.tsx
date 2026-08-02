"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProfileInfoProps {
  userData: {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
    githubUrl: string;
    email: string;
    projects: {
      id: string;
      name: string;
      description: string;
    }[];
  };
}

export function ProfileInfo({ userData }: ProfileInfoProps) {
  const router = useRouter();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar 
          src={userData.avatarUrl} 
          alt={userData.name}
          className="w-20 h-20"
        />
        <div>
          <h2 className="text-2xl font-bold">{userData.name}</h2>
          <p className="text-gray-600">{userData.bio}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">GitHub</h3>
          <a 
            href={userData.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {userData.githubUrl}
          </a>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p>{userData.email}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Projetos</h3>
          <div className="space-y-4">
            {userData.projects.map((project) => (
              <Card key={project.id} className="p-4">
                <h4 className="font-semibold">{project.name}</h4>
                <p className="text-gray-600">{project.description}</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => router.push(`/ProjectPage/${project.id}`)}
                >
                  Ver Projeto
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 