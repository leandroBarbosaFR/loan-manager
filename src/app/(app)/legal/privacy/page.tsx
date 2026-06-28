import { PageHeader } from "@/components/page-header";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const pt = (await getLocale()) === "pt-BR";

  return (
    <div className="max-w-2xl">
      <PageHeader title={pt ? "Privacidade & Segurança" : "Privacy & Security"} />

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1 font-semibold">
            {pt ? "Segurança dos dados" : "Data security"}
          </h2>
          <p className="text-muted-foreground">
            {pt
              ? "Levamos a segurança a sério. Todos os dados trafegam por conexões criptografadas (HTTPS/TLS) e são armazenados de forma criptografada em repouso pela nossa infraestrutura de banco de dados. O acesso é protegido por autenticação, e cada conta enxerga apenas os seus próprios dados (isolamento por linha no banco)."
              : "We take security seriously. All data travels over encrypted connections (HTTPS/TLS) and is stored encrypted at rest by our database infrastructure. Access is protected by authentication, and each account can only see its own data (row-level isolation in the database)."}
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">
            {pt ? "Quais dados guardamos" : "What we store"}
          </h2>
          <p className="text-muted-foreground">
            {pt
              ? "Guardamos apenas os dados necessários para o funcionamento do serviço: seu perfil (nome, e-mail, telefone, endereço) e os registros que você cria (clientes, empréstimos, veículos, locações e pagamentos)."
              : "We store only the data needed to run the service: your profile (name, email, phone, address) and the records you create (customers, loans, vehicles, rentals and payments)."}
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">
            {pt ? "Seus direitos" : "Your rights"}
          </h2>
          <p className="text-muted-foreground">
            {pt
              ? "Você pode editar seus dados de perfil a qualquer momento em Configurações, e pode solicitar a exclusão da sua conta e dos dados associados entrando em contato com o administrador."
              : "You can edit your profile data anytime in Settings, and you can request deletion of your account and associated data by contacting the administrator."}
          </p>
        </section>
      </div>
    </div>
  );
}
