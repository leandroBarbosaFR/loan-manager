"use server";

import { revalidatePath } from "next/cache";
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
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  try {
    await createUser(parsed.data);
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
