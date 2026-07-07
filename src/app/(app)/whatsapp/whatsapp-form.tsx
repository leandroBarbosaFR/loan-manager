"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { UnsavedChangesGuard } from "@/components/unsaved-changes-guard";
import { useActionToast } from "@/components/toast";
import type { ActionState } from "@/lib/action-state";
import type { WhatsappSettings } from "@/types/database";
import { useT } from "@/lib/i18n/context";
import { saveWhatsappSettingsAction } from "./actions";

export function WhatsappForm({ settings }: { settings: WhatsappSettings | null }) {
  const t = useT();
  const [state, formAction] = useActionState(saveWhatsappSettingsAction, null);

  useActionToast(state, t("whatsapp.saved"));

  const sections = [
    {
      title: t("whatsapp.section2d"),
      templateName: "template_2d",
      phraseName: "phrase_2d",
      template: settings?.template_2d ?? "",
      phrase: settings?.phrase_2d ?? "",
    },
    {
      title: t("whatsapp.section1d"),
      templateName: "template_1d",
      phraseName: "phrase_1d",
      template: settings?.template_1d ?? "",
      phrase: settings?.phrase_1d ?? "",
    },
    {
      title: t("whatsapp.sectionDue"),
      templateName: "template_due",
      phraseName: "phrase_due",
      template: settings?.template_due ?? "",
      phrase: settings?.phrase_due ?? "",
    },
  ];

  return (
    <form action={formAction} className="max-w-3xl">
      <UnsavedChangesGuard />
      <FormError message={state?.error} />

      <p className="mb-4 text-xs text-muted-foreground">{t("whatsapp.intro")}</p>

      <label className="mb-4 flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={settings?.enabled ?? false}
          className="h-4 w-4 border-border"
        />
        {t("whatsapp.enabled")}
      </label>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <FormField
          label={t("whatsapp.sendHour")}
          htmlFor="send_time"
          errors={state?.fieldErrors?.send_hour}
        >
          <Input
            id="send_time"
            name="send_time"
            type="time"
            step={900}
            defaultValue={`${String(settings?.send_hour ?? 9).padStart(2, "0")}:${String(settings?.send_minute ?? 0).padStart(2, "0")}`}
            required
          />
        </FormField>
        <FormField
          label={t("whatsapp.timezone")}
          htmlFor="timezone"
          errors={state?.fieldErrors?.timezone}
        >
          <Input
            id="timezone"
            name="timezone"
            defaultValue={settings?.timezone ?? "America/Sao_Paulo"}
            required
          />
        </FormField>
        <FormField
          label={t("whatsapp.lang")}
          htmlFor="lang"
          errors={state?.fieldErrors?.lang}
        >
          <Input
            id="lang"
            name="lang"
            defaultValue={settings?.lang ?? "pt_BR"}
            required
          />
        </FormField>
      </div>

      {sections.map((s) => (
        <fieldset key={s.templateName} className="mb-4 rounded-lg bg-surface p-4 shadow-sm">
          <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {s.title}
          </legend>
          <FormField
            label={t("whatsapp.phrase")}
            htmlFor={s.phraseName}
            hint={t("whatsapp.phraseHint")}
          >
            <Textarea
              id={s.phraseName}
              name={s.phraseName}
              defaultValue={s.phrase}
              rows={3}
              placeholder="Oi {nome}, sua parcela de {valor} vence em {data}."
            />
          </FormField>
          <FormField
            label={t("whatsapp.templateName")}
            htmlFor={s.templateName}
            hint={t("whatsapp.templateNameHint")}
          >
            <Input
              id={s.templateName}
              name={s.templateName}
              defaultValue={s.template}
              placeholder="payment_reminder"
            />
          </FormField>
        </fieldset>
      ))}

      <SubmitButton>{t("whatsapp.save")}</SubmitButton>
    </form>
  );
}
