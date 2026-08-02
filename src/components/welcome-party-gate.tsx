import { getWelcomeState } from "@/app/welcome-actions";
import { WelcomeParty } from "@/components/welcome-party";

export async function WelcomePartyGate() {
  const state = await getWelcomeState();
  if (!state.show || !state.name) return null;
  return <WelcomeParty name={state.name} />;
}
