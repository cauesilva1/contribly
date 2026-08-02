import Link from "next/link";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#d0d7de] bg-white/90 p-6 text-center">
      <h2 className="font-display text-2xl text-[#0d1117]">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[#57606a]">{description}</p>
      {actionLabel && actionHref && (
        <div className="mt-4">
          <Button asChild variant="primary">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
