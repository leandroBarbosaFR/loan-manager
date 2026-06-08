import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { toCsv, type CsvValue } from "@/lib/csv";
import {
  getReport,
  REPORT_LABELS,
  type ReportType,
  type LoanReportRow,
  type CollectionsReportRow,
} from "@/lib/repositories/reports";

const VALID: ReportType[] = ["active", "paid", "overdue", "collections"];

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") as ReportType | null;
  if (!type || !VALID.includes(type)) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  const data = await getReport(type);

  let csv: string;
  if (type === "collections") {
    const rows = data as CollectionsReportRow[];
    csv = toCsv(
      ["Month", "Payments", "Total collected"],
      rows.map((r): CsvValue[] => [r.month, r.count, r.total]),
    );
  } else {
    const rows = data as LoanReportRow[];
    csv = toCsv(
      [
        "Customer",
        "Loan date",
        "Principal",
        "Receivable",
        "Profit",
        "Paid",
        "Outstanding",
        "Status",
      ],
      rows.map((r): CsvValue[] => [
        r.customer,
        r.loan_date,
        r.principal,
        r.receivable,
        r.profit,
        r.paid,
        r.outstanding,
        r.status,
      ]),
    );
  }

  const filename = `${REPORT_LABELS[type].toLowerCase().replace(/\s+/g, "-")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
