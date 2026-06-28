import { PageHeader } from "@/components/page-header";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const pt = (await getLocale()) === "pt-BR";

  return (
    <div className="max-w-2xl">
      <PageHeader title={pt ? "Termos de uso" : "Terms of use"} />

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1 font-semibold">{pt ? "Uso do serviço" : "Use of the service"}</h2>
          <p className="text-muted-foreground">
            {pt
              ? "Esta é uma ferramenta interna de gestão de empréstimos e locações. Você é responsável pela exatidão dos dados que cadastra e por usar o serviço de acordo com a lei aplicável."
              : "This is an internal tool for managing loans and rentals. You are responsible for the accuracy of the data you enter and for using the service in accordance with applicable law."}
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">{pt ? "Sua conta" : "Your account"}</h2>
          <p className="text-muted-foreground">
            {pt
              ? "Mantenha sua senha em segurança. As contas são criadas por um administrador, e você é responsável pela atividade realizada na sua conta."
              : "Keep your password safe. Accounts are created by an administrator, and you are responsible for activity performed under your account."}
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">{pt ? "Disponibilidade" : "Availability"}</h2>
          <p className="text-muted-foreground">
            {pt
              ? "O serviço é fornecido “no estado em que se encontra”. Buscamos a maior disponibilidade e segurança possíveis, mas nenhum sistema é totalmente livre de falhas."
              : "The service is provided “as is”. We strive for the highest possible availability and security, but no system is entirely free of faults."}
          </p>
        </section>
      </div>
    </div>
  );
}
