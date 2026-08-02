"use client";

import React, { use, useEffect, useState } from "react";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserInfobyOwnerProps {
  className?: string; // Classes adicionais para estilização
}

const UserInfoByOwner: React.FC<UserInfobyOwnerProps> = ({ className }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectGithubLink, setProjectGithubLink] = useState<string>("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [userProjects, setUserProjects] = useState<any[]>([]); // Estado para armazenar os projetos do usuário

  const [participationRequests, setParticipationRequests] = useState<any[]>([]); // Estado para armazenar as solicitações de participação

  const [participatedProjects, setParticipatedProjects] = useState<any[]>([]); // Estado para armazenar os projetos contribuídos

  const [githubProjects, setGithubProjects] = useState<any[]>([]); // Estado para armazenar os projetos do GitHub
  const [selectedGithubProject, setSelectedGithubProject] = useState<string>(""); // Estado para o projeto selecionado
  const [isLoadingGithubProjects, setIsLoadingGithubProjects] = useState(false); // Estado de carregamento

  useEffect(() => {
    // Busca os dados do usuário no localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      const user = parsedData.user;
      const additionalInfo = parsedData.additionalInfo;

      setUserName(user.name || "Usuário");
      setUserBio(additionalInfo.bio || "Sem bio disponível.");
      setUserPhoto(user.photoURL || "");
    }

    const fetchUserProjects = async () => {
      try {
        // Recupera o uid do localStorage
        const userData = localStorage.getItem("user");
        const uid = userData ? JSON.parse(userData).user.uid : null;

        if (!uid) {
          console.error("UID do usuário não encontrado.");
          return;
        }

        // Faz a requisição GET para a rota /projectsbyowner
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_API}/projectsbyowner`,
          {
            params: { uid }, // Envia o UID como parâmetro
          }
        );

        if (response.status === 200) {
          console.log("Projetos do usuário:", response.data);
          setUserProjects(response.data); // Atualiza o estado com os projetos retornados
        } else {
          console.error("Erro ao buscar projetos:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    const fetchParticipationRequests = async () => {
      try {
        // Recupera o uid do localStorage
        const userData = localStorage.getItem("user");
        const uid = userData ? JSON.parse(userData).user.uid : null;

        if (!uid) {
          console.error("UID do usuário não encontrado.");
          return;
        }

        // Faz a requisição GET para a rota /participationRequests
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_API}/project/:id/requests`,
          {
            params: { uid }, // Envia o UID como parâmetro
          }
        );

        if (response.status === 200) {
          console.log("Solicitações de participação:", response.data);
          setParticipationRequests(response.data); // Atualiza o estado com as solicitações retornadas
        } else {
          console.error("Erro ao buscar solicitações:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
      }
    };

    const fetchParticipatedProjects = async () => {
      try {
        // Recupera o uid do localStorage
        const userData = localStorage.getItem("user");
        const uid = userData ? JSON.parse(userData).user.uid : null;

        if (!uid) {
          console.error("UID do usuário não encontrado.");
          return;
        }

        // Faz a requisição GET para a rota /participatedProjects
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_API}//user/:id/participations`,
          {
            params: { uid }, // Envia o UID como parâmetro
          }
        );

        if (response.status === 200) {
          console.log("Projetos contribuídos:", response.data);
          setParticipatedProjects(response.data); // Atualiza o estado com os projetos retornados
        } else {
          console.error("Erro ao buscar projetos contribuídos:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar projetos contribuídos:", error);
      }
    };



    fetchParticipationRequests(); // Chama a função para buscar as solicitações de participação
    fetchUserProjects(); // Chama a função para buscar os projetos do usuário
    fetchParticipatedProjects(); // Chama a função para buscar os projetos contribuídos
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    // Recupera o uid do localStorage
    const userData = localStorage.getItem("user");
    const uid = userData ? JSON.parse(userData).user.uid : null;

    if (!uid) {
      console.error("UID do usuário não encontrado.");
      return;
    }

    const projectData = {
      uid,
      name: projectName,
      description: projectDescription,
      githubLink: projectGithubLink,
    };

    

    console.log("Dados do projeto:", projectData);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL_API}/Addproject`,
        projectData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Projeto criado com sucesso:", response.data);
        // Limpa os campos do formulário após o envio
        setProjectName("");
        setProjectDescription("");
        setProjectGithubLink("");
        setSelectedGithubProject("")
      } else {
        console.error("Erro ao criar projeto:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao enviar projeto:", error);
    }
  };

  const fetchGithubProjects = async () => {
    try {
      setIsLoadingGithubProjects(true); // Inicia o carregamento
      const userData = localStorage.getItem("user");
      const parsedData = userData ? JSON.parse(userData) : null;
      const username = parsedData?.username; // Acessa o username diretamente no nível superior

      console.log("Nome de usuário do GitHub:", username);

      if (!username) {
        console.error("Nome de usuário do GitHub não encontrado.");
        setIsLoadingGithubProjects(false); // Finaliza o carregamento
        return;
      }

      const response = await axios.get(`https://api.github.com/users/${username}/repos`);

      if (response.status === 200) {
        setGithubProjects(response.data); // Atualiza o estado com os repositórios do GitHub
      } else {
        console.error("Erro ao buscar projetos do GitHub:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao buscar projetos do GitHub:", error);
    } finally {
      setIsLoadingGithubProjects(false); // Finaliza o carregamento
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Avatar */}
      <Avatar
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
                <CardHeader className="flex justify-between items-center">
                <CardTitle>Projetos Adicionados</CardTitle>
                {/* Dialog para Adicionar Projeto */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        Adicionar Projeto
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Projeto</DialogTitle>
                        <DialogDescription>
                        Preencha as informações abaixo para adicionar um novo
                        projeto.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                        handleCreateProject(e);
                        // Limpa os campos do formulário
                        setProjectName("");
                        setProjectDescription("");
                        setProjectGithubLink("");
                        // Fecha o pop-up
                        setIsDialogOpen(false);
                        }}
                    >
                        <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Nome do Projeto
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Digite o nome do projeto"
                            required
                        />
                        </div>
                        <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Digite uma breve descrição"
                            required
                        />
                        </div>
                        <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            projetos
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={fetchGithubProjects}>
                              {selectedGithubProject || "Selecione um projeto do GitHub"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Projetos do GitHub</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isLoadingGithubProjects ? (
                              <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
                            ) : githubProjects.length > 0 ? (
                              githubProjects.map((repo) => (
                                <DropdownMenuItem
                                  key={repo.id}
                                  onClick={() => {
                                    setSelectedGithubProject(repo.name);
                                    setProjectGithubLink(repo.html_url); // Atualiza o link do GitHub
                                  }}
                                >
                                  {repo.name}
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <DropdownMenuItem disabled>Nenhum projeto encontrado</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                        <DialogFooter>
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
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
                        <TableHead className="text-left text-gray-600">
                        Ajudas
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {userProjects.length > 0 ? (
                        userProjects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="text-gray-800">
                            {project.title}
                            </TableCell>
                            <TableCell className="text-gray-800">
                            {project.description}
                            </TableCell>
                            <TableCell className="text-gray-800">
                            {project.languages
                                ? project.languages.join(", ")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-800">
                            {project.helpersCount || 0} pessoas
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell
                            colSpan={4}
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

            {/* Solicitações de Participação */}
            <Card className="w-full max-w-4xl">
                <CardHeader>
                <CardTitle>Solicitações de Participação</CardTitle>
                <CardDescription>
                    Gerencie as solicitações de novos participantes para seus
                    projetos.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table className="w-full">
                    <TableHeader>
                    <TableRow>
                        <TableHead className="text-left text-gray-600">
                        Nome
                        </TableHead>
                        <TableHead className="text-left text-gray-600">
                        E-mail
                        </TableHead>
                        <TableHead className="text-left text-gray-600">
                        Projeto
                        </TableHead>
                        <TableHead className="text-center text-gray-600">
                        Ações
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {participationRequests.length > 0 ? (
                        participationRequests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell className="text-gray-800">
                            {request.name}
                            </TableCell>
                            <TableCell className="text-gray-800">
                            {request.email}
                            </TableCell>
                            <TableCell className="text-gray-800">
                            {request.projectName}
                            </TableCell>
                            <TableCell className="text-center">
                            <Button
                                className="mr-2"
                                onClick={() =>
                                console.log(
                                    `Aceitar solicitação de ${request.name}`
                                )
                                }
                            >
                                Aceitar
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                console.log(
                                    `Recusar solicitação de ${request.name}`
                                )
                                }
                            >
                                Recusar
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell
                            colSpan={4}
                            className="text-center text-gray-600"
                        >
                            Nenhuma solicitação encontrada.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

            {/* Projetos Contribuídos */}
            <Card className="w-full lg:w-[27%] max-w-4xl">
            <CardHeader>
                <CardTitle>Projetos Contribuídos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="w-full">
                <TableHeader>
                    <TableRow>
                    <TableHead className="text-center text-gray-600">
                        Nome do Projeto
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participatedProjects.length > 0 ? (
                    participatedProjects.map((project) => (
                        <TableRow key={project.id}>
                        <TableCell className="text-gray-800 text-center">
                            <Link href={`/ProjectPage/${project.id}`}>
                            <a className="text-blue-500 hover:underline">{project.title}</a>
                            </Link>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell className="text-gray-600 text-center">
                        Nenhum projeto encontrado.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
      </div>
    </div>
  );
};

export default UserInfoByOwner;
