import { PageHeader } from "@/components/page-header";
import { LegalShell } from "@/components/legal-shell";
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-medium text-foreground">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function TermsPage() {
  const pt = (await getLocale()) === "pt-BR";

  return (
    <LegalShell>
      <PageHeader title={pt ? "Termos de uso" : "Terms of use"} />

      <p className="mb-6 text-xs text-muted-foreground">
        {pt ? "Última atualização: junho de 2026." : "Last updated: June 2026."}
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <Clause title={pt ? "Identificação da empresa" : "Company identification"}>
          <p>
            {pt
              ? "A Lendly é uma plataforma desenvolvida e mantida pela 1367 Studio. Para fins destes Termos de Uso e da Política de Privacidade, a 1367 Studio poderá ser identificada pelos seguintes dados:"
              : "Lendly is a platform developed and maintained by 1367 Studio. For the purposes of these Terms of Use and the Privacy Policy, 1367 Studio may be identified by the following details:"}
          </p>
          <dl className="rounded-lg bg-surface p-4 text-sm shadow-sm">
            <Row
              label={pt ? "Razão social" : "Legal name"}
              value={pt ? "[inserir razão social]" : "[insert legal name]"}
            />
            <Row label={pt ? "Nome fantasia" : "Trade name"} value="1367 Studio" />
            <Row label="CNPJ" value={pt ? "[inserir CNPJ]" : "[insert CNPJ]"} />
            <Row
              label={pt ? "Endereço" : "Address"}
              value={pt ? "[inserir endereço]" : "[insert address]"}
            />
            <Row
              label={pt ? "E-mail de contato" : "Contact email"}
              value={
                <a
                  href="mailto:contact@1367studio.com"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  contact@1367studio.com
                </a>
              }
            />
          </dl>
        </Clause>

        <Clause title={pt ? "Finalidade da plataforma" : "Purpose of the platform"}>
          <p>
            {pt
              ? "A Lendly é uma ferramenta tecnológica destinada ao controle, organização e registro de informações relacionadas a empréstimos de dinheiro e locação de carros ou motos."
              : "Lendly is a technological tool intended for the control, organization and recording of information related to money loans and the rental of cars or motorcycles."}
          </p>
          <p>
            {pt
              ? "A Lendly não é instituição financeira, não concede crédito, não realiza intermediação financeira, não processa pagamentos, não atua como correspondente bancário, não define taxas, não sugere juros, não fiscaliza valores e não participa da relação jurídica, comercial ou financeira entre o Usuário e terceiros."
              : "Lendly is not a financial institution, does not grant credit, does not perform financial intermediation, does not process payments, does not act as a banking correspondent, does not set fees, does not suggest interest, does not supervise amounts and does not take part in the legal, commercial or financial relationship between the User and third parties."}
          </p>
        </Clause>

        <Clause title={pt ? "Responsabilidade do Usuário" : "User responsibility"}>
          <p>
            {pt
              ? "A plataforma pode não impor limites técnicos mínimos ou máximos para valores, taxas, juros ou prazos cadastrados pelo Usuário. Contudo, isso não significa autorização, validação ou aprovação jurídica de qualquer operação. O Usuário é o único responsável por garantir que os valores, taxas, juros, prazos, contratos, cobranças e demais condições cadastradas estejam em conformidade com a legislação brasileira aplicável, incluindo, quando cabível, o Código Civil, a Lei da Usura, a legislação tributária, normas de prevenção à fraude, lavagem de dinheiro e demais normas aplicáveis ao caso concreto."
              : "The platform may not impose minimum or maximum technical limits on the amounts, fees, interest or terms entered by the User. However, this does not mean authorization, validation or legal approval of any operation. The User is solely responsible for ensuring that the amounts, fees, interest, terms, contracts, charges and other recorded conditions comply with applicable Brazilian law, including, where relevant, the Civil Code, the Usury Law, tax law, anti-fraud and anti-money-laundering rules, and any other rules applicable to the specific case."}
          </p>
        </Clause>

        <Clause title={pt ? "Uso proibido" : "Prohibited use"}>
          <p>
            {pt
              ? "É expressamente proibido utilizar a Lendly para práticas ilegais, abusivas ou fraudulentas, incluindo agiotagem, usura ilegal, cobrança abusiva, ocultação patrimonial, lavagem de dinheiro, fraude, simulação contratual ou qualquer outra atividade contrária à legislação brasileira."
              : "It is expressly forbidden to use Lendly for illegal, abusive or fraudulent practices, including loan-sharking, illegal usury, abusive collection, concealment of assets, money laundering, fraud, contractual simulation or any other activity contrary to Brazilian law."}
          </p>
        </Clause>

        <Clause title={pt ? "Isenção de responsabilidade" : "Disclaimer of liability"}>
          <p>
            {pt
              ? "A 1367 Studio e a Lendly não se responsabilizam pela legalidade, validade, exigibilidade, cobrança, inadimplência, cálculo de juros, tributação ou execução de qualquer operação cadastrada pelo Usuário na plataforma. O software é fornecido “no estado em que se encontra”, na máxima extensão permitida pela legislação aplicável."
              : "1367 Studio and Lendly are not liable for the legality, validity, enforceability, collection, default, interest calculation, taxation or execution of any operation recorded by the User on the platform. The software is provided “as is”, to the maximum extent permitted by applicable law."}
          </p>
        </Clause>

        <Clause title={pt ? "Dados e privacidade" : "Data and privacy"}>
          <p>
            {pt
              ? "Os dados são tratados conforme a nossa Política de Privacidade e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Para os dados que insere, o Usuário atua como controlador e a 1367 Studio como operadora. Todos os dados são armazenados de forma criptografada no banco de dados."
              : "Data is processed in accordance with our Privacy Policy and the Brazilian General Data Protection Law (Law No. 13.709/2018 — LGPD). For the data they enter, the User acts as controller and 1367 Studio as processor. All data is stored encrypted in the database."}
          </p>
        </Clause>

        <Clause title={pt ? "Propriedade intelectual" : "Intellectual property"}>
          <p>
            {pt
              ? "Todo o software, a marca e o código da Lendly são de propriedade da 1367 Studio. Estes Termos concedem ao Usuário apenas uma licença de uso, sem transferir qualquer direito de propriedade."
              : "All software, branding and code of Lendly are owned by 1367 Studio. These Terms grant the User only a license to use, without transferring any ownership rights."}
          </p>
        </Clause>

        <Clause title={pt ? "Lei aplicável e foro" : "Governing law and venue"}>
          <p>
            {pt
              ? "Estes Termos são regidos pela legislação brasileira. Fica eleito o foro do domicílio da 1367 Studio para dirimir eventuais controvérsias, salvo disposição legal em contrário."
              : "These Terms are governed by Brazilian law. The courts of 1367 Studio’s domicile are elected to resolve any disputes, unless otherwise required by law."}
          </p>
        </Clause>
      </div>
    </LegalShell>
  );
}
