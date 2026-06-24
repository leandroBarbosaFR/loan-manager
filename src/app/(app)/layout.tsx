import { Suspense } from "react";
import { requireUser, getRole } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";
import { FlashToast } from "@/components/flash-toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const role = await getRole();
  return (
    <ToastProvider>
      <AppShell
        email={user.email ?? "admin"}
        isSuperAdmin={role === "super_admin"}
      >
        {children}
      </AppShell>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </ToastProvider>
  );
}
