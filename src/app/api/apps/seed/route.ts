import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const SEED_URLS = [
  "https://sight-reading-animals.vercel.app/",
  "https://apex-racer.vercel.app/",
  "https://circle-collide-game.vercel.app/",
  "https://pollski.app/",
  "https://www.takeabreath.site/",
];

export async function POST() {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("app_links")
    .select("id")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ seeded: false });
  }

  for (let i = 0; i < SEED_URLS.length; i++) {
    const url = SEED_URLS[i];
    const hostname = new URL(url).hostname.replace("www.", "");
    await supabase.from("app_links").insert({
      url,
      title: hostname,
      icon_url: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      custom_icon: false,
      sort_order: i,
    });
  }

  return NextResponse.json({ seeded: true });
}
