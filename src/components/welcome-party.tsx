"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { markWelcomeSeen } from "@/app/welcome-actions";
import { Button } from "@/components/ui/button";

type WelcomePartyProps = {
  name: string;
};

const PIECES = Array.from({ length: 48 }, (_, index) => index);

export function WelcomeParty({ name }: WelcomePartyProps) {
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const pieces = useMemo(
    () =>
      PIECES.map((index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        delay: `${(index % 12) * 0.08}s`,
        duration: `${2.4 + (index % 5) * 0.25}s`,
        color: ["#1f6feb", "#cf222e", "#1a7f37", "#bf8700", "#8250df", "#ddf4ff"][
          index % 6
        ],
        rotate: `${(index * 47) % 360}deg`,
        size: 6 + (index % 5) * 2,
      })),
    []
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function dismiss() {
    startTransition(async () => {
      await markWelcomeSeen();
      setOpen(false);
    });
  }

  if (!open) return null;

  return (
    <div
      className="welcome-party-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-party-title"
    >
      <div className="welcome-party-confetti" aria-hidden="true">
        {pieces.map((piece) => (
          <span
            key={piece.id}
            className="welcome-party-piece"
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              background: piece.color,
              width: piece.size,
              height: piece.size * 1.4,
              transform: `rotate(${piece.rotate})`,
            }}
          />
        ))}
      </div>

      <div className="welcome-party-card surface-card">
        <p className="text-xs uppercase tracking-[0.28em] text-[#0969da]">
          Bem-vindo ao match
        </p>
        <h2
          id="welcome-party-title"
          className="mt-3 font-display text-3xl leading-tight text-[#0d1117] sm:text-4xl"
        >
          É festa, {name}!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#57606a] sm:text-base">
          Sua conta entrou no OpenMatch. Agora é hora de achar um repo que combine
          com você — sem enrolação, com swipe e convite.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="primary">
            <Link href="/for-you" onClick={dismiss}>
              Ver recomendações
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/swipe" onClick={dismiss}>
              Abrir swipe
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={dismiss}
          >
            {pending ? "Entrando..." : "Fechar e explorar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
