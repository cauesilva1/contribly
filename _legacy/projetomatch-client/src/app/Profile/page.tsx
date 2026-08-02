import Link from "next/link";
import UserInfoByOwner from "@/components/BigComponents/UserInfoByOwner";
export default function Profile() {

  return (
    <div className="flex flex-col bg-[#F3F4F6] min-h-screen p-4">
      {/* Header */}
      <header className="flex justify-between w-full items-center mb-6">
        <Link href="/InicialPage">
        <h1 className="font-inria text-2xl sm:text-4xl">OpenMatch</h1>
        </Link>
      </header>

      {/* Conteúdo */}
      <main className="flex  items-center gap-6 w-full">
        {/* Avatar e Nome */}
        <UserInfoByOwner className="w-full"/>

      </main>
    </div>
  );
}
