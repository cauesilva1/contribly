import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface ProjectData {
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
}

export function useProject(initialProject: ProjectData) {
  const [project, setProject] = useState(initialProject);
  const [isLoading, setIsLoading] = useState(false);

  const handleStarProject = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_API}/projects/${project.id}/star`
      );
      setProject(prev => ({
        ...prev,
        stars: response.data.stars
      }));
      toast.success("Projeto favoritado com sucesso!");
    } catch (error) {
      toast.error("Erro ao favoritar projeto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_URL_API}/projects/${project.id}/contribute`
      );
      toast.success("Contribuição registrada com sucesso!");
    } catch (error) {
      toast.error("Erro ao registrar contribuição");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    isLoading,
    handleStarProject,
    handleContribute
  };
}