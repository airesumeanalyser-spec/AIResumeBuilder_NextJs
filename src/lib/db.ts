import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined,
  displayName: string | undefined
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email ?? null,
      display_name: displayName ?? email?.split("@")[0] ?? "User",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) console.warn("ensureProfile:", error.message);
}

export async function getTrialUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<{ used: number; remaining: number; max: number }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("trial_uses, max_trial_uses")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { used: 0, remaining: 3, max: 3 };
  }
  const used = Number(data.trial_uses) || 0;
  const max = Number(data.max_trial_uses) || 3;
  return { used, remaining: Math.max(0, max - used), max };
}

export async function incrementTrialUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; used: number; remaining: number; max: number }> {
  const { data: row, error: readErr } = await supabase
    .from("profiles")
    .select("trial_uses, max_trial_uses")
    .eq("id", userId)
    .maybeSingle();

  if (readErr || !row) {
    return { success: false, used: 0, remaining: 0, max: 3 };
  }

  const used = (Number(row.trial_uses) || 0) + 1;
  const max = Number(row.max_trial_uses) || 3;

  const { error: updErr } = await supabase
    .from("profiles")
    .update({
      trial_uses: used,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updErr) {
    console.error("incrementTrialUsage:", updErr);
    return { success: false, used: 0, remaining: 0, max };
  }

  return {
    success: true,
    used,
    remaining: Math.max(0, max - used),
    max,
  };
}

export async function canUseFreeTrial(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { remaining } = await getTrialUsage(supabase, userId);
  return remaining > 0;
}

export async function createResume(
  supabase: SupabaseClient,
  data: {
    userId: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    storageUrl?: string;
  }
) {
  const { data: inserted, error } = await supabase
    .from("resumes")
    .insert({
      user_id: data.userId,
      file_name: data.fileName,
      file_path: data.filePath,
      file_size: data.fileSize ?? null,
      mime_type: data.mimeType ?? null,
      storage_url: data.storageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function getResumeById(
  supabase: SupabaseClient,
  id: string,
  userId: string
) {
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getResumesByUserId(
  supabase: SupabaseClient,
  userId: string,
  limit = 50
) {
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function updateResumeAnalysis(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  analysisData: unknown,
  atsScore?: number
) {
  const { data, error } = await supabase
    .from("resumes")
    .update({
      analysis_data: analysisData as Record<string, unknown>,
      ats_score: atsScore ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResume(
  supabase: SupabaseClient,
  id: string,
  userId: string
) {
  await supabase
    .from("resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}

export async function kvGet(
  supabase: SupabaseClient,
  key: string,
  userId: string
) {
  const { data } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", key)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.value ?? null;
}

export async function kvSet(
  supabase: SupabaseClient,
  key: string,
  value: string,
  userId: string
) {
  const { error } = await supabase.from("kv_store").upsert(
    {
      key,
      value,
      user_id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key,user_id" }
  );
  if (error) throw error;
  return true;
}

export async function kvDelete(
  supabase: SupabaseClient,
  key: string,
  userId: string
) {
  await supabase.from("kv_store").delete().eq("key", key).eq("user_id", userId);
  return true;
}

export async function kvList(
  supabase: SupabaseClient,
  pattern: string,
  returnValues: boolean,
  userId: string
) {
  const likePattern = pattern.replace(/\*/g, "%");
  const sel = returnValues ? "key, value" : "key";
  const { data } = await supabase
    .from("kv_store")
    .select(sel)
    .eq("user_id", userId)
    .like("key", likePattern)
    .order("key");

  if (!data) return [];
  if (returnValues) {
    const rows = data as unknown as { key: string; value: string }[];
    return rows.map((r) => ({ key: r.key, value: r.value }));
  }
  const rows = data as unknown as { key: string }[];
  return rows.map((r) => r.key);
}

export async function kvFlush(supabase: SupabaseClient, userId: string) {
  await supabase.from("kv_store").delete().eq("user_id", userId);
  return true;
}
