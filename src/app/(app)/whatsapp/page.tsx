import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getWhatsappSettings } from "@/lib/repositories/whatsapp";
import { listCustomers } from "@/lib/repositories/customers";
import { getT } from "@/lib/i18n/server";
import { WhatsappForm } from "./whatsapp-form";
import { TestSender } from "./test-sender";

export const dynamic = "force-dynamic";

export default async function WhatsappPage() {
  await requireUser();
  const [settings, customers, t] = await Promise.all([
    getWhatsappSettings(),
    listCustomers(),
    getT(),
  ]);

  return (
    <div>
      <PageHeader
        title={t("whatsapp.title")}
        description={t("whatsapp.description")}
      />
      <WhatsappForm settings={settings} />

      <h2 className="mb-3 mt-10 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("whatsapp.testHeading")}
      </h2>
      <TestSender
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
