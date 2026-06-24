import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatMoney,
  formatDate,
  today,
  addDays,
  addMonths,
  daysBetween,
  addPeriod,
} from "@/lib/format";

describe("formatMoney", () => {
  it("formats BRL with thousands and two decimals", () => {
    const out = formatMoney(1234.5);
    expect(out).toContain("R$");
    expect(out).toContain("1.234,50");
  });

  it("treats null/undefined as zero", () => {
    expect(formatMoney(null)).toContain("0,00");
    expect(formatMoney(undefined)).toContain("0,00");
  });

  it("rounds to two decimals", () => {
    expect(formatMoney(0.1)).toContain("0,10");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as dd/mm/yyyy without timezone drift", () => {
    expect(formatDate("2024-03-09")).toBe("09/03/2024");
    expect(formatDate("2024-12-31")).toBe("31/12/2024");
  });

  it("returns a dash for empty/invalid input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("today", () => {
  afterEach(() => vi.useRealTimers());

  it("returns the current local date as YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00"));
    expect(today()).toBe("2024-06-15");
  });

  it("always matches the YYYY-MM-DD shape", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("addDays", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29"); // leap year
    expect(addDays("2023-02-28", 1)).toBe("2023-03-01"); // non-leap
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01");
  });

  it("subtracts with negative days", () => {
    expect(addDays("2024-01-01", -1)).toBe("2023-12-31");
  });

  it("returns the input unchanged when malformed", () => {
    expect(addDays("bad", 5)).toBe("bad");
  });
});

describe("addPeriod", () => {
  it("daily adds n days", () => {
    expect(addPeriod("2024-06-01", "daily", 0)).toBe("2024-06-01");
    expect(addPeriod("2024-06-01", "daily", 5)).toBe("2024-06-06");
  });
  it("weekly adds n*7 days", () => {
    expect(addPeriod("2024-06-01", "weekly", 2)).toBe("2024-06-15");
  });
  it("monthly adds n months (clamping)", () => {
    expect(addPeriod("2024-01-31", "monthly", 1)).toBe("2024-02-29");
    expect(addPeriod("2024-06-15", "monthly", 3)).toBe("2024-09-15");
  });
});

describe("daysBetween", () => {
  it("counts whole days forward", () => {
    expect(daysBetween("2024-06-01", "2024-06-10")).toBe(9);
    expect(daysBetween("2024-06-01", "2024-06-01")).toBe(0);
  });

  it("is negative when the second date is earlier", () => {
    expect(daysBetween("2024-06-10", "2024-06-01")).toBe(-9);
  });

  it("spans months and years (incl. leap day)", () => {
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2); // leap year
    expect(daysBetween("2024-12-31", "2025-01-01")).toBe(1);
  });

  it("returns 0 for malformed input", () => {
    expect(daysBetween("bad", "2024-01-01")).toBe(0);
  });
});

describe("addMonths", () => {
  it("adds whole months", () => {
    expect(addMonths("2024-01-15", 1)).toBe("2024-02-15");
    expect(addMonths("2024-01-15", 12)).toBe("2025-01-15");
  });

  it("clamps the day to the target month's last day", () => {
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29"); // leap Feb
    expect(addMonths("2023-01-31", 1)).toBe("2023-02-28"); // non-leap Feb
    expect(addMonths("2024-03-31", 1)).toBe("2024-04-30");
  });

  it("returns the input unchanged when malformed", () => {
    expect(addMonths("bad", 3)).toBe("bad");
  });
});
