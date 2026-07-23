"use server";

import { revalidatePath } from "next/cache";
import { profileSchema, setPasswordSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { updateOwnProfile } from "@/lib/repositories/users";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    city: formData.get("city"),
    country: formData.get("country"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  await updateOwnProfile(parsed.data);
  revalidatePath("/settings");
  return { ok: true };
}

/**
 * Changes the signed-in user's password after verifying their CURRENT password.
 * Used on the settings page (any user, not just admins).
 */
export async function changeOwnPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = String(formData.get("current_password") ?? "");
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { ok: false, error: fe.confirm ? "password_mismatch" : "weak_password" };
  }
  if (!current) return { ok: false, error: "wrong_current" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "update_failed" };

  // Verify the current password by re-authenticating (same user → just refreshes).
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) return { ok: false, error: "wrong_current" };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: "update_failed" };

  revalidatePath("/settings");
  return { ok: true };
}
