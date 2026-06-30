import Link from "next/link";
import { Brand } from "@/components/brand";

/** Minimal public chrome for the legal pages (no app sidebar / no auth). */
export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center border-b border-border bg-white px-6 py-4">
        <Link href="/">
          <Brand className="text-2xl" />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-2xl px-6 py-12">{children}</main>
    </div>
  );
}
