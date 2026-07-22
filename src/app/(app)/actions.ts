"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOwnAccentColor } from "@/lib/repositories/users";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Persists the user's accent color (or clears it). Ignores invalid input. */
export async function saveAccentColorAction(color: string | null): Promise<void> {
  const value = color && HEX.test(color) ? color : null;
  await updateOwnAccentColor(value);
}
