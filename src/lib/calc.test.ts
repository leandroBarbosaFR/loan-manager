import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  round2,
  distributeInstallments,
  planInstallments,
  effectiveInstallmentStatus,
  nextDueDate,
  deriveLoanStatus,
  loanTotals,
  aggregatePayments,
  lateCharge,
  totalLateCharges,
  renegotiationPrincipal,
} from "@/lib/calc";

describe("round2", () => {
  it("removes binary float drift", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(1.005)).toBe(1.01);
    expect(round2(5.045)).toBe(5.05);
  });

  it("leaves clean values untouched", () => {
    expect(round2(100)).toBe(100);
    expect(round2(33.33)).toBe(33.33);
    expect(round2(0)).toBe(0);
  });

  it("handles negative values", () => {
    expect(round2(-1.005)).toBe(-1);
    expect(round2(-33.335)).toBe(-33.33);
  });
});

describe("distributeInstallments", () => {
  it("splits evenly and puts the rounding remainder on the last one", () => {
    const plan = distributeInstallments(100, 3, "2024-01-15");
    expect(plan.map((p) => p.amount)).toEqual([33.33, 33.33, 33.34]);
    expect(sum(plan)).toBe(100);
  });

  it("advances the due date by one month per installment, clamping the day", () => {
    const plan = distributeInstallments(300, 3, "2024-01-31");
    expect(plan.map((p) => p.due_date)).toEqual([
      "2024-01-31",
      "2024-02-29", // 2024 is a leap year; day clamps to 29
      "2024-03-31",
    ]);
  });

  it("keeps pinned amounts exact and splits the rest", () => {
    const plan = distributeInstallments(100, 3, "2024-01-15", { 1: 50 });
    expect(plan.map((p) => p.amount)).toEqual([25, 50, 25]);
    expect(sum(plan)).toBe(100);
  });

  it("absorbs the remainder on the last UNPINNED installment", () => {
    // 100 over 3, middle pinned at 40 → 60 split across [0,2] = 30 / 30
    const plan = distributeInstallments(100, 3, "2024-01-15", { 1: 40 });
    expect(plan.map((p) => p.amount)).toEqual([30, 40, 30]);
    expect(sum(plan)).toBe(100);
  });

  it("always sums exactly to the total, even with awkward divisions", () => {
    for (const [total, count] of [
      [100, 3],
      [10, 3],
      [0.1, 3],
      [999.99, 7],
      [1, 6],
    ] as const) {
      const plan = distributeInstallments(total, count, "2024-01-15");
      expect(sum(plan)).toBe(round2(total));
      expect(plan).toHaveLength(count);
    }
  });

  it("returns an empty plan for a non-positive count", () => {
    expect(distributeInstallments(100, 0, "2024-01-15")).toEqual([]);
    expect(distributeInstallments(100, -2, "2024-01-15")).toEqual([]);
  });

  it("planInstallments is a plain even split", () => {
    expect(planInstallments(100, 4, "2024-01-15").map((p) => p.amount)).toEqual([
      25, 25, 25, 25,
    ]);
  });
});

