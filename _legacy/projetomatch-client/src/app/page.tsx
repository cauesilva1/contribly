"use client";

import { GithubLoginButton } from "@/components/GithubLoginButton";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between bg-[#F3F4F6] min-h-screen sm:p-5 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-between items-center w-full px-4 py-4 sm:px-0 sm:py-0">
        <h1 className="font-inria text-4xl">OpenMatch</h1>
        <GithubLoginButton className="text-white cursor-pointer">Login com github</GithubLoginButton>
      </header>

      <main className=" gap-[32px] items-center sm:items-start">
        <section className="w-full flex flex-col justify-center text-center">
          <div className="gap-3 flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold text-center">
              Conecte-se com projetos <br /> Open Source
            </h1>

            <h2 className="text-2xl text-center text-[#6B7280]">
              Encontre projetos abertos e contribua com seu <br />
              conhecimento
            </h2>
          </div>
        </section>

        <section className="flex flex-col mt-4">
          <h2 className="text-5xl font-bold text-center sm:text-left">Destaques</h2>

          <div className="flex flex-wrap gap-5 justify-center mt-5">
            {[1, 2, 3].map((index) => (
              <Card 
                key={index}
                className="w-[250px] h-[150px] p-3 bg-white m-5 flex flex-col"
              >
                <h3 className="text-2xl font-bold">Nome do projeto</h3>
                <p className="text-[#6B7280] mt-2">Descrição do projeto</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center ">
        <a href="/sobre" className="hover:text-blue-600">Sobre</a>
        <a href="/contato" className="hover:text-blue-600">Contato</a>
        <a 
          href="https://github.com/seu-usuario/openmatch" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-600"
        >
          Github
        </a>
      </footer>
    </div>
  );
}
