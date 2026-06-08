import { requireUser, getRole } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const role = await getRole();
  return (
    <AppShell email={user.email ?? "admin"} isSuperAdmin={role === "super_admin"}>
      {children}
    </AppShell>
  );
}
