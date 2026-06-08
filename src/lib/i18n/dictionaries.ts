import type { Locale } from "./config";

/**
 * Flat message catalogue. `en` is the source of truth for the key set; every
 * other locale must provide the same keys (enforced by the `Messages` type).
 * Tokens like `{date}` are replaced by `t(key, { date })`.
 */
const en = {
  // Common / shared
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.saving": "Saving…",
  "common.view": "View",
  "common.remove": "Remove",
  "common.status": "Status",
  "common.date": "Date",
  "common.customer": "Customer",
  "common.amount": "Amount",
  "common.paid": "Paid",
  "common.dash": "—",
  "common.confirmDelete": "Are you sure? This cannot be undone.",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.customers": "Customers",
  "nav.loans": "Loans",
  "nav.installments": "Installments",
  "nav.reports": "Reports",
  "nav.calculator": "Calculator",
  "nav.users": "Users",

  // Calculator
  "calculator.title": "Calculator",
  "calculator.description": "A quick calculator, built in.",
  "calculator.error": "Error",

  // Users (admin)
  "users.title": "Users",
  "users.description": "Manage who can sign in. Each user sees only their own data.",
  "users.newHeading": "Add a user",
  "users.email": "Email",
  "users.password": "Password",
  "users.role": "Role",
  "users.roleSuperAdmin": "Super-admin",
  "users.roleUser": "User",
  "users.create": "Create user",
  "users.created": "User created.",
  "users.colEmail": "Email",
  "users.colRole": "Role",
  "users.colCreated": "Created",
  "users.you": "You",
  "users.deleteConfirm":
    "Delete this user and ALL their customers, loans and documents? This cannot be undone.",
  "users.empty": "No users yet.",

  // App shell
  "app.menu": "Menu",
  "app.close": "Close",
  "app.signOut": "Sign out",
  "app.language": "Language",

  // Statuses
  "status.open": "Open",
  "status.pending": "Pending",
  "status.paid": "Paid",
  "status.overdue": "Overdue",

  // Pagination
  "pagination.summary": "Page {current} of {total}",
  "pagination.previous": "Previous",
  "pagination.next": "Next",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.description": "Overview of all lending activity.",
  "dashboard.principalLent": "Principal lent",
  "dashboard.expectedReceivable": "Expected receivable",
  "dashboard.expectedProfit": "Expected profit",
  "dashboard.collected": "Collected",
  "dashboard.outstanding": "Outstanding",
  "dashboard.openLoans": "Open loans",
  "dashboard.overdueLoans": "Overdue loans",
  "dashboard.paidLoans": "Paid loans",
  "dashboard.customersCount": "{count} customers",
  "dashboard.loansCount": "{count} loans",

  // Loans list
  "loans.title": "Loans",
  "loans.description": "All loans issued.",
  "loans.new": "New loan",
  "loans.emptyTitle": "No loans yet",
  "loans.emptyDescription": "Create a loan to start tracking installments.",
  "loans.searchPlaceholder": "Search by customer or amount…",
  "loans.noMatchTitle": "No matching loans",
  "loans.noMatchDescription": "Try a different name or amount.",
  "loans.colNextPayment": "Next payment",
  "loans.colAmountLoaned": "Amount loaned",
  "loans.colReceivable": "Receivable",
  "loans.colProfit": "Profit",
  "loans.create": "Create loan",
  "loans.needCustomerTitle": "Add a customer first",
  "loans.needCustomerDescription":
    "You need at least one customer before creating a loan.",

  // Loan form
  "loanForm.customer": "Customer",
  "loanForm.selectCustomer": "Select a customer…",
  "loanForm.amountLoaned": "Amount loaned",
  "loanForm.addFee": "Add a fee (%)",
  "loanForm.fee": "Fee (%)",
  "loanForm.feeHint": "Fee: {fee} — total receivable {total}",
  "loanForm.totalReceivable": "Total receivable",
  "loanForm.totalHintFee": "Computed from the amount loaned and fee.",
  "loanForm.totalHintSum": "Sum of the installment amounts below.",
  "loanForm.totalHintManual": "Type your own total, or set a fee above.",
  "loanForm.loanDate": "Loan date",
  "loanForm.notes": "Notes",
  "loanForm.rollover": "Interest-only (rollover) loan",
  "loanForm.rolloverDescription":
    "The borrower can pay just the fee each period and keep the principal. Each rollover collects the fee again as profit.",
  "loanForm.firstFeeDueDate": "First fee due date",
  "loanForm.recurringFeeHint": "Recurring fee per period: {fee}",
  "loanForm.recurringFeeNeeded": "Set a fee (%) above so there is something to collect.",
  "loanForm.generate": "Generate monthly installments",
  "loanForm.installmentCount": "Number of installments",
  "loanForm.firstDueDate": "First due date",
  "loanForm.pinHint": "Edit any amount to pin it — the rest split the remainder.",
  "loanForm.freeHint": "Enter each installment amount — the total updates below.",
  "loanForm.reset": "Reset",
  "loanForm.total": "Total",
  "loanForm.mismatch":
    "Installments add up to {sum}, but the total receivable is {total}.",
  "loanForm.setTotal": "Set total to {sum}",
  "loanForm.submit": "Save loan",

  // Loan detail
  "loanDetail.loanTitle": "Loan",
  "loanDetail.issued": "Loan issued {date}",
  "loanDetail.rolloverButton": "Roll over (collect fee)",
  "loanDetail.rolloverConfirm":
    "Collect the {fee} fee and roll the principal forward to next period?",
  "loanDetail.rolloverBannerPrefix": "Interest-only loan — recurring fee of",
  "loanDetail.rolloverBannerSuffix":
    "per period. Use “Roll over” to collect the fee and keep the principal.",
  "loanDetail.principal": "Principal",
  "loanDetail.receivable": "Receivable",
  "loanDetail.profit": "Profit",
  "loanDetail.outstanding": "Outstanding",
  "loanDetail.notes": "Notes",
  "loanDetail.installments": "Installments",
  "loanDetail.noInstallmentsTitle": "No installments",
  "loanDetail.noInstallmentsDescription": "This loan has no installment schedule.",
  "loanDetail.colDueDate": "Due date",
  "loanDetail.colPaidOn": "Paid on",
  "loanDetail.kindFee": "Fee",
  "loanDetail.kindPrincipal": "Principal",
  "loanDetail.deleteLabel": "Delete loan",
  "loanDetail.deleteConfirm":
    "Delete this loan and all its installments? This cannot be undone.",
  "loanDetail.editTitle": "Edit loan",
  "loanDetail.saveChanges": "Save changes",

  // Payment schedule
  "schedule.heading": "Payment schedule",
  "schedule.updated": "Schedule updated.",
  "schedule.dueDate": "Due date",
  "schedule.total": "Total",
  "schedule.note": "Editing amounts here does not change the loan’s total receivable.",
  "schedule.submit": "Save schedule",

  // Payment control
  "payment.markPaid": "Mark as paid",
  "payment.undo": "Undo payment",
  "payment.paidOn": "Paid on",

  // Customers list
  "customers.title": "Customers",
  "customers.description": "People who borrow money.",
  "customers.new": "New customer",
  "customers.searchPlaceholder": "Search by name…",
  "customers.noMatchTitle": "No customers match your search",
  "customers.emptyTitle": "No customers yet",
  "customers.emptyDescription": "Add your first customer to start tracking loans.",
  "customers.colName": "Name",
  "customers.colPhone": "Phone",
  "customers.colNotes": "Notes",

  // Customer form
  "customerForm.fullName": "Full name",
  "customerForm.birthday": "Birthday",
  "customerForm.ddd": "DDD",
  "customerForm.phoneNumber": "Phone number",
  "customerForm.address": "Address",
  "customerForm.street": "Street",
  "customerForm.number": "Number",
  "customerForm.cep": "CEP",
  "customerForm.city": "City",
  "customerForm.state": "State",
  "customerForm.documents": "Proof of address / documents (PDF)",
  "customerForm.documentsHint": "Optional. You can select more than one PDF.",
  "customerForm.notes": "Notes",
  "customerForm.submit": "Save customer",
  "customerForm.create": "Create customer",

  // Customer detail
  "customerDetail.editTitle": "Edit customer",
  "customerDetail.saveChanges": "Save changes",
  "customerDetail.newLoan": "New loan",
  "customerDetail.profile": "Profile",
  "customerDetail.birthday": "Birthday",
  "customerDetail.phone": "Phone",
  "customerDetail.address": "Address",
  "customerDetail.documents": "Documents",
  "customerDetail.noDocuments": "No documents uploaded.",
  "customerDetail.removeDocConfirm": "Remove this document? This cannot be undone.",
  "customerDetail.totalBorrowed": "Total borrowed",
  "customerDetail.totalExpected": "Total expected",
  "customerDetail.totalPaid": "Total paid",
  "customerDetail.outstanding": "Outstanding",
  "customerDetail.loanHistory": "Loan history",
  "customerDetail.noLoansTitle": "No loans yet",
  "customerDetail.colPrincipal": "Principal",
  "customerDetail.colReceivable": "Receivable",
  "customerDetail.colOutstanding": "Outstanding",
  "customerDetail.deleteLabel": "Delete customer",
  "customerDetail.deleteConfirm":
    "Delete this customer and ALL their loans and installments? This cannot be undone.",

  // Installments
  "installments.title": "Installments",
  "installments.description": "Every scheduled payment across all loans.",
  "installments.filterAll": "All",
  "installments.filterPending": "Pending",
  "installments.filterPaid": "Paid",
  "installments.filterOverdue": "Overdue",
  "installments.empty": "No installments to show",
  "installments.colDueDate": "Due date",
  "installments.loanLink": "Loan",

  // Reports
  "reports.title": "Reports",
  "reports.description": "Snapshots of lending activity. Export any table to CSV.",
  "reports.exportCsv": "Export CSV",
  "reports.nothing": "Nothing to report",
  "reports.activeLoans": "Active loans",
  "reports.overdueLoans": "Overdue loans",
  "reports.paidLoans": "Paid loans",
  "reports.monthlyCollections": "Monthly collections",
  "reports.noPayments": "No payments collected yet",
  "reports.colDate": "Date",
  "reports.colPrincipal": "Principal",
  "reports.colReceivable": "Receivable",
  "reports.colPaid": "Paid",
  "reports.colOutstanding": "Outstanding",
  "reports.colMonth": "Month",
  "reports.colPayments": "Payments",
  "reports.colTotalCollected": "Total collected",

  // Login
  "login.subtitle": "Sign in to continue.",
  "login.email": "Email",
  "login.password": "Password",
  "login.signingIn": "Signing in…",
  "login.signIn": "Sign in",
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const ptBR: Messages = {
  // Common / shared
  "common.edit": "Editar",
  "common.delete": "Excluir",
  "common.save": "Salvar",
  "common.cancel": "Cancelar",
  "common.saving": "Salvando…",
  "common.view": "Ver",
  "common.remove": "Remover",
  "common.status": "Situação",
  "common.date": "Data",
  "common.customer": "Cliente",
  "common.amount": "Valor",
  "common.paid": "Pago",
  "common.dash": "—",
  "common.confirmDelete": "Tem certeza? Esta ação não pode ser desfeita.",

  // Navigation
  "nav.dashboard": "Painel",
  "nav.customers": "Clientes",
  "nav.loans": "Empréstimos",
  "nav.installments": "Parcelas",
  "nav.reports": "Relatórios",
  "nav.calculator": "Calculadora",
  "nav.users": "Usuários",

  // Calculator
  "calculator.title": "Calculadora",
  "calculator.description": "Uma calculadora rápida, já integrada.",
  "calculator.error": "Erro",

  // Users (admin)
  "users.title": "Usuários",
  "users.description": "Gerencie quem pode entrar. Cada usuário vê apenas os próprios dados.",
  "users.newHeading": "Adicionar usuário",
  "users.email": "E-mail",
  "users.password": "Senha",
  "users.role": "Papel",
  "users.roleSuperAdmin": "Super-admin",
  "users.roleUser": "Usuário",
  "users.create": "Criar usuário",
  "users.created": "Usuário criado.",
  "users.colEmail": "E-mail",
  "users.colRole": "Papel",
  "users.colCreated": "Criado em",
  "users.you": "Você",
  "users.deleteConfirm":
    "Excluir este usuário e TODOS os seus clientes, empréstimos e documentos? Esta ação não pode ser desfeita.",
  "users.empty": "Nenhum usuário ainda.",

  // App shell
  "app.menu": "Menu",
  "app.close": "Fechar",
  "app.signOut": "Sair",
  "app.language": "Idioma",

  // Statuses
  "status.open": "Aberto",
  "status.pending": "Pendente",
  "status.paid": "Pago",
  "status.overdue": "Atrasado",

  // Pagination
  "pagination.summary": "Página {current} de {total}",
  "pagination.previous": "Anterior",
  "pagination.next": "Próxima",

  // Dashboard
  "dashboard.title": "Painel",
  "dashboard.description": "Visão geral de toda a atividade de empréstimos.",
  "dashboard.principalLent": "Valor emprestado",
  "dashboard.expectedReceivable": "A receber previsto",
  "dashboard.expectedProfit": "Lucro previsto",
  "dashboard.collected": "Recebido",
  "dashboard.outstanding": "Em aberto",
  "dashboard.openLoans": "Empréstimos abertos",
  "dashboard.overdueLoans": "Empréstimos atrasados",
  "dashboard.paidLoans": "Empréstimos pagos",
  "dashboard.customersCount": "{count} clientes",
  "dashboard.loansCount": "{count} empréstimos",

  // Loans list
  "loans.title": "Empréstimos",
  "loans.description": "Todos os empréstimos concedidos.",
  "loans.new": "Novo empréstimo",
  "loans.emptyTitle": "Nenhum empréstimo ainda",
  "loans.emptyDescription": "Crie um empréstimo para começar a acompanhar as parcelas.",
  "loans.searchPlaceholder": "Buscar por cliente ou valor…",
  "loans.noMatchTitle": "Nenhum empréstimo encontrado",
  "loans.noMatchDescription": "Tente outro nome ou valor.",
  "loans.colNextPayment": "Próximo pagamento",
  "loans.colAmountLoaned": "Valor emprestado",
  "loans.colReceivable": "A receber",
  "loans.colProfit": "Lucro",
  "loans.create": "Criar empréstimo",
  "loans.needCustomerTitle": "Adicione um cliente primeiro",
  "loans.needCustomerDescription":
    "Você precisa de pelo menos um cliente antes de criar um empréstimo.",

  // Loan form
  "loanForm.customer": "Cliente",
  "loanForm.selectCustomer": "Selecione um cliente…",
  "loanForm.amountLoaned": "Valor emprestado",
  "loanForm.addFee": "Adicionar taxa (%)",
  "loanForm.fee": "Taxa (%)",
  "loanForm.feeHint": "Taxa: {fee} — total a receber {total}",
  "loanForm.totalReceivable": "Total a receber",
  "loanForm.totalHintFee": "Calculado a partir do valor emprestado e da taxa.",
  "loanForm.totalHintSum": "Soma dos valores das parcelas abaixo.",
  "loanForm.totalHintManual": "Digite seu próprio total, ou defina uma taxa acima.",
  "loanForm.loanDate": "Data do empréstimo",
  "loanForm.notes": "Observações",
  "loanForm.rollover": "Empréstimo só de juros (rollover)",
  "loanForm.rolloverDescription":
    "O cliente pode pagar apenas a taxa a cada período e manter o principal. Cada rollover cobra a taxa novamente como lucro.",
  "loanForm.firstFeeDueDate": "Primeiro vencimento da taxa",
  "loanForm.recurringFeeHint": "Taxa recorrente por período: {fee}",
  "loanForm.recurringFeeNeeded": "Defina uma taxa (%) acima para haver algo a cobrar.",
  "loanForm.generate": "Gerar parcelas mensais",
  "loanForm.installmentCount": "Número de parcelas",
  "loanForm.firstDueDate": "Primeiro vencimento",
  "loanForm.pinHint": "Edite qualquer valor para fixá-lo — o restante divide o saldo.",
  "loanForm.freeHint": "Informe o valor de cada parcela — o total é atualizado abaixo.",
  "loanForm.reset": "Redefinir",
  "loanForm.total": "Total",
  "loanForm.mismatch":
    "As parcelas somam {sum}, mas o total a receber é {total}.",
  "loanForm.setTotal": "Definir total como {sum}",
  "loanForm.submit": "Salvar empréstimo",

  // Loan detail
  "loanDetail.loanTitle": "Empréstimo",
  "loanDetail.issued": "Empréstimo concedido em {date}",
  "loanDetail.rolloverButton": "Rolar (cobrar taxa)",
  "loanDetail.rolloverConfirm":
    "Cobrar a taxa de {fee} e rolar o principal para o próximo período?",
  "loanDetail.rolloverBannerPrefix": "Empréstimo só de juros — taxa recorrente de",
  "loanDetail.rolloverBannerSuffix":
    "por período. Use “Rolar” para cobrar a taxa e manter o principal.",
  "loanDetail.principal": "Principal",
  "loanDetail.receivable": "A receber",
  "loanDetail.profit": "Lucro",
  "loanDetail.outstanding": "Em aberto",
  "loanDetail.notes": "Observações",
  "loanDetail.installments": "Parcelas",
  "loanDetail.noInstallmentsTitle": "Sem parcelas",
  "loanDetail.noInstallmentsDescription": "Este empréstimo não tem cronograma de parcelas.",
  "loanDetail.colDueDate": "Vencimento",
  "loanDetail.colPaidOn": "Pago em",
  "loanDetail.kindFee": "Taxa",
  "loanDetail.kindPrincipal": "Principal",
  "loanDetail.deleteLabel": "Excluir empréstimo",
  "loanDetail.deleteConfirm":
    "Excluir este empréstimo e todas as suas parcelas? Esta ação não pode ser desfeita.",
  "loanDetail.editTitle": "Editar empréstimo",
  "loanDetail.saveChanges": "Salvar alterações",

  // Payment schedule
  "schedule.heading": "Cronograma de pagamentos",
  "schedule.updated": "Cronograma atualizado.",
  "schedule.dueDate": "Vencimento",
  "schedule.total": "Total",
  "schedule.note": "Editar os valores aqui não altera o total a receber do empréstimo.",
  "schedule.submit": "Salvar cronograma",

  // Payment control
  "payment.markPaid": "Marcar como pago",
  "payment.undo": "Desfazer pagamento",
  "payment.paidOn": "Pago em",

  // Customers list
  "customers.title": "Clientes",
  "customers.description": "Pessoas que pegam dinheiro emprestado.",
  "customers.new": "Novo cliente",
  "customers.searchPlaceholder": "Buscar por nome…",
  "customers.noMatchTitle": "Nenhum cliente corresponde à busca",
  "customers.emptyTitle": "Nenhum cliente ainda",
  "customers.emptyDescription": "Adicione seu primeiro cliente para começar a acompanhar empréstimos.",
  "customers.colName": "Nome",
  "customers.colPhone": "Telefone",
  "customers.colNotes": "Observações",

  // Customer form
  "customerForm.fullName": "Nome completo",
  "customerForm.birthday": "Data de nascimento",
  "customerForm.ddd": "DDD",
  "customerForm.phoneNumber": "Número de telefone",
  "customerForm.address": "Endereço",
  "customerForm.street": "Rua",
  "customerForm.number": "Número",
  "customerForm.cep": "CEP",
  "customerForm.city": "Cidade",
  "customerForm.state": "Estado",
  "customerForm.documents": "Comprovante de endereço / documentos (PDF)",
  "customerForm.documentsHint": "Opcional. Você pode selecionar mais de um PDF.",
  "customerForm.notes": "Observações",
  "customerForm.submit": "Salvar cliente",
  "customerForm.create": "Criar cliente",

  // Customer detail
  "customerDetail.editTitle": "Editar cliente",
  "customerDetail.saveChanges": "Salvar alterações",
  "customerDetail.newLoan": "Novo empréstimo",
  "customerDetail.profile": "Perfil",
  "customerDetail.birthday": "Data de nascimento",
  "customerDetail.phone": "Telefone",
  "customerDetail.address": "Endereço",
  "customerDetail.documents": "Documentos",
  "customerDetail.noDocuments": "Nenhum documento enviado.",
  "customerDetail.removeDocConfirm": "Remover este documento? Esta ação não pode ser desfeita.",
  "customerDetail.totalBorrowed": "Total emprestado",
  "customerDetail.totalExpected": "Total previsto",
  "customerDetail.totalPaid": "Total pago",
  "customerDetail.outstanding": "Em aberto",
  "customerDetail.loanHistory": "Histórico de empréstimos",
  "customerDetail.noLoansTitle": "Nenhum empréstimo ainda",
  "customerDetail.colPrincipal": "Principal",
  "customerDetail.colReceivable": "A receber",
  "customerDetail.colOutstanding": "Em aberto",
  "customerDetail.deleteLabel": "Excluir cliente",
  "customerDetail.deleteConfirm":
    "Excluir este cliente e TODOS os seus empréstimos e parcelas? Esta ação não pode ser desfeita.",

  // Installments
  "installments.title": "Parcelas",
  "installments.description": "Todos os pagamentos agendados de todos os empréstimos.",
  "installments.filterAll": "Todas",
  "installments.filterPending": "Pendentes",
  "installments.filterPaid": "Pagas",
  "installments.filterOverdue": "Atrasadas",
  "installments.empty": "Nenhuma parcela para exibir",
  "installments.colDueDate": "Vencimento",
  "installments.loanLink": "Empréstimo",

  // Reports
  "reports.title": "Relatórios",
  "reports.description": "Resumos da atividade de empréstimos. Exporte qualquer tabela em CSV.",
  "reports.exportCsv": "Exportar CSV",
  "reports.nothing": "Nada a relatar",
  "reports.activeLoans": "Empréstimos ativos",
  "reports.overdueLoans": "Empréstimos atrasados",
  "reports.paidLoans": "Empréstimos pagos",
  "reports.monthlyCollections": "Recebimentos mensais",
  "reports.noPayments": "Nenhum pagamento recebido ainda",
  "reports.colDate": "Data",
  "reports.colPrincipal": "Principal",
  "reports.colReceivable": "A receber",
  "reports.colPaid": "Pago",
  "reports.colOutstanding": "Em aberto",
  "reports.colMonth": "Mês",
  "reports.colPayments": "Pagamentos",
  "reports.colTotalCollected": "Total recebido",

  // Login
  "login.subtitle": "Entre para continuar.",
  "login.email": "E-mail",
  "login.password": "Senha",
  "login.signingIn": "Entrando…",
  "login.signIn": "Entrar",
};

const dictionaries: Record<Locale, Messages> = {
  en,
  "pt-BR": ptBR,
};

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}

/** Builds a translation function bound to a dictionary. */
export function createTranslator(messages: Messages) {
  return function t(
    key: MessageKey,
    vars?: Record<string, string | number>,
  ): string {
    let text = messages[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
      }
    }
    return text;
  };
}

export type Translator = ReturnType<typeof createTranslator>;
