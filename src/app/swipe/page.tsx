import { getSwipeDeck } from "@/app/actions";
import { SwipeDeck } from "@/components/swipe-deck";

export default async function SwipePage() {
  const projects = await getSwipeDeck();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          Matchmaking
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117] md:text-4xl">
          Swipe
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#57606a]">
          Projetos ordenados pelo seu match. Passe ou demonstre interesse — o
          mantenedor recebe no inbox.
        </p>
      </div>
      <SwipeDeck projects={projects} />
    </div>
  );
}
