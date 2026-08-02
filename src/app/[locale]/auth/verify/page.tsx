import { redirect } from "next/navigation";

/** Verificação por e-mail adiada — login/registro já entram com senha. */
export default function VerifyEmailPage() {
  redirect("/auth");
}
