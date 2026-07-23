import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

/** Optional trimmed string that normalises empty input to null. */
const optionalShort = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

/** Optional UUID reference (empty → null). */
const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) =>
      v === null ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    { message: "Invalid reference" },
  );

/** Optional `YYYY-MM-DD` date (empty → null). */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "Use a valid date",
  });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD)");

/** Optional percentage (empty → 0). */
const percent = z.coerce
  .number({ invalid_type_error: "Enter a valid percentage" })
  .min(0, "Cannot be negative")
  .max(1000, "Percentage is too large")
  .optional()
  .default(0);

/** Optional whole number (empty → null). */
const optionalInt = z
  .preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(0).max(1_000_000),
  )
  .optional()
  .transform((v) => (v === undefined ? null : v));

const money = z.coerce
  .number({ invalid_type_error: "Enter a valid amount" })
  .nonnegative("Amount cannot be negative")
  .max(99_999_999.99, "Amount is too large");

/** Optional non-negative amount (empty → 0). */
const optionalMoney = z.coerce
  .number({ invalid_type_error: "Enter a valid amount" })
  .nonnegative("Amount cannot be negative")
  .max(99_999_999.99, "Amount is too large")
  .optional()
  .default(0);

// ---------------------------------------------------------------------------
// WhatsApp reminder settings
// ---------------------------------------------------------------------------
export const whatsappSettingsSchema = z.object({
  enabled: z.coerce.boolean().default(false),
  send_hour: z.coerce.number().int().min(0).max(23),
  send_minute: z.coerce.number().int().min(0).max(59).default(0),
  timezone: z.string().trim().min(1).max(60),
  lang: z.string().trim().min(2).max(10),
  template_2d: optionalShort(200),
  template_1d: optionalShort(200),
  template_due: optionalShort(200),
  phrase_2d: optionalText,
  phrase_1d: optionalText,
  phrase_due: optionalText,
});

export type WhatsappSettingsInput = z.infer<typeof whatsappSettingsSchema>;

// ---------------------------------------------------------------------------
// Users (super-admin account management)
// ---------------------------------------------------------------------------
export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "weak_password"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "password_mismatch",
    path: ["confirm"],
  });

/** Profile fields shared by the create-user and edit-profile forms. */
const profileFields = {
  full_name: z.string().trim().min(1, "Name is required").max(200),
  phone: optionalShort(40),
  street: optionalShort(200),
  city: z.string().trim().min(1, "City is required").max(120),
  country: z.string().trim().min(1, "Country is required").max(120),
};

export const newUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["super_admin", "user"]).default("user"),
  ...profileFields,
});

export type NewUserInput = z.infer<typeof newUserSchema>;

/** A user editing their own profile (no email/password/role here). */
export const profileSchema = z.object(profileFields);

export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  birthday: optionalDate,
  phone_ddd: optionalShort(5),
  phone: optionalShort(40),
  street: optionalShort(200),
  street_number: optionalShort(20),
  street_complement: optionalShort(200),
  neighborhood: optionalShort(120),
  cep: optionalShort(20),
  city: optionalShort(120),
  state: optionalShort(60),
  referred_by_id: optionalUuid,
  referred_by_name: optionalShort(200),
  notes: optionalText,
});

export type CustomerInput = z.infer<typeof customerSchema>;

