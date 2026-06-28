"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { newUserSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { requireSuperAdmin } from "@/lib/auth";
import { createUser, deleteUser } from "@/lib/repositories/users";

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = newUserSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    city: formData.get("city"),
    country: formData.get("country"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  try {
    await createUser(parsed.data, `${origin}/auth/callback?next=/reset-password`);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not create the user.",
    };
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<void> {
  const admin = await requireSuperAdmin();
  // Never let an admin delete their own account from here.
  if (admin.id === userId) return;
  await deleteUser(userId);
  revalidatePath("/users");
}
