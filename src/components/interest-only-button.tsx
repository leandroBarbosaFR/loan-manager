"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/submit-button";
import { payInterestOnlyAction } from "@/app/(app)/loans/actions";
import { useT } from "@/lib/i18n/context";

/**
 * "Pay interest only" — collects the interest for this period and rolls the
 * principal forward to a chosen date, charging the interest again next period.
 * Works on any loan; the decision is made at payment time.
 */
export function InterestOnlyButton({
  loanId,
  defaultFee,
  defaultNextDue,
}: {
  loanId: string;
  defaultFee: number;
  defaultNextDue: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const action = payInterestOnlyAction.bind(null, loanId);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t("loanDetail.interestOnlyButton")}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("loanDetail.interestOnlyButton")}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {t("loanDetail.interestOnlyHelp")}
        </p>
        <form action={action} className="flex flex-col gap-4">
          <div>
            <label htmlFor="fee" className="mb-1 block text-sm font-medium">
              {t("loanDetail.interestOnlyFee")}
            </label>
            <Input
              id="fee"
              name="fee"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              defaultValue={defaultFee > 0 ? defaultFee : ""}
              required
            />
          </div>
          <div>
            <label
              htmlFor="next_due_date"
              className="mb-1 block text-sm font-medium"
            >
              {t("loanDetail.interestOnlyNextDue")}
            </label>
            <Input
              id="next_due_date"
              name="next_due_date"
              type="date"
              defaultValue={defaultNextDue}
              required
            />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <SubmitButton>{t("loanDetail.interestOnlyConfirm")}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
