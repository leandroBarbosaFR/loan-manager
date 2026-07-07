import * as React from "react";

/**
 * Shared page header. On desktop it stays pinned to the top of the scrolling
 * content area (`<main>` in the app shell) while everything below it scrolls —
 * so every page gets a consistent, fixed header for free. Pass filter tabs,
 * search bars, etc. as `children` to keep them pinned alongside the title.
 *
 * IMPORTANT: this pairs with `<main>` having `md:pt-0` (no top padding) in the
 * app shell, so the sticky element pins flush to the top with no gap. The two
 * must change together — top padding here (md:pt-6) replaces main's.
 */
export function PageHeader({
  title,
  description,
  action,
  badge,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Rendered inline just after the title (e.g. a status badge + primary CTA). */
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 bg-canvas md:sticky md:top-0 md:z-20 md:-mx-8 md:mb-4 md:px-8 md:pt-6">
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
