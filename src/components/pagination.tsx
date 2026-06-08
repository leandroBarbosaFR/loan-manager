import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
  makeHref,
  summary,
  previousLabel,
  nextLabel,
}: {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
  summary: string;
  previousLabel: string;
  nextLabel: string;
}) {
  if (totalPages <= 1) return null;

  const prevHref = currentPage > 1 ? makeHref(currentPage - 1) : null;
  const nextHref = currentPage < totalPages ? makeHref(currentPage + 1) : null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted-foreground tabular-nums">{summary}</span>
      <div className="flex">
        <PageLink href={prevHref} label={previousLabel} />
        <PageLink href={nextHref} label={nextLabel} className="border-l-0" />
      </div>
    </div>
  );
}

function PageLink({
  href,
  label,
  className,
}: {
  href: string | null;
  label: string;
  className?: string;
}) {
  const classes = cn(
    "border border-border px-3 py-1.5",
    className,
    href
      ? "bg-white text-black hover:bg-muted"
      : "cursor-not-allowed bg-muted text-muted-foreground",
  );
  if (!href) {
    return (
      <span className={classes} aria-disabled="true">
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}
