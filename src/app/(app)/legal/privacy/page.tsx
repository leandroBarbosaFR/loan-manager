import { PageHeader } from "@/components/page-header";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 font-semibold">{title}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function PrivacyPage() {
  const pt = (await getLocale()) === "pt-BR";

  return (
    <div className="max-w-2xl">
      <PageHeader title={pt ? "Política de Privacidade" : "Privacy Policy"} />

      <p className="mb-6 text-xs text-muted-foreground">
        {pt ? "Última atualização: junho de 2026." : "Last updated: June 2026."}
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <Clause
          title={
            pt
              ? "Papéis da 1367 Studio no tratamento de dados"
              : "1367 Studio’s roles in data processing"
          }
        >
          <p>
            {pt
              ? "Para os dados relacionados à criação de conta, autenticação, assinatura, cobrança, suporte, segurança, comunicação com o Usuário e funcionamento geral da plataforma, a 1367 Studio poderá atuar como controladora dos dados pessoais, nos termos da Lei Geral de Proteção de Dados."
              : "For data related to account creation, authentication, subscription, billing, support, security, communication with the User and the general operation of the platform, 1367 Studio may act as controller of the personal data, under the Brazilian General Data Protection Law (LGPD)."}
          </p>
          <p>
            {pt
              ? "Para os dados inseridos pelo próprio Usuário na plataforma, incluindo informações sobre terceiros, contratos, devedores, locatários, veículos, valores, prazos, cobranças e registros operacionais, o Usuário será considerado o controlador dos dados, cabendo à 1367 Studio atuar como operadora, tratando tais dados conforme as instruções do Usuário e para viabilizar o funcionamento da plataforma."
              : "For data entered by the User into the platform, including information about third parties, contracts, debtors, lessees, vehicles, amounts, terms, charges and operational records, the User shall be considered the controller of the data, with 1367 Studio acting as processor, handling such data according to the User’s instructions and to enable the operation of the platform."}
          </p>
        </Clause>

        <Clause title={pt ? "Base legal do Usuário" : "User’s legal basis"}>
          <p>
            {pt
              ? "O Usuário declara possuir base legal adequada para inserir, armazenar e tratar dados pessoais de terceiros na Lendly, responsabilizando-se pela origem, exatidão, legalidade e autorização de uso desses dados."
              : "The User declares that they have an adequate legal basis to enter, store and process third-party personal data in Lendly, taking responsibility for the origin, accuracy, legality and authorization to use such data."}
          </p>
        </Clause>

        <Clause title={pt ? "Segurança" : "Security"}>
          <p>
            {pt
              ? "A 1367 Studio adota medidas técnicas e organizacionais razoáveis para proteger os dados tratados pela plataforma, incluindo criptografia em trânsito e, quando tecnicamente implementada, criptografia em repouso no banco de dados."
              : "1367 Studio adopts reasonable technical and organizational measures to protect the data processed by the platform, including encryption in transit and, where technically implemented, encryption at rest in the database."}
          </p>
        </Clause>

        <Clause title={pt ? "Direitos do titular" : "Data subject rights"}>
          <p>
            {pt
              ? "O titular dos dados poderá exercer seus direitos previstos na LGPD por meio do e-mail: "
              : "The data subject may exercise their rights under the LGPD through the email: "}
            <a
              href="mailto:contact@1367studio.com"
              className="text-primary underline-offset-2 hover:underline"
            >
              contact@1367studio.com
            </a>
            .
          </p>
        </Clause>
      </div>
    </div>
  );
}