// ---------------------------------------------------------------------------
// Vehicles (rental fleet: cars & motorcycles)
// ---------------------------------------------------------------------------
export const vehicleSchema = z.object({
  type: z.enum(["car", "motorcycle"]).default("car"),
  name: z.string().trim().min(1, "Name is required").max(120),
  brand: optionalShort(80),
  model_year: optionalInt,
  color: optionalShort(40),
  plate: optionalShort(20),
  chassis: optionalShort(40),
  doors: optionalInt,
  has_gps: z.coerce.boolean().optional().default(false),
  can_remote_block: z.coerce.boolean().optional().default(false),
  had_accident: z.coerce.boolean().optional().default(false),
  has_insurance: z.coerce.boolean().optional().default(false),
  insurance_company: optionalShort(120),
  insurance_expiry: optionalDate,
  ipva_paid: z.coerce.boolean().optional().default(false),
  ipva_due_date: optionalDate,
  status: z
    .enum(["available", "rented", "maintenance", "inactive"])
    .default("available"),
  notes: optionalText,
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export const maintenanceSchema = z.object({
  service_date: isoDate,
  description: z.string().trim().min(1, "Describe the service").max(300),
  cost: money.optional().default(0),
  odometer: optionalInt,
});

export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const rentalSchema = z.object({
  vehicle_id: z.string().uuid("Select a vehicle"),
  customer_id: z.string().uuid("Select a customer"),
  period_type: z.enum(["daily", "weekly", "monthly"]),
  period_count: z.coerce.number().int().min(1).max(365),
  rate: money,
  deposit: money.optional().default(0),
  start_date: isoDate,
  notes: optionalText,
});

export type RentalInput = z.infer<typeof rentalSchema>;

// ---------------------------------------------------------------------------
// Loans
// ---------------------------------------------------------------------------
export const loanSchema = z
  .object({
    customer_id: z.string().uuid("Select a customer"),
    principal: money,
    total_receivable: money,
    loan_date: isoDate,
    notes: optionalText,
    // Late penalties (optional; 0 = none).
    late_fee_percent: percent,
    late_interest_percent_month: percent,
    late_daily_fee: optionalMoney,
    // Interest-only / rollover loan: borrower can pay just the fee each period.
    rollover: z.coerce.boolean().optional().default(false),
    // Installment generation (optional).
    generate_installments: z.coerce.boolean().optional().default(false),
    installment_count: z.coerce.number().int().min(1).max(120).optional(),
    first_due_date: isoDate.optional(),
    // Explicit per-installment amounts/dates. When present (and generation is
    // on) these override the even split, letting the user pin custom amounts.
    installments: z
      .array(z.object({ due_date: isoDate, amount: money }))
      .max(120)
      .optional(),
  })
  .refine((d) => d.total_receivable >= d.principal, {
    message: "Total receivable must be greater than or equal to principal",
    path: ["total_receivable"],
  })
  .refine((d) => !d.rollover || d.total_receivable > d.principal, {
    message: "A rollover loan needs a fee (total receivable above the amount)",
    path: ["total_receivable"],
  })
  .refine((d) => !d.rollover || d.first_due_date != null, {
    message: "First fee due date is required",
    path: ["first_due_date"],
  })
  .refine(
    (d) =>
      !d.generate_installments ||
      (d.installment_count != null && d.first_due_date != null),
    {
      message: "Installment count and first due date are required",
      path: ["installment_count"],
    },
  )
  .refine(
    (d) => {
      if (!d.generate_installments || !d.installments?.length) return true;
      const sum =
        Math.round(
          d.installments.reduce((acc, i) => acc + i.amount, 0) * 100,
        ) / 100;
      return Math.abs(sum - d.total_receivable) < 0.01;
    },
    {
      message: "Installment amounts must add up to the total receivable",
      path: ["installment_count"],
    },
  );

export type LoanInput = z.infer<typeof loanSchema>;

// ---------------------------------------------------------------------------
// Installment schedule (editing due dates / amounts)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Loan renegotiation
// ---------------------------------------------------------------------------
export const renegotiateSchema = z.object({
  include_late_charges: z.coerce.boolean().optional().default(false),
  discount: money.optional().default(0),
  total_receivable: money,
  installment_count: z.coerce.number().int().min(1).max(120),
  first_due_date: isoDate,
});

export type RenegotiateInput = z.infer<typeof renegotiateSchema>;

export const installmentScheduleSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        due_date: isoDate,
        amount: money,
      }),
    )
    .min(1, "There are no installments to update")
    .max(120),
});

export type InstallmentScheduleInput = z.infer<typeof installmentScheduleSchema>;

// ---------------------------------------------------------------------------
// Installment payment
// ---------------------------------------------------------------------------
export const installmentPaymentSchema = z.object({
  paid_amount: money.refine((v) => v > 0, "Enter an amount greater than zero"),
  paid_at: isoDate,
  note: optionalShort(200),
});

export type InstallmentPaymentInput = z.infer<typeof installmentPaymentSchema>;
