"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const LINKS: { href: string; key: MessageKey }[] = [
  { href: "/", key: "nav.dashboard" },
  { href: "/customers", key: "nav.customers" },
  { href: "/loans", key: "nav.loans" },
  { href: "/installments", key: "nav.installments" },
  { href: "/reports", key: "nav.reports" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="flex flex-col">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            "border-l-2 border-transparent px-4 py-2 text-sm text-black hover:bg-muted",
            isActive(pathname, link.href) &&
              "border-l-black bg-muted font-medium",
          )}
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
