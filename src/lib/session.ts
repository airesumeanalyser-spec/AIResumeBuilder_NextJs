import { createServerSupabase } from "@/lib/supabase/server";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<SupabaseUser | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
