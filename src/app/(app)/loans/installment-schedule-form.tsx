"use client";

import { useActionState, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/action-state";
import type { Installment } from "@/types/database";
import { round2 } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/context";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Row = { id: string; due_date: string; amount: string; kind: Installment["kind"] };

export function InstallmentScheduleForm({
  action,
  installments,
}: {
  action: Action;
  installments: Installment[];
}) {
  const t = useT();
  const [state, formAction] = useActionState(action, null);

  const [rows, setRows] = useState<Row[]>(() =>
    installments.map((i) => ({
      id: i.id,
      due_date: i.due_date,
      amount: String(i.amount),
      kind: i.kind,
    })),
  );

  const schedule = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        due_date: r.due_date,
        amount: Number(r.amount) || 0,
      })),
    [rows],
  );
  const total = round2(schedule.reduce((acc, r) => acc + r.amount, 0));

  function update(id: string, field: "due_date" | "amount", value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  function label(row: Row, index: number) {
    if (row.kind === "fee") return t("loanDetail.kindFee");
    if (row.kind === "principal") return t("loanDetail.kindPrincipal");
    return `#${index + 1}`;
  }

  return (
    <form action={formAction}>
      <FormError message={state?.error} />
      {state?.ok ? (
        <div className="mb-4 border border-border bg-muted px-3 py-2 text-sm">
          {t("schedule.updated")}
        </div>
      ) : null}

      <input type="hidden" name="schedule_json" value={JSON.stringify(schedule)} />

      <div className="border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">{t("schedule.dueDate")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("common.amount")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-3 py-1.5 text-muted-foreground">
                  {label(row, i)}
                </td>
                <td className="px-2 py-1">
                  <Input
                    type="date"
                    value={row.due_date}
                    onChange={(e) => update(row.id, "due_date", e.target.value)}
                    className="h-8"
                    aria-label={`${label(row, i)} due date`}
                  />
                </td>
                <td className="px-2 py-1">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={row.amount}
                    onChange={(e) => update(row.id, "amount", e.target.value)}
                    className="h-8 text-right tabular-nums"
                    aria-label={`${label(row, i)} amount`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-medium">
              <td className="px-3 py-1.5" colSpan={2}>
                {t("schedule.total")}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">{t("schedule.note")}</p>

      <div className="mt-4">
        <SubmitButton>{t("schedule.submit")}</SubmitButton>
      </div>
    </form>
  );
}
