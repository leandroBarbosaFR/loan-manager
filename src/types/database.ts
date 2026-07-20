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
  full_name: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
};

export type ReminderType = "d2" | "d1" | "due";

export type WhatsappSettings = {
  owner_id: string;
  enabled: boolean;
  send_hour: number;
  send_minute: number;
  timezone: string;
  lang: string;
  template_2d: string | null;
  template_1d: string | null;
  template_due: string | null;
  phrase_2d: string | null;
  phrase_1d: string | null;
  phrase_due: string | null;
  updated_at: string;
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
  neighborhood: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  /** The customer who referred this one ("indicação"). */
  referred_by_id: string | null;
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

export type VehicleType = "car" | "motorcycle";
export type VehicleStatus = "available" | "rented" | "maintenance" | "inactive";

export type Vehicle = {
  id: string;
  owner_id: string;
  type: VehicleType;
  name: string;
  brand: string | null;
  model_year: number | null;
  color: string | null;
  plate: string | null;
  chassis: string | null;
  doors: number | null;
  has_gps: boolean;
  can_remote_block: boolean;
  had_accident: boolean;
  has_insurance: boolean;
  insurance_company: string | null;
  insurance_expiry: string | null;
  ipva_paid: boolean;
  ipva_due_date: string | null;
  status: VehicleStatus;
  notes: string | null;
  created_at: string;
};

export type VehicleMaintenance = {
  id: string;
  owner_id: string;
  vehicle_id: string;
  service_date: string;
  description: string;
  cost: number;
  odometer: number | null;
  created_at: string;
};

export type PeriodType = "daily" | "weekly" | "monthly";
export type RentalStatus = "active" | "closed";

export type Rental = {
  id: string;
  owner_id: string;
  vehicle_id: string;
  customer_id: string;
  period_type: PeriodType;
  period_count: number;
  rate: number;
  total: number;
  deposit: number;
  start_date: string;
  status: RentalStatus;
  notes: string | null;
  created_at: string;
};

export type RentalInstallment = {
  id: string;
  owner_id: string;
  rental_id: string;
  period_index: number;
  due_date: string;
  amount: number;
  paid_amount: number | null;
  paid_at: string | null;
  status: InstallmentStatus;
  created_at: string;
};

export type RentalPayment = {
  id: string;
  owner_id: string;
  rental_id: string;
  rental_installment_id: string;
  amount: number;
  paid_at: string;
  note: string | null;
  created_at: string;
};

export type RentalWithRelations = Rental & {
  vehicle: Vehicle | null;
  customer: Customer | null;
  installments: RentalInstallment[];
};

export type Payment = {
  id: string;
  owner_id: string;
  loan_id: string;
  installment_id: string;
  amount: number;
  paid_at: string;
  note: string | null;
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
  /** One-time late fine as a % of the overdue balance (0 = none). */
  late_fee_percent: number;
  /** Monthly arrears interest as a % (0 = none). */
  late_interest_percent_month: number;
  /** Fixed fee (in currency) charged per day an installment is late (0 = none). */
  late_daily_fee: number;
  /** Set when this loan was created by renegotiating an older one. */
  renegotiated_from_id: string | null;
  /** Set on the old loan when it was renegotiated into a newer one. */
  renegotiated_to_id: string | null;
  renegotiated_at: string | null;
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
        Insert: {
          id?: string;
          created_at?: string;
          owner_id: string;
          customer_id: string;
          principal: number;
          total_receivable: number;
          loan_date: string;
          status?: LoanStatus;
          notes?: string | null;
          rollover_fee?: number | null;
          late_fee_percent?: number;
          late_interest_percent_month?: number;
          late_daily_fee?: number;
          renegotiated_from_id?: string | null;
          renegotiated_to_id?: string | null;
          renegotiated_at?: string | null;
        };
        Update: Partial<Omit<Loan, "id" | "created_at">>;
        Relationships: [];
      };
      vehicles: {
        Row: Vehicle;
        Insert: { owner_id: string; name: string } & Partial<
          Omit<Vehicle, "owner_id" | "name">
        >;
        Update: Partial<Omit<Vehicle, "id" | "created_at">>;
        Relationships: [];
      };
      vehicle_maintenance: {
        Row: VehicleMaintenance;
        Insert: Omit<VehicleMaintenance, "id" | "created_at" | "odometer"> & {
          id?: string;
          created_at?: string;
          odometer?: number | null;
        };
        Update: Partial<Omit<VehicleMaintenance, "id" | "created_at">>;
        Relationships: [];
      };
      rentals: {
        Row: Rental;
        Insert: Omit<Rental, "id" | "created_at" | "status" | "deposit"> & {
          id?: string;
          created_at?: string;
          status?: RentalStatus;
          deposit?: number;
        };
        Update: Partial<Omit<Rental, "id" | "created_at">>;
        Relationships: [];
      };
      rental_installments: {
        Row: RentalInstallment;
        Insert: Omit<
          RentalInstallment,
          "id" | "created_at" | "paid_amount" | "paid_at" | "status"
        > & {
          id?: string;
          created_at?: string;
          paid_amount?: number | null;
          paid_at?: string | null;
          status?: InstallmentStatus;
        };
        Update: Partial<Omit<RentalInstallment, "id" | "created_at">>;
        Relationships: [];
      };
      rental_payments: {
        Row: RentalPayment;
        Insert: Omit<RentalPayment, "id" | "created_at" | "note"> & {
          id?: string;
          created_at?: string;
          note?: string | null;
        };
        Update: Partial<Omit<RentalPayment, "id" | "created_at">>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "note"> & {
          id?: string;
          created_at?: string;
          note?: string | null;
        };
        Update: Partial<Omit<Payment, "id" | "created_at">>;
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
        Insert: { id: string } & Partial<Omit<Profile, "id">>;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      whatsapp_settings: {
        Row: WhatsappSettings;
        Insert: { owner_id: string } & Partial<Omit<WhatsappSettings, "owner_id">>;
        Update: Partial<Omit<WhatsappSettings, "owner_id">>;
        Relationships: [];
      };
      whatsapp_reminders_log: {
        Row: {
          id: string;
          owner_id: string;
          installment_id: string;
          reminder_type: ReminderType;
          status: "sent" | "failed";
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          installment_id: string;
          reminder_type: ReminderType;
          status?: "sent" | "failed";
          error?: string | null;
          created_at?: string;
        };
        Update: Partial<{ status: "sent" | "failed"; error: string | null }>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
