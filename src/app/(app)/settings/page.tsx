import { PageHeader } from "@/components/page-header";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SetPasswordForm } from "@/components/set-password-form";
import { buttonVariants } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";
import { changeOwnPasswordAction } from "./actions";
import { getProfile } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mb-3 mt-1 text-sm text-muted-foreground">{description}</p>
      ) : (
        <div className="mb-3" />
      )}
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const [profile, t] = await Promise.all([getProfile(), getT()]);

  return (
    <div>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <Section title={t("settings.profile")}>
        <ProfileForm profile={profile} />
      </Section>

      <Section title={t("settings.security")} description={t("settings.securityDesc")}>
        <div className="max-w-sm">
          <SetPasswordForm
            action={changeOwnPasswordAction}
            submitLabel={t("changePassword.submit")}
            requireCurrent
          />
        </div>
      </Section>

      <Section
        title={t("settings.dataExport")}
        description={t("settings.dataExportDesc")}
      >
        <a
          href="/api/export"
          download
          className={buttonVariants({ variant: "outline" })}
        >
          {t("settings.dataExportButton")}
        </a>
      </Section>

      <Section title={t("settings.language")}>
        <LanguageSwitcher />
      </Section>
    </div>
  );
}
