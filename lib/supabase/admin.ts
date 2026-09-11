import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

let adminClient: SupabaseClient<Database> | null = null;

export function createAdminClient() {
  if (!adminClient) {
    adminClient = createClient<Database>(getSupabaseUrl(), getSupabaseSecretKey(), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return adminClient;
}
