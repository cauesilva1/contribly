import React from "react";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import ProjectCards from "@/components/BigComponents/ProjectCards";


export default function InicialPage() {
 
  return (
    <div className="flex flex-col items-center bg-[#F3F4F6] min-h-screen p-4">
      {/* Header */}
      <header className="flex justify-between w-full items-center px-4 py-4 sm:px-0 sm:py-0">
        <Link href="/InicialPage">
          <h1 className="font-inria text-4xl">OpenMatch</h1>
        </Link>
        <Link href="/Profile">
          <Avatar alt="Avatar do usuário" fallback="OU" className="w-20 h-20 rounded-full" />
        </Link>
      </header>

      <main className="mt-3 gap-[32px] items-center w-full">
        {/* Título e Subtítulo */}
        <div className="w-full flex flex-col items-start text-center gap-2">
          <h1 className="text-5xl font-bold text-center">Explore projetos</h1>
          <h3 className="text-2xl text-center text-[#6B7280]">
            Encontre o projeto que mais se parece com você
          </h3>
        </div>

        {/* Barra de Pesquisa 
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}

        {/* Cards */}
        <ProjectCards /> 
      </main>
    </div>
  );
}
