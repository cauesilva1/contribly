import { getSwipeDeck } from "@/app/actions";
import { SwipeDeck } from "@/components/swipe-deck";

export default async function SwipePage() {
  const projects = await getSwipeDeck();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl text-[#0d1117]">Swipe</h1>
        <p className="mt-2 text-[#57606a]">
          Passe ou demonstre interesse. O mantenedor recebe o pedido no inbox.
        </p>
      </div>
      <SwipeDeck projects={projects} />
    </div>
  );
}
