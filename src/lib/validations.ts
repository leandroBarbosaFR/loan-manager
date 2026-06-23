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

const money = z.coerce
  .number({ invalid_type_error: "Enter a valid amount" })
  .nonnegative("Amount cannot be negative")
  .max(99_999_999.99, "Amount is too large");

// ---------------------------------------------------------------------------
// WhatsApp reminder settings
// ---------------------------------------------------------------------------
export const whatsappSettingsSchema = z.object({
  enabled: z.coerce.boolean().default(false),
  send_hour: z.coerce.number().int().min(0).max(23),
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
export const newUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["super_admin", "user"]).default("user"),
});

export type NewUserInput = z.infer<typeof newUserSchema>;

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
  cep: optionalShort(20),
  city: optionalShort(120),
  state: optionalShort(60),
  notes: optionalText,
});

export type CustomerInput = z.infer<typeof customerSchema>;

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
  paid_amount: money,
  paid_at: isoDate,
});

export type InstallmentPaymentInput = z.infer<typeof installmentPaymentSchema>;
