import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

/** Returns the current user or null. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the current user, redirecting to /login if unauthenticated. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** The current user's profile (id, email, role), or null if signed out. */
export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}

export async function getRole(): Promise<UserRole | null> {
  return (await getProfile())?.role ?? null;
}

export async function isSuperAdmin(): Promise<boolean> {
  return (await getRole()) === "super_admin";
}

/** Guards super-admin-only routes/actions; redirects non-admins to the home page. */
export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "super_admin") redirect("/");
  return profile;
}
