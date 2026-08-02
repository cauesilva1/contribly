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
    <div className="rounded-2xl border border-dashed border-[#d0d7de] bg-white p-10 text-center">
      <h2 className="font-display text-2xl text-[#0d1117]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[#57606a]">{description}</p>
      {actionLabel && actionHref && (
        <div className="mt-6">
          <Button asChild variant="primary">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
