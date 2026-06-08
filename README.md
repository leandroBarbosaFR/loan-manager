# Loan Manager

A simple, fast, mobile-first loan tracking system for personal/family lending.
Internal admin tool — single administrator, no signup flow.

Built with **Next.js 15 (App Router)**, **TypeScript (strict)**, **Tailwind CSS**,
**Supabase / PostgreSQL**, and **Zod**. The UI is intentionally plain: white
background, black text, gray borders, square corners, no shadows or animations —
closer to Airtable / a banking backoffice than a marketing site.

## Features

- **Dashboard** — principal lent, expected receivable, profit, collected,
  outstanding, and open/overdue/paid loan counts.
- **Customers** — full CRUD with name search, plus a per-customer detail page
  (loan history + totals).
- **Loans** — full CRUD, with optional one-click generation of evenly-split
  monthly installments (live preview).
- **Installments** — global list filtered by pending / paid / overdue, with
  inline "mark as paid" (amount + date) and undo.
- **Reports** — active / overdue / paid loans and monthly collections, each
  exportable to CSV.

## Tech & architecture

```
src/
  app/
    login/                 # public login (server action + client form)
    (app)/                 # protected route group (requires auth)
      layout.tsx           # app shell (sidebar nav, sign out)
      page.tsx             # dashboard
      customers/           # list, new, [id], [id]/edit  + actions.ts
      loans/               # list, new, [id], [id]/edit  + actions.ts
      installments/        # list + payment actions.ts
      reports/             # report tables
    api/reports/route.ts   # CSV export endpoint (auth-guarded)
  components/              # UI primitives (ui/) + shared components
  lib/
    supabase/              # browser / server / middleware clients (@supabase/ssr)
    repositories/          # data access (repository pattern), server-only
    validations.ts         # Zod schemas
    calc.ts                # pure domain math (installments, totals, status)
    format.ts              # money/date formatting (BRL by default)
  types/database.ts        # domain + typed Database schema
  middleware.ts            # session refresh + route protection
supabase/migrations/       # SQL schema
```

- **Server Components** fetch data directly via the repository layer.
- **Server Actions** handle every mutation; forms use `useActionState` and
  Zod validation, returning field-level errors.
- **Repositories** are the only place that touch Supabase, and are marked
  `server-only`.

## Setup

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a project. Then in the
**SQL Editor**, run the migration:

```
supabase/migrations/0001_initial_schema.sql
```

This creates the `customers`, `loans`, and `installments` tables, indexes, and
Row Level Security policies that grant full access to any authenticated user
(appropriate for a single-admin tool).

### 2. Create the admin user

In Supabase → **Authentication → Users → Add user**, create your single admin
account (email + password). There is no in-app signup.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from
Supabase → **Settings → API**:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — you'll be redirected to `/login`. Sign in with the
admin user you created.

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start the dev server     |
| `pnpm build`     | Production build         |
| `pnpm start`     | Run the production build |
| `pnpm typecheck` | `tsc --noEmit` (strict)  |
| `pnpm lint`      | Next.js lint             |

## Notes

- **Currency** is BRL (`R$`) by default. Change `CURRENCY` / `LOCALE` in
  [`src/lib/format.ts`](src/lib/format.ts) for another currency.
- **Loan & installment status** is derived from installment due dates and
  payments. Overdue statuses are refreshed on each dashboard/list view, and
  loan status is recomputed whenever a payment is registered or cleared.
- Installment amounts are split evenly; any rounding remainder lands on the
  final installment so they always sum exactly to the total receivable.
