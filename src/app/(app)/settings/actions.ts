"use server";

import { revalidatePath } from "next/cache";
import { profileSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { updateOwnProfile } from "@/lib/repositories/users";

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
