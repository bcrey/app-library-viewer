import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const dbUpdates: Record<string, unknown> = {};
  if (body.title !== undefined) dbUpdates.title = body.title;
  if (body.iconUrl !== undefined) dbUpdates.icon_url = body.iconUrl;
  if (body.customIcon !== undefined) dbUpdates.custom_icon = body.customIcon;
  if (body.description !== undefined) dbUpdates.description = body.description || null;
  if (body.whatLearned !== undefined) dbUpdates.what_learned = body.whatLearned || null;

  const { data, error } = await getSupabaseAdmin()
    .from("app_links")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await getSupabaseAdmin()
    .from("app_links")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
