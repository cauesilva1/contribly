"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search } from "lucide-react";
import axios from "axios";

interface Project {
  id: number;
  title: string;
  description: string;
  category?: string;
  helpersCount?: number;
  languages?: string[];
}

const ProjectCards: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para o termo de busca

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
  
      const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/projects`);
      setProjects(response.data); // Atualiza o estado com os projetos retornados
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      setLoading(false);
    }
  };

  // Filtrar os projetos com base no termo de pesquisa
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Barra de Pesquisa */}
      <div className="flex justify-center mt-4 w-full">
        <div className="flex w-[70%] sm:w-[50%] items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-gray-500">
          <span className="pl-3 flex items-center text-gray-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Pesquise por projetos..."
            className="p-2 w-full focus:outline-none border-none"
            value={searchTerm} // Valor controlado
            onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de pesquisa
          />
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5 w-full justify-items-center">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-[200px]">
            <p className="text-lg text-gray-500 animate-pulse">Carregando projetos...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Link href={`/ProjectPage/${project.id.toString()}`} key={project.id}>
              <Card className="flex flex-col justify-between w-[300px] h-[300px] cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-col gap-4">
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Renderiza as 3 primeiras linguagens como tags */}
                    {project.languages?.slice(0, 3).map((language, index) => (
                      <span
                        key={index}
                        className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      {project.helpersCount || 0} pessoas ajudaram
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-[200px]">
            <p className="text-lg text-gray-500">Nenhum projeto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCards;