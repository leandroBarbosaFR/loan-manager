"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ActionState } from "@/lib/action-state";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };
type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastFn | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, type = "success") => {
      const id = (counter += 1);
      setToasts((list) => [...list, { id, message, type }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const t = useT();
  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 rounded-lg bg-white px-4 py-3 text-sm shadow-md"
    >
      <span
        className={cn(
          "mt-1 h-2 w-2 shrink-0 rounded-full",
          item.type === "success" && "bg-success",
          item.type === "error" && "bg-destructive",
          item.type === "info" && "bg-primary",
        )}
        aria-hidden="true"
      />
      <p className="flex-1 text-foreground">{item.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.dismiss")}
        className="-mr-1 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/**
 * Fires a toast whenever a Server Action returns a fresh successful state.
 * `useActionState` returns a new object each submission, so a confirmed action
 * re-toasts even if the previous result was also a success.
 */
export function useActionToast(
  state: ActionState,
  message: string,
  type: ToastType = "success",
) {
  const toast = useToast();
  useEffect(() => {
    if (state?.ok) toast(message, type);
    // Re-run on each new state object (one per submission).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
