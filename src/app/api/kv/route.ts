import { NextRequest, NextResponse } from "next/server";
import {
  kvDelete,
  kvFlush,
  kvGet,
  kvList,
  kvSet,
} from "@/lib/db";
import { createServerSupabase } from "@/lib/supabase/server";

async function requireUserId(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabase();
  const action = request.nextUrl.searchParams.get("action") || "get";

  try {
    if (action === "get") {
      const key = request.nextUrl.searchParams.get("key");
      if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
      }
      const value = await kvGet(supabase, key, userId);
      if (value === null) {
        return NextResponse.json({ error: "Key not found", value: null }, { status: 404 });
      }
      return NextResponse.json({ key, value });
    }

    if (action === "list") {
      const pattern = request.nextUrl.searchParams.get("pattern");
      const values = request.nextUrl.searchParams.get("values");
      if (!pattern) {
        return NextResponse.json({ error: "Pattern is required" }, { status: 400 });
      }
      const returnValues = values === "true" || values === "1";
      const items = await kvList(supabase, pattern, returnValues, userId);
      return NextResponse.json({ pattern, count: items.length, items });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e) {
    console.error("KV GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabase();
  const action = request.nextUrl.searchParams.get("action") || "set";

  try {
    if (action === "set") {
      const body = await request.json();
      const { key, value } = body;
      if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
      }
      if (value === undefined || value === null) {
        return NextResponse.json({ error: "Value is required" }, { status: 400 });
      }
      const str = typeof value === "string" ? value : JSON.stringify(value);
      await kvSet(supabase, key, str, userId);
      return NextResponse.json({ success: true, key });
    }

    if (action === "delete") {
      const body = await request.json();
      const { key } = body;
      if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
      }
      await kvDelete(supabase, key, userId);
      return NextResponse.json({ success: true, key });
    }

    if (action === "flush") {
      await kvFlush(supabase, userId);
      return NextResponse.json({ success: true, message: "All keys flushed" });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e) {
    console.error("KV POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
