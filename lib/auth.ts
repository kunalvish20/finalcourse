import { createClient } from "@/lib/supabase/server";
import { COURSE_SLUG } from "@/lib/course";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getCurrentProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,phone_verified,avatar_url")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function hasLifetimeCourseAccess(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_entitlements")
    .select("user_id")
    .eq("user_id", userId)
    .eq("course_slug", COURSE_SLUG)
    .is("revoked_at", null)
    .maybeSingle();
  return Boolean(data);
}
