import { z } from "zod";

/** Shared shape returned by Server Actions used with `useActionState`. */
export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

/** Converts a ZodError into the ActionState `fieldErrors` shape. */
export function zodToFieldErrors(error: z.ZodError): ActionState {
  return {
    ok: false,
    error: "Please fix the errors below.",
    fieldErrors: error.flatten().fieldErrors,
  };
}
