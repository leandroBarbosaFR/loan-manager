import "server-only";

const GRAPH_VERSION = "v21.0";

/**
 * Builds a Brazilian E.164 number (digits only, e.g. 5511912345678) from the
 * stored DDD + phone. Returns null if there aren't enough digits.
 */
export function toWhatsappNumber(
  ddd: string | null,
  phone: string | null,
): string | null {
  const digits = `${ddd ?? ""}${phone ?? ""}`.replace(/\D/g, "");
  if (digits.length < 10) return null;
  // Already includes the 55 country code?
  return digits.startsWith("55") ? digits : `55${digits}`;
}

/**
 * Sends an approved WhatsApp template message via the Meta Cloud API.
 * `params` fill the template body placeholders {{1}}, {{2}}, … in order.
 */
export async function sendTemplateMessage(opts: {
  to: string;
  template: string;
  lang: string;
  params: string[];
}): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_TOKEN are not set in the environment.",
    );
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: opts.to,
        type: "template",
        template: {
          name: opts.template,
          language: { code: opts.lang },
          components: opts.params.length
            ? [
                {
                  type: "body",
                  parameters: opts.params.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ]
            : [],
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
  }
}
