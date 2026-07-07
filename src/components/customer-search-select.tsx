"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

/**
 * Searchable single-select that submits the chosen customer's id via a hidden
 * input. Used to link a customer to whoever referred them ("indicação").
 */
export function CustomerSearchSelect({
  name,
  options,
  defaultId,
  placeholder,
  clearLabel,
}: {
  name: string;
  options: Option[];
  defaultId?: string | null;
  placeholder?: string;
  clearLabel?: string;
}) {
  const initial = options.find((o) => o.id === defaultId) ?? null;
  const [selected, setSelected] = useState<Option | null>(initial);
  const [query, setQuery] = useState(initial?.name ?? "");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter((o) => o.name.toLowerCase().includes(q))
      : options;
    return list.slice(0, 8);
  }, [options, query]);

  function choose(o: Option) {
    setSelected(o);
    setQuery(o.name);
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <Input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className={selected && clearLabel ? "pr-16" : undefined}
      />
      {selected && clearLabel ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
        >
          {clearLabel}
        </button>
      ) : null}
      {open && filtered.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-surface py-1 text-sm shadow-md">
          {filtered.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                // Prevent the input's blur from firing before the click.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                className={cn(
                  "block w-full px-3 py-2 text-left hover:bg-muted",
                  selected?.id === o.id && "bg-muted font-medium",
                )}
              >
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
