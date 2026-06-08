import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { requireSuperAdmin } from "@/lib/auth";
import { listProfiles } from "@/lib/repositories/users";
import { formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { UserForm } from "./user-form";
import { deleteUserAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [admin, t] = await Promise.all([requireSuperAdmin(), getT()]);
  const profiles = await listProfiles();

  return (
    <div>
      <PageHeader title={t("users.title")} description={t("users.description")} />

      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("users.newHeading")}
      </h2>
      <div className="mb-10">
        <UserForm />
      </div>

      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("users.empty")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("users.colEmail")}</TableHead>
              <TableHead>{t("users.colRole")}</TableHead>
              <TableHead>{t("users.colCreated")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const isSelf = p.id === admin.id;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.email ?? "—"}
                    {isSelf ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({t("users.you")})
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {p.role === "super_admin"
                      ? t("users.roleSuperAdmin")
                      : t("users.roleUser")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isSelf ? null : (
                      <DeleteButton
                        action={deleteUserAction.bind(null, p.id)}
                        confirmMessage={t("users.deleteConfirm")}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
