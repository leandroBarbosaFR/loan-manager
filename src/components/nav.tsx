"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import {
  DashboardIcon,
  CustomersIcon,
  LoansIcon,
  InstallmentsIcon,
  ReportsIcon,
  CalculatorIcon,
  WhatsappIcon,
  UsersIcon,
  VehiclesIcon,
  type IconProps,
} from "@/components/nav-icons";

type NavLink = { href: string; key: MessageKey; Icon: (p: IconProps) => React.ReactElement };

const LINKS: NavLink[] = [
  { href: "/dashboard", key: "nav.dashboard", Icon: DashboardIcon },
  { href: "/customers", key: "nav.customers", Icon: CustomersIcon },
  { href: "/loans", key: "nav.loans", Icon: LoansIcon },
  { href: "/vehicles", key: "nav.vehicles", Icon: VehiclesIcon },
  { href: "/installments", key: "nav.installments", Icon: InstallmentsIcon },
  { href: "/reports", key: "nav.reports", Icon: ReportsIcon },
  { href: "/calculator", key: "nav.calculator", Icon: CalculatorIcon },
  { href: "/whatsapp", key: "nav.whatsapp", Icon: WhatsappIcon },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/users", key: "nav.users", Icon: UsersIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({
  onNavigate,
  isSuperAdmin = false,
}: {
  onNavigate?: () => void;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const t = useT();
  const links = isSuperAdmin ? [...LINKS, ...ADMIN_LINKS] : LINKS;
  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active &&
                "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <link.Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-accent-foreground" : "text-muted-foreground",
              )}
            />
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
