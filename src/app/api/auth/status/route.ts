import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  ensureProfile,
  getTrialUsage,
} from "@/lib/db";

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }

  await ensureProfile(
    supabase,
    user.id,
    user.email,
    (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string)
  );

  const trial = await getTrialUsage(supabase, user.id);

  return NextResponse.json({
    isAuthenticated: true,
    user: {
      uuid: user.id,
      username:
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split("@")[0] ||
        "User",
      email: user.email,
    },
    trial,
    plan_type: trial.remaining > 0 ? "free_trial" : "free_expired",
    name:
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string),
    email: user.email,
    phone: user.user_metadata?.phone as string | undefined,
  });
}