describe("status helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("effectiveInstallmentStatus: paid wins regardless of date", () => {
    expect(
      effectiveInstallmentStatus({
        status: "paid",
        due_date: "2020-01-01",
        paid_at: null,
      }),
    ).toBe("paid");
    expect(
      effectiveInstallmentStatus({
        status: "pending",
        due_date: "2020-01-01",
        paid_at: "2020-01-02",
      }),
    ).toBe("paid");
  });

  it("effectiveInstallmentStatus: past unpaid is overdue, future is pending", () => {
    expect(
      effectiveInstallmentStatus({
        status: "pending",
        due_date: "2024-06-10",
        paid_at: null,
      }),
    ).toBe("overdue");
    expect(
      effectiveInstallmentStatus({
        status: "pending",
        due_date: "2024-06-20",
        paid_at: null,
      }),
    ).toBe("pending");
  });

  it("today's due date is still pending (not overdue)", () => {
    expect(
      effectiveInstallmentStatus({
        status: "pending",
        due_date: "2024-06-15",
        paid_at: null,
      }),
    ).toBe("pending");
  });

  it("nextDueDate: earliest unpaid, ignoring paid ones", () => {
    const list = [
      { status: "paid" as const, due_date: "2024-05-01", paid_at: "2024-05-01" },
      { status: "pending" as const, due_date: "2024-08-01", paid_at: null },
      { status: "pending" as const, due_date: "2024-07-01", paid_at: null },
    ];
    expect(nextDueDate(list)).toBe("2024-07-01");
  });

  it("nextDueDate: null when everything is paid or empty", () => {
    expect(nextDueDate([])).toBeNull();
    expect(
      nextDueDate([
        { status: "paid", due_date: "2024-01-01", paid_at: "2024-01-01" },
      ]),
    ).toBeNull();
  });

  it("deriveLoanStatus: open / paid / overdue", () => {
    expect(deriveLoanStatus([])).toBe("open");
    expect(
      deriveLoanStatus([
        { status: "paid", due_date: "2024-01-01", paid_at: "2024-01-01" },
        { status: "paid", due_date: "2024-02-01", paid_at: "2024-02-01" },
      ]),
    ).toBe("paid");
    expect(
      deriveLoanStatus([
        { status: "paid", due_date: "2024-01-01", paid_at: "2024-01-01" },
        { status: "pending", due_date: "2024-06-10", paid_at: null }, // past → overdue
      ]),
    ).toBe("overdue");
    expect(
      deriveLoanStatus([
        { status: "pending", due_date: "2024-07-01", paid_at: null },
      ]),
    ).toBe("open");
  });
});

describe("loanTotals", () => {
  it("sums payments and derives profit & outstanding", () => {
    const totals = loanTotals(
      { principal: 1000, total_receivable: 1200 },
      [{ paid_amount: 600 }, { paid_amount: null }, { paid_amount: 200 }],
    );
    expect(totals).toEqual({
      principal: 1000,
      receivable: 1200,
      profit: 200,
      paid: 800,
      outstanding: 400,
    });
  });

  it("handles no payments", () => {
    const totals = loanTotals({ principal: 500, total_receivable: 500 }, []);
    expect(totals.paid).toBe(0);
    expect(totals.profit).toBe(0);
    expect(totals.outstanding).toBe(500);
  });

  it("avoids float drift when summing many payments", () => {
    const totals = loanTotals(
      { principal: 0, total_receivable: 0.3 },
      [{ paid_amount: 0.1 }, { paid_amount: 0.1 }, { paid_amount: 0.1 }],
    );
    expect(totals.paid).toBe(0.3);
    expect(totals.outstanding).toBe(0);
  });
});

describe("aggregatePayments", () => {
  it("no payments → unpaid", () => {
    expect(aggregatePayments(100, [])).toEqual({
      paid_amount: null,
      paid_at: null,
      status: "pending",
    });
  });

  it("partial payment → accumulates but stays pending (no paid_at)", () => {
    expect(aggregatePayments(100, [{ amount: 40, paid_at: "2024-06-01" }])).toEqual(
      { paid_amount: 40, paid_at: null, status: "pending" },
    );
  });

  it("exact payment → paid, paid_at set", () => {
    expect(
      aggregatePayments(100, [{ amount: 100, paid_at: "2024-06-10" }]),
    ).toEqual({ paid_amount: 100, paid_at: "2024-06-10", status: "paid" });
  });

  it("multiple payments summing to full → paid, paid_at is the latest", () => {
    expect(
      aggregatePayments(100, [
        { amount: 60, paid_at: "2024-06-01" },
        { amount: 40, paid_at: "2024-06-09" },
      ]),
    ).toEqual({ paid_amount: 100, paid_at: "2024-06-09", status: "paid" });
  });

  it("overpayment → paid, keeps the real total", () => {
    expect(
      aggregatePayments(100, [{ amount: 120, paid_at: "2024-06-10" }]),
    ).toEqual({ paid_amount: 120, paid_at: "2024-06-10", status: "paid" });
  });

  it("avoids float drift across several partials", () => {
    expect(
      aggregatePayments(0.3, [
        { amount: 0.1, paid_at: "2024-06-01" },
        { amount: 0.1, paid_at: "2024-06-02" },
        { amount: 0.1, paid_at: "2024-06-03" },
      ]),
    ).toEqual({ paid_amount: 0.3, paid_at: "2024-06-03", status: "paid" });
  });
});

