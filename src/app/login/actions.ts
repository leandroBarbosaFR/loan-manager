"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Return stable codes (not text); the client localises them.
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string[]> = {};
    if (fe.email) fieldErrors.email = ["invalid_email"];
    if (fe.password) fieldErrors.password = ["password_required"];
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: "invalid_credentials" };
  }

  redirect("/");
}
