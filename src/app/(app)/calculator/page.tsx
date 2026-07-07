import { PageHeader } from "@/components/page-header";
import { getT } from "@/lib/i18n/server";
import { Calculator } from "./calculator";

export default async function CalculatorPage() {
  const t = await getT();
  return (
    <div>
      <PageHeader
        title={t("calculator.title")}
        // description={t("calculator.description")}
      />
      <Calculator />
    </div>
  );
}
