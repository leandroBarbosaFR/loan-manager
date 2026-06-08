import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, UserRole } from "@/types/database";

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

export async function createUser(input: {
  email: string;
  password: string;
  role: UserRole;
}): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { role: input.role },
  });
  if (error) throw error;

  // The trigger seeds a profile from metadata; upsert to be certain of the role.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: data.user.id, email: input.email, role: input.role });
  if (profileError) throw profileError;
}

export async function deleteUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  // Deleting the auth user cascades to their profile and all owned data.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
