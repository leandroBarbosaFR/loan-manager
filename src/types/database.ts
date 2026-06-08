/**
 * Domain & database types.
 *
 * These mirror the Postgres schema in `supabase/migrations`. Money columns are
 * `numeric` in Postgres; the supabase-js client returns them as `number`.
 *
 * NOTE: the Row/Insert/Update types are declared with `type` (not `interface`)
 * on purpose — supabase-js requires each table to be assignable to
 * `Record<string, unknown>`, and only type aliases get the implicit index
 * signature that makes that hold.
 */

export type LoanStatus = "open" | "paid" | "overdue";
export type InstallmentStatus = "pending" | "paid" | "overdue";
export type InstallmentKind = "scheduled" | "fee" | "principal";
export type UserRole = "super_admin" | "user";

export type Profile = {
  id: string;
  email: string | null;
  role: UserRole;
  created_at: string;
};

export type Customer = {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  birthday: string | null;
  phone_ddd: string | null;
  street: string | null;
  street_number: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
};

export type CustomerDocument = {
  id: string;
  owner_id: string;
  customer_id: string;
  name: string;
  path: string;
  created_at: string;
};

export type Loan = {
  id: string;
  owner_id: string;
  customer_id: string;
  principal: number;
  total_receivable: number;
  loan_date: string;
  status: LoanStatus;
  notes: string | null;
  /** Recurring per-period fee for interest-only loans; null for normal loans. */
  rollover_fee: number | null;
  created_at: string;
};

export type Installment = {
  id: string;
  owner_id: string;
  loan_id: string;
  due_date: string;
  amount: number;
  paid_amount: number | null;
  paid_at: string | null;
  status: InstallmentStatus;
  kind: InstallmentKind;
};

/** A loan joined with its customer and installments. */
export type LoanWithRelations = Loan & {
  customer: Customer | null;
  installments: Installment[];
};

/** An installment joined with its loan and that loan's customer. */
export type InstallmentWithRelations = Installment & {
  loan: (Loan & { customer: Customer | null }) | null;
};

/**
 * Minimal Supabase Database type so the typed client knows our tables.
 */
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: { id?: string; created_at?: string; name: string } & Partial<
          Omit<Customer, "id" | "created_at" | "name">
        >;
        Update: Partial<Omit<Customer, "id" | "created_at">>;
        Relationships: [];
      };
      customer_documents: {
        Row: CustomerDocument;
        Insert: Omit<CustomerDocument, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CustomerDocument, "id">>;
        Relationships: [];
      };
      loans: {
        Row: Loan;
        Insert: Omit<Loan, "id" | "created_at" | "status" | "rollover_fee"> & {
          id?: string;
          created_at?: string;
          status?: LoanStatus;
          rollover_fee?: number | null;
        };
        Update: Partial<Omit<Loan, "id" | "created_at">>;
        Relationships: [];
      };
      installments: {
        Row: Installment;
        Insert: {
          id?: string;
          owner_id?: string;
          loan_id: string;
          due_date: string;
          amount: number;
          paid_amount?: number | null;
          paid_at?: string | null;
          status?: InstallmentStatus;
          kind?: InstallmentKind;
        };
        Update: Partial<Omit<Installment, "id">>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
