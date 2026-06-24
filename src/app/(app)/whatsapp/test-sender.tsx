"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useActionToast } from "@/components/toast";
import { useT } from "@/lib/i18n/context";
import { sendTestMessageAction } from "./actions";

export function TestSender() {
  const t = useT();
  const [state, formAction] = useActionState(sendTestMessageAction, null);

  useActionToast(state, t("whatsapp.testSent"));

  return (
    <form action={formAction} className="max-w-3xl">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 items-end gap-x-4 sm:grid-cols-[1fr_1fr_auto]">
        <FormField label={t("whatsapp.testNumber")} htmlFor="test_to">
          <Input id="test_to" name="test_to" placeholder="11912345678" required />
        </FormField>
        <FormField label={t("whatsapp.testWhich")} htmlFor="test_which">
          <Select id="test_which" name="test_which" defaultValue="due">
            <option value="d2">{t("whatsapp.section2d")}</option>
            <option value="d1">{t("whatsapp.section1d")}</option>
            <option value="due">{t("whatsapp.sectionDue")}</option>
          </Select>
        </FormField>
        <div className="mb-4">
          <SubmitButton>{t("whatsapp.sendTest")}</SubmitButton>
        </div>
      </div>
    </form>
  );
}
