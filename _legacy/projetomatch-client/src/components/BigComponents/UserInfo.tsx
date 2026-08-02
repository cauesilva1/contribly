"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Substitui o useRouter
import Link from "next/link";
import Avatar from "@/components/Avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import axios from "axios";

interface UserInfoProps {
  className?: string; // Classes adicionais para estilização
}

interface Project {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  ownerId: number;
  languages: string[];
  githubLink: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ className }) => {
  const { id } = useParams(); // Captura o ID do usuário da URL

  const [userName, setUserName] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]); // Projetos criados pelo usuário
  const [participatedProjects, setParticipatedProjects] = useState<Project[]>([]); // Projetos que o usuário participou

  const [isCurrentUser, setIsCurrentUser] = useState(false); // Verifica se o perfil é do usuário logado

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Faz a requisição para buscar os dados do usuário pelo ID
        const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/user/${id}`);
        const user = response.data;

        setUserName(user.name || "Usuário");
        setUserBio(user.bio || "Sem bio disponível.");
        setUserPhoto(user.photoURL || "");
        setCreatedProjects(user.createdProjects || []);
        setParticipatedProjects(user.participatedProjects || []);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Avatar */}
      <Avatar
        useLocalStorage={false}
        src={userPhoto || undefined}
        alt="Foto do usuário"
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-gray-300"
      />
      {/* Nome do Usuário */}
      <h1 className="text-2xl sm:text-3xl font-bold">{userName}</h1>

      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Bio */}
        <div className="flex flex-col items-center gap-4 w-full lg:w-[70%]">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>Bio</CardTitle>
              <CardDescription>Informações sobre o usuário</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{userBio}</p>
            </CardContent>
          </Card>

          {/* Projetos Adicionados */}
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>Projetos Adicionados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-gray-600">
                      Nome do Projeto
                    </TableHead>
                    <TableHead className="text-left text-gray-600">
                      Descrição
                    </TableHead>
                    <TableHead className="text-left text-gray-600">
                      Linguagens
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {createdProjects.length > 0 ? (
                    createdProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="text-gray-800">
                          <Link href={`/ProjectPage/${project.id}`}>
                            <a className="text-blue-500 hover:underline">
                              {project.title}
                            </a>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {project.description}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {project.languages
                            ? project.languages.join(", ")
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-gray-600"
                      >
                        Nenhum projeto encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Projetos Contribuídos */}
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>Projetos Contribuídos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-gray-600">
                      Nome do Projeto
                    </TableHead>
                    <TableHead className="text-left text-gray-600">
                      Linguagens
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participatedProjects.length > 0 ? (
                    participatedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="text-gray-800">
                          {project.title}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {project.languages
                            ? project.languages.join(", ")
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-gray-600"
                      >
                        Nenhum projeto encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações de Participação (Somente para o Usuário Logado) */}
        {isCurrentUser && (
          <Card className="w-full lg:w-[27%] max-w-4xl">
            <CardHeader>
              <CardTitle>Solicitações de Participação</CardTitle>
              <CardDescription>
                Gerencie as solicitações de novos participantes para seus
                projetos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aqui você pode gerenciar as solicitações de participação.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
