import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type { NewUserInput, ProfileInput } from "@/lib/validations";

/** Fetches one profile by id (super-admin only — uses the service role). */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Generates a one-time "set your password" link for an existing user WITHOUT
 * sending an email, so it can be delivered by other means (e.g. WhatsApp).
 * Uses a recovery link, which resolves through /auth/confirm to /reset-password.
 */
export async function generateInviteLink(
  email: string,
  origin: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error) throw error;
  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) throw new Error("Could not generate the invite link.");
  return `${origin}/auth/confirm?token_hash=${tokenHash}&type=recovery&next=%2Freset-password`;
}

/** Lists all user profiles (super-admin only — uses the service role). */
export async function listProfiles(): Promise<Profile[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createUser(
  input: NewUserInput,
  redirectTo: string,
): Promise<void> {
  const admin = createAdminClient();
  // Invite by email: Supabase sends a link and the user sets their own password.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: { role: input.role, full_name: input.full_name },
    redirectTo,
  });
  if (error) throw error;

  // The trigger seeds a profile from metadata; upsert to be certain of the data.
  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    email: input.email,
    role: input.role,
    full_name: input.full_name,
    phone: input.phone,
    street: input.street,
    city: input.city,
    country: input.country,
  });
  if (profileError) throw profileError;
}

/** Updates the signed-in user's own profile (RLS scopes it to them). */
export async function updateOwnProfile(input: ProfileInput): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone,
      street: input.street,
      city: input.city,
      country: input.country,
    })
    .eq("id", user.id);
  if (error) throw error;
}

/** Saves the signed-in user's accent color (RLS scopes it to them). */
export async function updateOwnAccentColor(
  color: string | null,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({ accent_color: color })
    .eq("id", user.id);
  if (error) throw error;
}

export async function deleteUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  // Deleting the auth user cascades to their profile and all owned data.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