describe("lateCharge", () => {
  const config = { feePercent: 2, interestPercentMonth: 1 };
  const base = {
    amount: 1000,
    due_date: "2024-06-01",
    paid_amount: null,
    paid_at: null,
  };

  it("is zero before the due date", () => {
    expect(lateCharge(base, "2024-05-20", config).total).toBe(0);
  });

  it("is zero on the due date itself", () => {
    expect(lateCharge(base, "2024-06-01", config).total).toBe(0);
  });

  it("is zero once paid", () => {
    expect(
      lateCharge({ ...base, paid_at: "2024-06-05" }, "2024-07-01", config).total,
    ).toBe(0);
  });

  it("fine + one month of interest on the full balance", () => {
    // 30 days late: fee 2% of 1000 = 20; interest 1%/mo * 30/30 = 10
    expect(lateCharge(base, "2024-07-01", config)).toEqual({
      daysLate: 30,
      outstanding: 1000,
      fee: 20,
      interest: 10,
      daily: 0,
      total: 30,
    });
  });

  it("adds a fixed daily fee for each day late", () => {
    // 30 days late, R$5/day = 150; plus fee 20 + interest 10 = 180
    const lc = lateCharge(base, "2024-07-01", { ...config, dailyFee: 5 });
    expect(lc.daysLate).toBe(30);
    expect(lc.daily).toBe(150);
    expect(lc.total).toBe(180);
  });

  it("daily fee alone (no percentages)", () => {
    const lc = lateCharge(base, "2024-06-16", {
      feePercent: 0,
      interestPercentMonth: 0,
      dailyFee: 10,
    });
    expect(lc.daysLate).toBe(15);
    expect(lc.total).toBe(150);
  });

  it("interest is pro-rated by days late", () => {
    // 15 days: interest 1% * 15/30 of 1000 = 5; fee 20
    const lc = lateCharge(base, "2024-06-16", config);
    expect(lc.daysLate).toBe(15);
    expect(lc.interest).toBe(5);
    expect(lc.total).toBe(25);
  });

  it("charges only on the unpaid balance after a partial payment", () => {
    // outstanding 600; 30 days: fee 12, interest 6, total 18
    const lc = lateCharge({ ...base, paid_amount: 400 }, "2024-07-01", config);
    expect(lc.outstanding).toBe(600);
    expect(lc.total).toBe(18);
  });

  it("zero when no rates are configured", () => {
    expect(
      lateCharge(base, "2024-07-01", {
        feePercent: 0,
        interestPercentMonth: 0,
      }).total,
    ).toBe(0);
  });

  it("totalLateCharges sums across installments", () => {
    const list = [
      base, // overdue → 30
      { ...base, paid_at: "2024-06-02" }, // paid → 0
      { ...base, due_date: "2024-12-01" }, // future → 0
    ];
    expect(totalLateCharges(list, "2024-07-01", config)).toBe(30);
  });
});

describe("renegotiationPrincipal", () => {
  it("carries just the outstanding by default", () => {
    expect(
      renegotiationPrincipal(500, 80, {
        includeLateCharges: false,
        discount: 0,
      }),
    ).toBe(500);
  });

  it("adds late charges when requested", () => {
    expect(
      renegotiationPrincipal(500, 80, {
        includeLateCharges: true,
        discount: 0,
      }),
    ).toBe(580);
  });

  it("applies a discount (write-off of the forgiven part)", () => {
    expect(
      renegotiationPrincipal(500, 80, {
        includeLateCharges: true,
        discount: 100,
      }),
    ).toBe(480);
  });

  it("never goes below zero", () => {
    expect(
      renegotiationPrincipal(100, 0, {
        includeLateCharges: false,
        discount: 999,
      }),
    ).toBe(0);
  });
});

function sum(plan: { amount: number }[]): number {
  return round2(plan.reduce((acc, p) => acc + p.amount, 0));
}
