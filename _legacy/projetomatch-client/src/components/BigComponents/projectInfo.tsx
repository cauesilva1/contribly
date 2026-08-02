"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Avatar from "../Avatar";
import Link from "next/link";

interface ProjectInfoProps {
  title: string;
  description: string;
  languages: string[];
  githubLink: string;
  issues: { id: number; title: string; body: string; status: string; user: string; link: string }[];
  collaborators: { id: number; name: string }[];
  owner:{
    id: number;
    name: string;
    photoURL: string;
  };
}

const languageColors: { [key: string]: string } = {
    TypeScript: "#3178C6",
    JavaScript: "#F7DF1E",
    CSS: "#2965F1",
    HTML: "#E34F26",
    Python: "#3776AB",
    Java: "#007396",
    CSharp: "#239120",
    PHP: "#777BB4",
    Ruby: "#CC342D",
    Go: "#00ADD8",
    // Adicione mais linguagens e cores conforme necessário
  };

const ProjectInfo: React.FC<ProjectInfoProps> = ({
  title,
  description,
  languages,
  githubLink,
  issues,
  collaborators,
  owner, // Adicionado o campo owner
}) => {
  return (
    <div className="w-full flex flex-col items-start text-center gap-4">
      {/* Foto do Criador */}
      <div className="flex items-center gap-4">
        {owner ? (
          <>
            <Link href={`/Profile/${owner.id}`}>
              <Avatar
                useLocalStorage={false}
                alt={`Criador: ${owner.name}`}
                src={owner.photoURL}
                fallback={owner.name[0]}
                className="w-16 h-16 rounded-full border border-gray-300 hover:shadow-lg cursor-pointer"
              />
            </Link>
            <div className="text-left">
              <p className="text-lg font-bold">{owner.name}</p>
              <p className="text-sm text-gray-500">Criador do projeto</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Criador não encontrado</p>
        )}
      </div>

      {/* Título e Descrição */}
      <h1 className="text-3xl sm:text-5xl font-bold text-center">{title}</h1>
      <h3 className="text-lg sm:text-2xl text-center text-[#6B7280]">{description}</h3>

      {/* Linguagens */}
      <section className="flex flex-col sm:flex-row mt-4 w-full py-4 px-4 justify-between items-center gap-4">
        <Card className="w-[90%] sm:w-[90%] h-auto">
          <CardHeader className="flex flex-col gap-4">
            <CardTitle className="text-[#6B7280]">Linguagens:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(languages) && languages.length > 0 ? (
                languages.map((language, index) => {
                  const color = languageColors[language] || "#CCCCCC"; // Cor padrão se a linguagem não estiver no mapeamento
                  return (
                    <span
                      key={index}
                      style={{
                        backgroundColor: `${color}20`, // Fundo quase transparente (20% de opacidade)
                        border: `1px solid ${color}`, // Borda com a cor da linguagem
                        color: color, // Texto com a cor da linguagem
                      }}
                      className="text-sm px-3 py-1 rounded-full"
                    >
                      {language}
                    </span>
                  );
                })
              ) : (
                <p>Nenhuma linguagem disponível</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col w-[90%] sm:w-[30%] gap-4">
          <Button className="w-full sm:w-auto bg-[#363636] text-white">Contribuir</Button>
          <Button
            className="w-full sm:w-auto bg-[#363636] text-white"
            onClick={() => window.open(githubLink, "_blank")}
          >
            Ver no github
          </Button>
        </div>
      </section>

      {/* Issues e Colaboradores */}
      <section className="flex flex-col lg:flex-row mt-4 w-full py-4 px-4 gap-4">
        <Card className="w-full lg:w-[65%] p-4">
          <h3 className="text-[#6B7280]">Issues abertas:</h3>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-[#6B7280]">Título</TableHead>
                <TableHead className="text-center text-[#6B7280]">Descrição</TableHead>
                <TableHead className="text-center text-[#6B7280]">Status</TableHead>
                <TableHead className="text-center text-[#6B7280]">Usuário</TableHead>
                <TableHead className="text-center text-[#6B7280]">Ver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {Array.isArray(issues) && issues.length > 0 ?  (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="text-center">{issue.title}</TableCell>
                    <TableCell className="text-center">{issue.body}</TableCell>
                    <TableCell className="text-center">{issue.status}</TableCell>
                    <TableCell className="text-center">{issue.user}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="text-blue-500"
                        onClick={() => window.open(issue.link, "_blank")}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhuma issue encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="w-full lg:w-[25%] p-4">
          <h3 className="text-[#6B7280]">Colaboradores:</h3>
          <Table className="w-full">
            {Array.isArray(collaborators) && collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell className="flex items-center justify-between text-center text-[#6B7280]">
                    <Avatar
                      alt={collaborator.name}
                      fallback={collaborator.name[0]}
                      className="w-10 h-10 rounded-full border border-red-500"
                    />
                    <p>{collaborator.name}</p>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={1} className="text-center">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>
      </section>
    </div>
  );
};

export default ProjectInfo;