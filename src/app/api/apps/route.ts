import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, title, iconUrl, description, whatLearned } = body;

  if (!url || !title || !iconUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("app_links")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = existing?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("app_links")
    .insert({
      url,
      title,
      icon_url: iconUrl,
      custom_icon: false,
      description: description ?? null,
      what_learned: whatLearned ?? null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
