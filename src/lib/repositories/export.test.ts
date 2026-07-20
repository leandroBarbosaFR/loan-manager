import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { EXPORT_TABLES } from "./export";

/**
 * Completeness guard: the per-user export must cover EVERY table that carries
 * user data. We derive the authoritative set from the schema types and the RLS
 * migrations, then assert EXPORT_TABLES lists all of them — so adding a new
 * owned table without wiring it into the export fails here loudly.
 */
describe("export completeness", () => {
  const listed = new Set<string>(EXPORT_TABLES.map((t) => t.name));

  it("covers every table with an owner_id column in the schema", () => {
    const dbTypes = readFileSync("src/types/database.ts", "utf8");
    // Any table exposed to the typed client that has an `owner_id` field is
    // user-owned data and must be exported.
    const ownedTypes = [...dbTypes.matchAll(/export type (\w+) = \{([^}]*)\}/g)]
      .filter((m) => /\bowner_id\b/.test(m[2] ?? ""))
      .map((m) => m[1])
      .filter((n): n is string => Boolean(n));

    // Map the Type names to table names as they appear in the export list.
    const typeToTable: Record<string, string> = {
      Customer: "customers",
      CustomerDocument: "customer_documents",
      Loan: "loans",
      Installment: "installments",
      Payment: "payments",
      Vehicle: "vehicles",
      VehicleMaintenance: "vehicle_maintenance",
      Rental: "rentals",
      RentalInstallment: "rental_installments",
      RentalPayment: "rental_payments",
      WhatsappSettings: "whatsapp_settings",
    };

    const missing: string[] = [];
    for (const typeName of ownedTypes) {
      const table = typeToTable[typeName];
      // If this fires, a new owned type was added without a table mapping here.
      expect(table, `no table mapping for owned type ${typeName}`).toBeTruthy();
      if (table && !listed.has(table)) missing.push(table);
    }

    expect(missing, `owned tables missing from export: ${missing.join(", ")}`).toEqual([]);
  });

  it("includes the user's own profile row", () => {
    expect(listed.has("profiles")).toBe(true);
    const profiles = EXPORT_TABLES.find((t) => t.name === "profiles");
    expect(profiles?.owner).toBe("id");
  });

  it("scopes every non-profile table by owner_id", () => {
    for (const t of EXPORT_TABLES) {
      if (t.name === "profiles") continue;
      expect(t.owner, `${t.name} must be scoped by owner_id`).toBe("owner_id");
    }
  });
});
