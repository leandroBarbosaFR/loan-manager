import { describe, expect, it } from "vitest";
import { renderMessage, toWhatsappNumber } from "@/lib/whatsapp";

describe("renderMessage", () => {
  const vars = { nome: "Maria", data: "30/06/2026", valor: "R$ 250,00" };

  it("replaces placeholders (case-insensitive)", () => {
    expect(
      renderMessage("Oi {nome}, sua parcela de {valor} vence em {data}.", vars),
    ).toBe("Oi Maria, sua parcela de R$ 250,00 vence em 30/06/2026.");
    expect(renderMessage("{NOME} / {Data} / {VALOR}", vars)).toBe(
      "Maria / 30/06/2026 / R$ 250,00",
    );
  });

  it("collapses newlines/tabs and 4+ spaces (WhatsApp param rules)", () => {
    expect(renderMessage("a\nb\tc", vars)).toBe("a b c");
    expect(renderMessage("a        b", vars)).toBe("a   b");
  });

  it("trims surrounding whitespace", () => {
    expect(renderMessage("  hello {nome}  ", vars)).toBe("hello Maria");
  });

  it("leaves text without placeholders unchanged", () => {
    expect(renderMessage("Plain message.", vars)).toBe("Plain message.");
  });
});

describe("toWhatsappNumber", () => {
  it("prepends the 55 country code when missing", () => {
    expect(toWhatsappNumber("11", "912345678")).toBe("5511912345678");
  });

  it("keeps the country code when already present", () => {
    expect(toWhatsappNumber(null, "5511912345678")).toBe("5511912345678");
    expect(toWhatsappNumber("55 11", "912345678")).toBe("5511912345678");
  });

  it("strips non-digit characters", () => {
    expect(toWhatsappNumber("(11)", "91234-5678")).toBe("5511912345678");
  });

  it("returns null when there aren't enough digits", () => {
    expect(toWhatsappNumber(null, "123")).toBeNull();
    expect(toWhatsappNumber(null, null)).toBeNull();
  });
});
