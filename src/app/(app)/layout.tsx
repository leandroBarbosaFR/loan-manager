import { Suspense } from "react";
import { requireUser, getProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";
import { FlashToast } from "@/components/flash-toast";

/** SSR-inlined accent override so the user's saved color paints with no flash. */
function accentCss(hex: string | null): string | null {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (x: number) => Math.max(0, Math.round(x * 0.88));
  return `:root{--color-primary:${r} ${g} ${b};--color-ring:${r} ${g} ${b};--color-primary-hover:${d(r)} ${d(g)} ${d(b)};}`;
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await getProfile();
  const accent = profile?.accent_color ?? null;
  const css = accentCss(accent);

  return (
    <ToastProvider>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <AppShell
        email={user.email ?? "admin"}
        isSuperAdmin={profile?.role === "super_admin"}
        accentColor={accent}
      >
        {children}
      </AppShell>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </ToastProvider>
  );
}
