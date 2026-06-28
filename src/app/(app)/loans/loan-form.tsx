"use client";

import { useActionState, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import type { ActionState } from "@/lib/action-state";
import type { Customer, Loan } from "@/types/database";
import { distributeInstallments, round2 } from "@/lib/calc";
import { formatMoney, formatDate, today, addMonths } from "@/lib/format";
import { useT } from "@/lib/i18n/context";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/** Recovers the implied fee % from a saved loan's principal & receivable. */
function impliedFeePct(loan?: Loan): string {
  if (!loan || !loan.principal) return "0";
  return String(round2((loan.total_receivable / loan.principal - 1) * 100));
}

export function LoanForm({
  action,
  customers,
  loan,
  defaultCustomerId,
  allowInstallments = true,
  submitLabel,
}: {
  action: Action;
  customers: Customer[];
  loan?: Loan;
  defaultCustomerId?: string;
  allowInstallments?: boolean;
  submitLabel?: string;
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);

  const [amount, setAmount] = useState(loan ? String(loan.principal) : "");
  // Total receivable as typed by hand (used when the fee helper is off).
  const [manualReceivable, setManualReceivable] = useState(
    loan ? String(loan.total_receivable) : "",
  );
  // Opt-in fee helper: when on, the total is derived from amount + fee %.
  const [useFee, setUseFee] = useState(
    loan ? loan.total_receivable !== loan.principal : false,
  );
  const [feePct, setFeePct] = useState(impliedFeePct(loan));
  const [rollover, setRollover] = useState(false);
  const [generate, setGenerate] = useState(false);
  const [count, setCount] = useState("5");
  const [firstDue, setFirstDue] = useState(today());
  // index -> raw amount string the user pinned by hand.
  const [pinned, setPinned] = useState<Record<number, string>>({});

  const amountNum = Number(amount) || 0;
  const feeNum = Number(feePct) || 0;
  const feeTotal = round2(amountNum * (1 + feeNum / 100));

  const n = Math.min(Number(count) || 0, 120);
  const showInstallments = generate && n >= 1 && !!firstDue;

  const plan = useMemo(() => {
    if (!showInstallments) return [];
    if (useFee) {
      // Fee drives the total; split it across installments, honouring pins.
      const fixed: Record<number, number> = {};
      for (const [key, value] of Object.entries(pinned)) {
        const idx = Number(key);
        const num = Number(value);
        if (idx < n && value !== "" && Number.isFinite(num)) fixed[idx] = num;
      }
      return distributeInstallments(feeTotal, n, firstDue, fixed);
    }
    // No fee: each installment is a free amount the user types.
    return Array.from({ length: n }, (_, i) => ({
      due_date: addMonths(firstDue, i),
      amount: round2(Number(pinned[i]) || 0),
    }));
  }, [showInstallments, useFee, feeTotal, n, firstDue, pinned]);

  const planSum = round2(plan.reduce((acc, p) => acc + p.amount, 0));

  // Effective total receivable:
  //  - fee on → amount + fee %
  //  - no fee + generating → sum of the installment amounts
  //  - no fee + no installments → typed by hand
  const receivable = useFee
    ? feeTotal
    : showInstallments
      ? planSum
      : Number(manualReceivable) || 0;
  const fee = round2(receivable - amountNum);

  // Only meaningful with a fee, where pins can over/under-shoot the fee total.
  const sumMismatch =
    useFee && plan.length > 0 && Math.abs(planSum - feeTotal) >= 0.01;

  function setPin(index: number, value: string) {
    setPinned((prev) => {
      const next = { ...prev };
      if (value === "") delete next[index];
      else next[index] = value;
      return next;
    });
  }

  return (
    <form action={formAction} className="max-w-3xl">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />

      <FormField
        label={t("loanForm.customer")}
        htmlFor="customer_id"
        errors={state?.fieldErrors?.customer_id}
      >
        <Select
          id="customer_id"
          name="customer_id"
          defaultValue={loan?.customer_id ?? defaultCustomerId ?? ""}
          required
        >
          <option value="" disabled>
            {t("loanForm.selectCustomer")}
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField
          label={t("loanForm.amountLoaned")}
          htmlFor="principal"
          errors={state?.fieldErrors?.principal}
        >
          <Input
            id="principal"
            name="principal"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </FormField>

        <FormField
          label={t("loanForm.loanDate")}
          htmlFor="loan_date"
          errors={state?.fieldErrors?.loan_date}
        >
          <Input
            id="loan_date"
            name="loan_date"
            type="date"
            defaultValue={loan?.loan_date ?? today()}
            required
          />
        </FormField>
      </div>

      {!rollover ? (
        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={useFee}
            onChange={(e) => {
              // Switching off keeps the current computed total as the manual one.
              if (!e.target.checked) setManualReceivable(String(receivable));
              setUseFee(e.target.checked);
            }}
            className="h-4 w-4 border-border"
          />
          {t("loanForm.addFee")}
        </label>
      ) : null}

      {useFee ? (
        <FormField
          label={t("loanForm.fee")}
          htmlFor="fee_pct"
          hint={t("loanForm.feeHint", {
            fee: formatMoney(fee),
            total: formatMoney(receivable),
          })}
        >
          <Input
            id="fee_pct"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={feePct}
            onChange={(e) => setFeePct(e.target.value)}
          />
        </FormField>
      ) : null}

      {/* Always submits the effective total receivable. */}
      <input type="hidden" name="total_receivable" value={receivable} />

      <FormField
        label={t("loanForm.totalReceivable")}
        htmlFor="total_receivable_input"
        data-tour="lf-total"
        errors={state?.fieldErrors?.total_receivable}
        hint={
          useFee
            ? t("loanForm.totalHintFee")
            : showInstallments
              ? t("loanForm.totalHintSum")
              : t("loanForm.totalHintManual")
        }
      >
        <Input
          id="total_receivable_input"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={useFee || showInstallments ? receivable : manualReceivable}
          onChange={(e) => setManualReceivable(e.target.value)}
          readOnly={useFee || showInstallments}
          className={useFee || showInstallments ? "bg-muted" : undefined}
        />
      </FormField>

      <fieldset className="mb-4 rounded-lg border border-border bg-white p-4 shadow-sm">
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("loanForm.lateSection")}
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          {t("loanForm.lateHint")}
        </p>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField
            label={t("loanForm.lateFee")}
            htmlFor="late_fee_percent"
            errors={state?.fieldErrors?.late_fee_percent}
          >
            <Input
              id="late_fee_percent"
              name="late_fee_percent"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="2"
              defaultValue={loan?.late_fee_percent ?? ""}
            />
          </FormField>
          <FormField
            label={t("loanForm.lateInterest")}
            htmlFor="late_interest_percent_month"
            errors={state?.fieldErrors?.late_interest_percent_month}
          >
            <Input
              id="late_interest_percent_month"
              name="late_interest_percent_month"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="1"
              defaultValue={loan?.late_interest_percent_month ?? ""}
            />
          </FormField>
        </div>
      </fieldset>

      <FormField
        label={t("loanForm.notes")}
        htmlFor="notes"
        errors={state?.fieldErrors?.notes}
      >
        <Textarea id="notes" name="notes" defaultValue={loan?.notes ?? ""} />
      </FormField>

      {allowInstallments ? (
        <div className="mb-4 rounded-lg border border-border bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="rollover"
              checked={rollover}
              onChange={(e) => {
                setRollover(e.target.checked);
                if (e.target.checked) setUseFee(true);
              }}
              className="h-4 w-4 border-border"
            />
            {t("loanForm.rollover")}
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("loanForm.rolloverDescription")}
          </p>

          {rollover ? (
            <>
              {state?.fieldErrors?.total_receivable ? (
                <p className="mt-2 text-xs text-destructive">
                  {state.fieldErrors.total_receivable[0]}
                </p>
              ) : null}
              <div className="mt-4">
                <FormField
                  label={t("loanForm.firstFeeDueDate")}
                  htmlFor="first_due_date"
                  errors={state?.fieldErrors?.first_due_date}
                  hint={
                    fee > 0
                      ? t("loanForm.recurringFeeHint", { fee: formatMoney(fee) })
                      : t("loanForm.recurringFeeNeeded")
                  }
                >
                  <Input
                    id="first_due_date"
                    name="first_due_date"
                    type="date"
                    value={firstDue}
                    onChange={(e) => setFirstDue(e.target.value)}
                  />
                </FormField>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {allowInstallments && !rollover ? (
        <div
          data-tour="lf-installments"
          className="mb-4 rounded-lg border border-border bg-white p-4 shadow-sm"
        >
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="generate_installments"
              checked={generate}
              onChange={(e) => setGenerate(e.target.checked)}
              className="h-4 w-4 border-border"
            />
            {t("loanForm.generate")}
          </label>

          {generate ? (
            <>
              <div className="mt-4 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <FormField
                  label={t("loanForm.installmentCount")}
                  htmlFor="installment_count"
                  errors={state?.fieldErrors?.installment_count}
                >
                  <Input
                    id="installment_count"
                    name="installment_count"
                    type="number"
                    min="1"
                    max="120"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                  />
                </FormField>
                <FormField
                  label={t("loanForm.firstDueDate")}
                  htmlFor="first_due_date"
                  errors={state?.fieldErrors?.first_due_date}
                >
                  <Input
                    id="first_due_date"
                    name="first_due_date"
                    type="date"
                    value={firstDue}
                    onChange={(e) => setFirstDue(e.target.value)}
                  />
                </FormField>
              </div>

              {plan.length > 0 ? (
                <>
                  <input
                    type="hidden"
                    name="installments_json"
                    value={JSON.stringify(plan)}
                  />

                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {useFee ? t("loanForm.pinHint") : t("loanForm.freeHint")}
                    </p>
                    {Object.keys(pinned).length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setPinned({})}
                        className="text-xs text-muted-foreground underline"
                      >
                        {t("loanForm.reset")}
                      </button>
                    ) : null}
                  </div>

                  <div className="border border-border">
                    <table className="w-full text-sm">
                      <tbody>
                        {plan.map((p, i) => {
                          const isSet = pinned[i] != null;
                          // With a fee, unpinned rows show the computed split;
                          // without a fee, rows are blank until typed.
                          const value = isSet
                            ? pinned[i]
                            : useFee
                              ? String(p.amount)
                              : "";
                          return (
                            <tr
                              key={i}
                              className="border-b border-border last:border-0"
                            >
                              <td className="px-3 py-1.5 text-muted-foreground">
                                #{i + 1}
                              </td>
                              <td className="px-3 py-1.5">
                                {formatDate(p.due_date)}
                              </td>
                              <td className="px-2 py-1 text-right">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  value={value}
                                  onChange={(e) => setPin(i, e.target.value)}
                                  className={`h-8 text-right tabular-nums ${
                                    useFee && isSet ? "border-foreground" : ""
                                  }`}
                                  aria-label={`Installment ${i + 1} amount`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border font-medium">
                          <td className="px-3 py-1.5" colSpan={2}>
                            {t("loanForm.total")}
                          </td>
                          <td
                            className={`px-3 py-1.5 text-right tabular-nums ${
                              sumMismatch ? "text-destructive" : ""
                            }`}
                          >
                            {formatMoney(planSum)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {sumMismatch ? (
                    <p className="mt-1 text-xs text-destructive">
                      {t("loanForm.mismatch", {
                        sum: formatMoney(planSum),
                        total: formatMoney(receivable),
                      })}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setUseFee(false);
                          setManualReceivable(String(planSum));
                        }}
                        className="underline"
                      >
                        {t("loanForm.setTotal", { sum: formatMoney(planSum) })}
                      </button>
                    </p>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      <SubmitButton>{submitLabel ?? t("loanForm.submit")}</SubmitButton>
    </form>
  );
}
