import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("app_links")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "error", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      db: "connected",
      app_links_count: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: String(err) },
      { status: 500 }
    );
  }
}
