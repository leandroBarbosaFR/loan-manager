"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

type Op = "+" | "-" | "×" | "÷";

/** Rounds away binary float noise (e.g. 0.1 + 0.2). */
function clean(n: number): number {
  return Math.round((n + Number.EPSILON) * 1e10) / 1e10;
}

function compute(a: number, op: Op, b: number): number {
  switch (op) {
    case "+":
      return clean(a + b);
    case "-":
      return clean(a - b);
    case "×":
      return clean(a * b);
    case "÷":
      return b === 0 ? NaN : clean(a / b);
  }
}

export function Calculator() {
  const t = useT();
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<number | null>(null);
  const [operator, setOperator] = useState<Op | null>(null);
  // When true, the next digit starts a fresh number (after =, or an operator).
  const [overwrite, setOverwrite] = useState(true);
  const [error, setError] = useState(false);

  const reset = useCallback(() => {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setOverwrite(true);
    setError(false);
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      setError(false);
      if (overwrite) {
        setDisplay(digit === "." ? "0." : digit);
        setOverwrite(false);
        return;
      }
      if (digit === "." && display.includes(".")) return;
      if (display.replace(/[-.]/g, "").length >= 12) return; // cap length
      setDisplay(display === "0" && digit !== "." ? digit : display + digit);
    },
    [display, overwrite],
  );

  const chooseOperator = useCallback(
    (op: Op) => {
      if (error) return;
      const current = Number(display);
      if (previous !== null && operator && !overwrite) {
        const result = compute(previous, operator, current);
        if (!Number.isFinite(result)) {
          setError(true);
          setDisplay(t("calculator.error"));
          setPrevious(null);
          setOperator(null);
          setOverwrite(true);
          return;
        }
        setPrevious(result);
        setDisplay(formatNumber(result));
      } else {
        setPrevious(current);
      }
      setOperator(op);
      setOverwrite(true);
    },
    [display, previous, operator, overwrite, error, t],
  );

  const equals = useCallback(() => {
    if (previous === null || operator === null) return;
    const result = compute(previous, operator, Number(display));
    if (!Number.isFinite(result)) {
      setError(true);
      setDisplay(t("calculator.error"));
    } else {
      setDisplay(formatNumber(result));
    }
    setPrevious(null);
    setOperator(null);
    setOverwrite(true);
  }, [display, previous, operator, t]);

  const toggleSign = useCallback(() => {
    if (error || display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  }, [display, error]);

  const percent = useCallback(() => {
    if (error) return;
    setDisplay(formatNumber(clean(Number(display) / 100)));
    setOverwrite(true);
  }, [display, error]);

  const backspace = useCallback(() => {
    if (error || overwrite) return;
    setDisplay((d) => (d.length <= 1 || (d.length === 2 && d.startsWith("-")) ? "0" : d.slice(0, -1)));
  }, [error, overwrite]);

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const { key } = e;
      if (key >= "0" && key <= "9") inputDigit(key);
      else if (key === ".") inputDigit(".");
      else if (key === "+") chooseOperator("+");
      else if (key === "-") chooseOperator("-");
      else if (key === "*") chooseOperator("×");
      else if (key === "/") {
        e.preventDefault();
        chooseOperator("÷");
      } else if (key === "%") percent();
      else if (key === "Enter" || key === "=") {
        e.preventDefault();
        equals();
      } else if (key === "Backspace") backspace();
      else if (key === "Escape") reset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputDigit, chooseOperator, percent, equals, backspace, reset]);

  return (
    <div className="max-w-xs overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex min-h-[6rem] flex-col items-end justify-end gap-1 bg-muted/40 px-5 py-4">
        <span className="h-4 text-xs text-muted-foreground tabular-nums">
          {previous !== null && operator
            ? `${formatNumber(previous)} ${operator}`
            : ""}
        </span>
        <span className="w-full truncate text-right text-4xl font-light tabular-nums text-foreground">
          {display}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3">
        <Key label="AC" onClick={reset} variant="muted" />
        <Key label="⌫" onClick={backspace} variant="muted" />
        <Key label="%" onClick={percent} variant="muted" />
        <Key label="÷" onClick={() => chooseOperator("÷")} variant="op" active={operator === "÷"} />

        <Key label="7" onClick={() => inputDigit("7")} />
        <Key label="8" onClick={() => inputDigit("8")} />
        <Key label="9" onClick={() => inputDigit("9")} />
        <Key label="×" onClick={() => chooseOperator("×")} variant="op" active={operator === "×"} />

        <Key label="4" onClick={() => inputDigit("4")} />
        <Key label="5" onClick={() => inputDigit("5")} />
        <Key label="6" onClick={() => inputDigit("6")} />
        <Key label="−" onClick={() => chooseOperator("-")} variant="op" active={operator === "-"} />

        <Key label="1" onClick={() => inputDigit("1")} />
        <Key label="2" onClick={() => inputDigit("2")} />
        <Key label="3" onClick={() => inputDigit("3")} />
        <Key label="+" onClick={() => chooseOperator("+")} variant="op" active={operator === "+"} />

        <Key label="±" onClick={toggleSign} />
        <Key label="0" onClick={() => inputDigit("0")} />
        <Key label="." onClick={() => inputDigit(".")} />
        <Key label="=" onClick={equals} variant="op" />
      </div>
    </div>
  );
}

function Key({
  label,
  onClick,
  variant = "default",
  active = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "muted" | "op";
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-14 rounded-lg text-lg font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        variant === "op"
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : variant === "muted"
            ? "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            : "border border-border bg-white text-foreground hover:bg-muted",
        active && "ring-2 ring-ring ring-offset-1",
      )}
    >
      {label}
    </button>
  );
}

/** Formats a number for the display: trims float noise, no thousands separators. */
function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const s = String(clean(n));
  // Keep it from overflowing the display.
  return s.length > 14 ? n.toPrecision(10).replace(/\.?0+$/, "") : s;
}
